import { useState, useEffect } from "react";
import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
  type Client,
  type NewClient,
} from "../api/clientsAPI";
import { Plus, X } from "lucide-react";
import ClientForm from "../components/ClientForm";
import ClientCard from "../components/ClientCard";
import ActionMenu from "../components/ActionMenu";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editingClient, setEditingClient] = useState<Client | undefined>(
    undefined,
  );

  useEffect(() => {
    async function fetchClients() {
      try {
        const data = await getClients();
        setClients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clients");
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  function openAddForm() {
    setFormMode("add");
    setEditingClient(undefined);
  }

  function openEditForm(client: Client) {
    setFormMode("edit");
    setEditingClient(client);
  }

  function closeForm() {
    setFormMode(null);
    setEditingClient(undefined);
  }

  async function handleSave(clientData: NewClient) {
    try {
      if (formMode === "add") {
        await addClient(clientData);
      } else if (formMode === "edit" && editingClient) {
        await updateClient(editingClient.id, clientData);
      }
      // Refresh the client list
      const updatedClients = await getClients();
      setClients(updatedClients);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client");
    }
  }

  async function handleDelete(clientId: string) {
    if (
      !confirm(
        "Are you sure you want to delete this client and all their jobs?",
      )
    )
      return;
    try {
      await deleteClient(clientId);
      const updatedClients = await getClients();
      setClients(updatedClients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Client</span>
        </button>
      </div>
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && clients.length === 0 && (
        <p className="text-gray-500">
          No clients yet. Add your first client to get started.
        </p>
      )}
      {!loading && !error && clients.length > 0 && (
        <>
          {/* Mobile card layout */}
          <div className="md:hidden space-y-3">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Desktop table layout */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Default Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {client.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {client.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {client.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                      {client.address ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                      ${client.default_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm overflow-visible">
                      <ActionMenu
                        onEdit={() => openEditForm(client)}
                        onDelete={() => handleDelete(client.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {formMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60 md:p-8">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {formMode === "add" ? "Add Client" : "Edit Client"}
              </h2>
              <button
                onClick={closeForm}
                className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <ClientForm
              mode={formMode}
              client={editingClient}
              onSave={handleSave}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
