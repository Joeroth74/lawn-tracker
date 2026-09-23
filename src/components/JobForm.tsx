import { useState, useEffect, useRef } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
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

function formatDateForDisplay(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${month} / ${day} / ${year}` : value;
}

function formatDateTextInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits.length === 2 ? `${digits} / ` : digits;
  }

  if (digits.length <= 4) {
    const monthAndDay = `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    return digits.length === 4 ? `${monthAndDay} / ` : monthAndDay;
  }

  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
}

function parseDateText(value: string) {
  const trimmedValue = value.trim();
  const match = /^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/.exec(
    trimmedValue,
  );

  if (!match) return "";

  const [, month, day, year] = match;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
  const isValidDate =
    parsedDate.getFullYear() === Number(year) &&
    parsedDate.getMonth() === Number(month) - 1 &&
    parsedDate.getDate() === Number(day);

  return isValidDate
    ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    : "";
}

export default function JobForm({
  mode,
  job,
  defaultDate,
  onSave,
  onCancel,
}: JobFormProps) {
  const initialScheduledDate =
    mode === "edit" && job?.scheduled_date
      ? job.scheduled_date
      : (defaultDate ?? formatDateInputValue(new Date()));
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientLoadError, setClientLoadError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    mode === "edit" && job?.client_id ? job.client_id : "",
  );
  const [scheduledDate, setScheduledDate] = useState<string>(
    initialScheduledDate,
  );
  const [dateText, setDateText] = useState<string>(
    formatDateForDisplay(initialScheduledDate),
  );
  const datePickerRef = useRef<HTMLInputElement>(null);
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
        setClientLoadError(
          err instanceof Error ? err.message : "Failed to load clients",
        );
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

  function handleDateTextChange(value: string) {
    const formattedValue = formatDateTextInput(value);
    setDateText(formattedValue);
    setScheduledDate(parseDateText(formattedValue));
  }

  function handleDatePickerChange(value: string) {
    setScheduledDate(value);
    setDateText(formatDateForDisplay(value));
  }

  function openDatePicker() {
    const datePicker = datePickerRef.current;
    if (!datePicker) return;

    const datePickerWithShowPicker = datePicker as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (datePickerWithShowPicker.showPicker) {
      datePickerWithShowPicker.showPicker();
    } else {
      datePicker.click();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!selectedClientId) newErrors.clientId = "Please select a client";
    if (!scheduledDate) {
      newErrors.scheduledDate = dateText
        ? "Enter a valid date"
        : "Date is required";
    }
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
        <div className="relative w-full min-w-0">
          <select
            id="client"
            value={selectedClientId}
            onChange={(e) => handleClientChange(e.target.value)}
            className={`block w-full min-w-0 appearance-none px-3 pr-10 py-3 border rounded-lg text-[16px] ${errors.clientId ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-green-600`}
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
          <ChevronDown
            aria-hidden="true"
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
        {clientLoadError && (
          <p className="text-red-500 text-sm mt-1">{clientLoadError}</p>
        )}
        {errors.clientId && (
          <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date <span className="text-red-500">*</span>
        </label>
        <div className="relative hidden w-full min-w-0 md:block">
          <input
            id="scheduledDateDesktop"
            type="text"
            inputMode="numeric"
            value={dateText}
            onChange={(e) => handleDateTextChange(e.target.value)}
            onBlur={() => {
              if (scheduledDate) {
                setDateText(formatDateForDisplay(scheduledDate));
              }
            }}
            aria-label="Scheduled date"
            placeholder="MM / DD / YYYY"
            className={`block w-full min-w-0 max-w-full box-border px-3 pr-12 py-3 border rounded-lg text-[16px] ${errors.scheduledDate ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-green-600`}
          />
          <button
            type="button"
            onClick={openDatePicker}
            aria-label="Open date picker"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <CalendarDays aria-hidden="true" size={18} />
          </button>
          <input
            ref={datePickerRef}
            type="date"
            value={scheduledDate}
            onChange={(e) => handleDatePickerChange(e.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute h-px w-px opacity-0"
          />
        </div>
        <div className="relative w-full min-w-0 md:hidden">
          <div
            aria-hidden="true"
            className={`block w-full min-w-0 max-w-full box-border px-3 pr-10 py-3 border rounded-lg text-[16px] ${errors.scheduledDate ? "border-red-500" : "border-gray-300"}`}
          >
            {formatDateForDisplay(scheduledDate)}
          </div>
          <input
            id="scheduledDateMobile"
            type="date"
            value={scheduledDate}
            onChange={(e) => handleDatePickerChange(e.target.value)}
            aria-label="Scheduled date"
            className="absolute inset-0 z-10 h-full cursor-pointer opacity-0 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <CalendarDays
            aria-hidden="true"
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
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
            className={`w-full pl-7 pr-3 py-3 border rounded-lg text-[16px] ${errors.priceCharged ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-green-600`}
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
          {mode === "add" ? "Add Job" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
