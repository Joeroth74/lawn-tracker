import { useState } from "react";
import { type Client, type NewClient } from "../api/clientsAPI";

interface ClientFormProps {
  mode: "add" | "edit";
  client?: Client;
  onSave: (client: NewClient) => void;
  onCancel: () => void;
}

export default function ClientForm({
  mode,
  client,
  onSave,
  onCancel,
}: ClientFormProps) {
  const [name, setName] = useState(
    mode === "edit" && client ? client.name : "",
  );
  const [phone, setPhone] = useState(
    mode === "edit" && client ? (client.phone ?? "") : "",
  );
  const [email, setEmail] = useState(
    mode === "edit" && client ? (client.email ?? "") : "",
  );
  const [address, setAddress] = useState(
    mode === "edit" && client ? (client.address ?? "") : "",
  );
  const [defaultPrice, setDefaultPrice] = useState(
    mode === "edit" && client ? client.default_price.toString() : "",
  );
  const [notes, setNotes] = useState(
    mode === "edit" && client ? (client.notes ?? "") : "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (
      !defaultPrice ||
      isNaN(Number(defaultPrice)) ||
      Number(defaultPrice) <= 0
    ) {
      newErrors.defaultPrice = "Default price must be a positive number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim(),
      default_price: Number(defaultPrice),
      notes: notes.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-3 border rounded-lg text-[16px] ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-green-600`}
          placeholder="Client name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="client@example.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={`w-full px-3 py-3 border rounded-lg text-[16px] ${errors.address ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-green-600`}
          placeholder="123 Main St, City, State ZIP"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="defaultPrice"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Default Price <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            $
          </span>
          <input
            id="defaultPrice"
            type="number"
            step="0.01"
            min="0"
            value={defaultPrice}
            onChange={(e) => setDefaultPrice(e.target.value)}
            className={`w-full pl-7 pr-3 py-3 border rounded-lg text-[16px] ${errors.defaultPrice ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-green-600`}
            placeholder="0.00"
          />
        </div>
        {errors.defaultPrice && (
          <p className="text-red-500 text-sm mt-1">{errors.defaultPrice}</p>
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
          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-green-600"
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
          {mode === "add" ? "Add Client" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
