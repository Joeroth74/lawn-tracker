import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { getClients, type Client } from "../api/clientsAPI";
import {
  addJob,
  deleteJob,
  getJobs,
  updateJob,
  type Job,
  type NewJob,
} from "../api/jobsAPI";
import JobCard from "../components/JobCard";
import JobForm from "../components/JobForm";
import { formatDateInputValue } from "../utils/date";

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);

  const [today] = useState(() => new Date());
  const todayStr = formatDateInputValue(today);
  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const [upcomingEndDate] = useState(() => {
    const date = new Date(today);
    date.setDate(today.getDate() + 7);
    return date;
  });

  const todayJobs = jobs.filter((job) => job.scheduled_date === todayStr);
  const upcomingJobs = jobs
    .filter((job) => job.scheduled_date > todayStr)
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
  const upcomingDates = Array.from(
    new Set(upcomingJobs.map((job) => job.scheduled_date)),
  );

  async function refreshJobs() {
    const jobsData = await getJobs(today, upcomingEndDate);
    setJobs(jobsData);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsData, clientsData] = await Promise.all([
          getJobs(today, upcomingEndDate),
          getClients(),
        ]);
        setJobs(jobsData);
        setClients(clientsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load today");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [today, upcomingEndDate]);

  function openAddForm() {
    setFormMode("add");
    setEditingJob(undefined);
  }

  function openEditForm(job: Job) {
    setFormMode("edit");
    setEditingJob(job);
  }

  function closeForm() {
    setFormMode(null);
    setEditingJob(undefined);
  }

  async function handleSave(jobData: NewJob) {
    try {
      if (formMode === "add") {
        await addJob(jobData);
      } else if (formMode === "edit" && editingJob) {
        await updateJob(editingJob.id, jobData);
      }
      await refreshJobs();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save job");
    }
  }

  async function handleDelete(jobId: string) {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await deleteJob(jobId);
      await refreshJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    }
  }

  async function toggleCompleted(jobId: string, isCompleted: boolean) {
    try {
      await updateJob(jobId, { is_completed: !isCompleted });
      await refreshJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job");
    }
  }

  async function togglePaid(jobId: string, isPaid: boolean) {
    try {
      await updateJob(jobId, { is_paid: !isPaid });
      await refreshJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today</h1>
          <p className="text-sm text-gray-500">{todayLabel}</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Job</span>
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && todayJobs.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">No jobs scheduled for today.</p>
        </div>
      )}

      {!loading && !error && todayJobs.length > 0 && (
        <div className="space-y-2">
          {todayJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              client={clients.find((client) => client.id === job.client_id)}
              onToggleCompleted={() =>
                toggleCompleted(job.id, job.is_completed)
              }
              onTogglePaid={() => togglePaid(job.id, job.is_paid)}
              onEdit={() => openEditForm(job)}
              onDelete={() => handleDelete(job.id)}
            />
          ))}
        </div>
      )}

      {!loading && !error && (
        <section className="pt-4 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming</h2>
            <p className="text-sm text-gray-500">Next 7 days</p>
          </div>

          {upcomingJobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">No upcoming jobs scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingDates.map((dateStr) => (
                <div key={dateStr} className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500">
                    {new Date(`${dateStr}T00:00:00`).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </h3>
                  {upcomingJobs
                    .filter((job) => job.scheduled_date === dateStr)
                    .map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        client={clients.find(
                          (client) => client.id === job.client_id,
                        )}
                        onToggleCompleted={() =>
                          toggleCompleted(job.id, job.is_completed)
                        }
                        onTogglePaid={() => togglePaid(job.id, job.is_paid)}
                        onEdit={() => openEditForm(job)}
                        onDelete={() => handleDelete(job.id)}
                      />
                    ))}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {formMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60 md:p-8">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {formMode === "add" ? "Add Job" : "Edit Job"}
              </h2>
              <button
                onClick={closeForm}
                className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <JobForm
              mode={formMode}
              job={editingJob}
              defaultDate={todayStr}
              onSave={handleSave}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
