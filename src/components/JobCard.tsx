import type { Job } from "../api/jobsAPI";
import type { Client } from "../api/clientsAPI";
import ActionMenu from "./ActionMenu";

interface JobCardProps {
  job: Job;
  client: Client | undefined;
  onToggleCompleted: () => void;
  onTogglePaid: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function JobCard({
  job,
  client,
  onToggleCompleted,
  onTogglePaid,
  onEdit,
  onDelete,
}: JobCardProps) {
  const cardStyles = job.is_paid
    ? "bg-blue-50 hover:bg-blue-100 border-blue-200"
    : job.is_completed
      ? "bg-green-50 hover:bg-green-100 border-green-200"
      : "bg-white hover:bg-gray-50 border-gray-200";

  return (
    <div className={`p-4 rounded-lg border ${cardStyles} transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900 truncate">
            {client?.name ?? "Unknown"}
          </h4>
          <p className="text-sm text-gray-500 truncate">
            {client?.address ?? ""}
          </p>
          <p className="text-sm font-medium text-gray-700 mt-1">
            ${job.price_charged.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onToggleCompleted}
            className={`
              px-2.5 py-1 text-xs font-medium rounded-md transition-colors
              ${
                job.is_completed
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-green-100"
              }
            `}
          >
            {job.is_completed ? "Completed" : "Complete"}
          </button>
          <button
            onClick={onTogglePaid}
            className={`
              px-2.5 py-1 text-xs font-medium rounded-md transition-colors
              ${
                job.is_paid
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-blue-100"
              }
            `}
          >
            {job.is_paid ? "Paid" : "Paid"}
          </button>
          <ActionMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}
