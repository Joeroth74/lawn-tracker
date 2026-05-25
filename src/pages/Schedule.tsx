import { useState, useEffect } from "react";
import {
  getJobs,
  addJob,
  updateJob,
  deleteJob,
  type Job,
  type NewJob,
} from "../api/jobsAPI";
import { getClients, type Client } from "../api/clientsAPI";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import JobForm from "../components/JobForm";
import JobCard from "../components/JobCard";
import { formatDateInputValue } from "../utils/date";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getVisibleCalendarRange(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDate = new Date(year, month, 1 - firstDayOfMonth);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 41);

  return { startDate, endDate };
}

export default function Schedule() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);

  async function refreshVisibleJobs() {
    const { startDate, endDate } = getVisibleCalendarRange(currentMonth);
    const jobsData = await getJobs(startDate, endDate);
    setJobs(jobsData);
  }

  // Fetch jobs and clients when the visible calendar range changes
  useEffect(() => {
    async function fetchData() {
      try {
        const { startDate, endDate } = getVisibleCalendarRange(currentMonth);
        const [jobsData, clientsData] = await Promise.all([
          getJobs(startDate, endDate),
          getClients(),
        ]);
        setJobs(jobsData);
        setClients(clientsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentMonth]);

  const today = new Date();
  const todayStr = formatDateInputValue(today);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, 1 - firstDayOfMonth + index);

    return {
      day: date.getDate(),
      dateStr: formatDateInputValue(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });

  // Get jobs for a specific date
  function getJobsForDate(dateStr: string): Job[] {
    return jobs.filter((job) => job.scheduled_date === dateStr);
  }

  // Get client name by ID
  function getClientName(clientId: string): string {
    if (!clientId) return "unknown";
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown";
  }

  // Check if all jobs for a date are completed
  function allJobsCompleted(dateStr: string): boolean {
    const dayJobs = getJobsForDate(dateStr);
    if (dayJobs.length === 0) return false;
    return dayJobs.every((job) => job.is_completed);
  }

  // Check if all jobs for a date are paid
  function allJobsPaid(dateStr: string): boolean {
    const dayJobs = getJobsForDate(dateStr);
    if (dayJobs.length === 0) return false;
    return dayJobs.every((job) => job.is_paid);
  }

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  function handleDayClick(dateStr: string) {
    setSelectedDate(dateStr);
  }

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
      await refreshVisibleJobs();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save job");
    }
  }

  async function handleDelete(jobId: string) {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(jobId);
      await refreshVisibleJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    }
  }

  async function toggleCompleted(jobId: string, isCompleted: boolean) {
    try {
      await updateJob(jobId, { is_completed: !isCompleted });
      await refreshVisibleJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job");
    }
  }

  async function togglePaid(jobId: string, isPaid: boolean) {
    try {
      await updateJob(jobId, { is_paid: !isPaid });
      await refreshVisibleJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job");
    }
  }

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const selectedJobs = selectedDate ? getJobsForDate(selectedDate) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
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

      {!loading && !error && (
        <>
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Desktop: Full Calendar Grid */}
          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="py-2.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {calendarCells.map((cell, index) => {
                  const dayJobs = getJobsForDate(cell.dateStr);
                  const isToday = cell.dateStr === todayStr;
                  const isSelected = cell.dateStr === selectedDate;

                  return (
                    <button
                      key={index}
                      onClick={() => handleDayClick(cell.dateStr)}
                      className={`
                        relative min-h-20 p-2 pt-6 text-left border-b border-r border-gray-100 last:border-r-0 transition-all
                        ${!cell.isCurrentMonth ? "bg-gray-50/50" : "bg-white"}
                        ${
                          isSelected
                            ? "ring-2 ring-inset ring-green-500 z-10"
                            : ""
                        }
                        ${isToday && !isSelected ? "bg-green-50/70" : ""}
                        hover:bg-gray-50/80
                      `}
                    >
                      <span
                        className={`
                          absolute top-1.5 left-2 inline-flex items-center justify-center w-5 h-5 rounded text-sm font-semibold
                          ${
                            isToday
                              ? "bg-green-600 text-white shadow-sm"
                              : cell.isCurrentMonth
                                ? "text-gray-700"
                                : "text-gray-300"
                          }
                        `}
                      >
                        {cell.day}
                      </span>
                      {dayJobs.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {dayJobs.slice(0, 3).map((job) => (
                            <div
                              key={job.id}
                              className={`
                                text-xs truncate px-1.5 py-0.5 rounded-md font-medium
                                ${
                                  job.is_paid
                                    ? "bg-blue-50 text-blue-600"
                                    : job.is_completed
                                      ? "bg-green-50 text-green-600"
                                      : "bg-gray-50 text-gray-500"
                                }
                              `}
                            >
                              {getClientName(job.client_id!)}
                            </div>
                          ))}
                          {dayJobs.length > 3 && (
                            <div className="text-xs text-gray-400 px-1 font-medium">
                              +{dayJobs.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expanded day view */}
            {selectedDate && selectedJobs.length > 0 && (
              <div className="mt-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </h3>
                <div className="space-y-2">
                  {selectedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      client={clients.find((c) => c.id === job.client_id)}
                      onToggleCompleted={() =>
                        toggleCompleted(job.id, job.is_completed)
                      }
                      onTogglePaid={() => togglePaid(job.id, job.is_paid)}
                      onEdit={() => openEditForm(job)}
                      onDelete={() => handleDelete(job.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span>All completed</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>All paid</span>
              </div>
            </div>
          </div>

          {/* Mobile: Compact Calendar */}
          <div className="md:hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {calendarCells.map((cell, index) => {
                  const dayJobs = getJobsForDate(cell.dateStr);
                  const isToday = cell.dateStr === todayStr;
                  const isSelected = cell.dateStr === selectedDate;
                  const isCompleted = allJobsCompleted(cell.dateStr);
                  const isPaid = allJobsPaid(cell.dateStr);

                  return (
                    <button
                      key={index}
                      onClick={() => handleDayClick(cell.dateStr)}
                      className={`
                        relative aspect-square flex flex-col items-center justify-center border-b border-r border-gray-100 last:border-r-0
                        ${!cell.isCurrentMonth ? "bg-gray-50/50" : "bg-white"}
                        ${
                          isSelected
                            ? "ring-2 ring-inset ring-green-500 z-10"
                            : ""
                        }
                        ${isToday && !isSelected ? "bg-green-50/70" : ""}
                        hover:bg-gray-50/80 transition-colors
                      `}
                    >
                      <span
                        className={`
                          inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold
                          ${
                            isToday
                              ? "bg-green-600 text-white shadow-sm"
                              : cell.isCurrentMonth
                                ? "text-gray-700"
                                : "text-gray-300"
                          }
                        `}
                      >
                        {cell.day}
                      </span>
                      {dayJobs.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {isCompleted && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          )}
                          {isPaid && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile: Day jobs below calendar */}
            {selectedDate && selectedJobs.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </h3>
                </div>
                <div className="space-y-2">
                  {selectedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      client={clients.find((c) => c.id === job.client_id)}
                      onToggleCompleted={() =>
                        toggleCompleted(job.id, job.is_completed)
                      }
                      onTogglePaid={() => togglePaid(job.id, job.is_paid)}
                      onEdit={() => openEditForm(job)}
                      onDelete={() => handleDelete(job.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Job Form Modal */}
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
              defaultDate={selectedDate ?? undefined}
              onSave={handleSave}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
