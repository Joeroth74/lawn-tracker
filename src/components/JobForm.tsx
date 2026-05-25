import { useState, useEffect } from "react";
import { getClients, type Client } from "../api/clientsAPI";
import { type Job, type NewJob } from "../api/jobsAPI";
import { formatDateInputValue } from "../utils/date";

interface JobFormProps {
  mode: "add" | "edit";
  job?: Job;
  defaultDate?: string;
  onSave: (job: NewJob) => void;
  onCancel: () => void;
}

export default function JobForm({
  mode,
  job,
  defaultDate,
  onSave,
  onCancel,
}: JobFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    mode === "edit" && job?.client_id ? job.client_id : "",
  );
  const [scheduledDate, setScheduledDate] = useState<string>(
    mode === "edit" && job?.scheduled_date
      ? job.scheduled_date
      : (defaultDate ?? formatDateInputValue(new Date())),
  );
  const [priceCharged, setPriceCharged] = useState<string>(
    mode === "edit" && job ? job.price_charged.toString() : "",
  );
  const [notes, setNotes] = useState<string>(
    mode === "edit" && job?.job_notes ? job.job_notes : "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchClients() {
      try {
        const data = await getClients();
        setClients(data);
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setLoadingClients(false);
      }
    }
    fetchClients();
  }, []);

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);

    if (mode === "add" && !job) {
      const client = clients.find((c) => c.id === clientId);
      setPriceCharged(client ? client.default_price.toString() : "");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!selectedClientId) newErrors.clientId = "Please select a client";
    if (!scheduledDate) newErrors.scheduledDate = "Date is required";
    if (
      !priceCharged ||
      isNaN(Number(priceCharged)) ||
      Number(priceCharged) <= 0
    ) {
      newErrors.priceCharged = "Price must be a positive number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      client_id: selectedClientId,
      scheduled_date: scheduledDate,
      price_charged: Number(priceCharged),
      job_notes: notes.trim() || null,
      is_completed: mode === "edit" && job ? job.is_completed : false,
      is_paid: mode === "edit" && job ? job.is_paid : false,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="client"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Client <span className="text-red-500">*</span>
        </label>
        <select
          id="client"
          value={selectedClientId}
          onChange={(e) => handleClientChange(e.target.value)}
          className={`w-full px-3 py-3 border rounded-lg text-[16px] ${errors.clientId ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-green-500`}
        >
          <option value="">Select a client</option>
          {loadingClients ? (
            <option>Loading...</option>
          ) : (
            clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))
          )}
        </select>
        {errors.clientId && (
          <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="scheduledDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="scheduledDate"
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className={`w-full px-3 py-3 border rounded-lg text-[16px] ${errors.scheduledDate ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {errors.scheduledDate && (
          <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="priceCharged"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Price Charged <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            $
          </span>
          <input
            id="priceCharged"
            type="number"
            step="0.01"
            min="0"
            value={priceCharged}
            onChange={(e) => setPriceCharged(e.target.value)}
            className={`w-full pl-7 pr-3 py-3 border rounded-lg text-[16px] ${errors.priceCharged ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="0.00"
          />
        </div>
        {errors.priceCharged && (
          <p className="text-red-500 text-sm mt-1">{errors.priceCharged}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          {mode === "add" ? "Add Job" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
