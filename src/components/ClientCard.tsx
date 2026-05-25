import type { Client } from "../api/clientsAPI";
import ActionMenu from "./ActionMenu";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="text-sm text-gray-500 hover:text-green-600"
            >
              {client.phone}
            </a>
          )}
        </div>
        <ActionMenu
          onEdit={() => onEdit(client)}
          onDelete={() => onDelete(client.id)}
        />
      </div>
      {client.email && (
        <a
          href={`mailto:${client.email}`}
          className="block text-sm text-gray-500 hover:text-green-600"
        >
          {client.email}
        </a>
      )}
      {client.address && (
        <p className="text-sm text-gray-500">{client.address}</p>
      )}
      <p className="text-sm font-medium text-gray-700">
        Default: ${client.default_price.toFixed(2)}
      </p>
    </div>
  );
}
