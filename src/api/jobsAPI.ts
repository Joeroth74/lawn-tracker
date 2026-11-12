import { supabase } from "../utils/supabase";
import type { Database } from "../utils/database.types";
import { formatDateInputValue } from "../utils/date";

export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type NewJob = Database["public"]["Tables"]["jobs"]["Insert"];

export async function getJobs(startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .gte("scheduled_date", formatDateInputValue(startDate))
    .lte("scheduled_date", formatDateInputValue(endDate));

  if (error) {
    console.error("Error fetching jobs:", error);
    throw new Error(error.message);
  }
  return data;
}

export type IncomeTotals = {
  paidCents: number;
  unpaidCents: number;
};

type ClientIncome = IncomeTotals & {
  id: string | null;
  name: string;
  completedJobs: number;
};

export async function getJobIncome(
  startDate: Date,
  endDate: Date,
  signal: AbortSignal,
) {
  const firstDate = formatDateInputValue(startDate);
  const lastDate = formatDateInputValue(endDate);
  const pageSize = 500;
  const clients = new Map<string | null, ClientIncome>();
  const totals: IncomeTotals = { paidCents: 0, unpaidCents: 0 };
  let lastId: string | undefined;

  // A full year can exceed the number of rows Supabase returns per request.
  while (true) {
    const query = supabase
      .from("jobs")
      .select("id, client_id, price_charged, is_paid, clients(name)")
      .eq("is_completed", true)
      .gte("scheduled_date", firstDate)
      .lte("scheduled_date", lastDate)
      .order("id")
      .limit(pageSize);

    if (lastId) query.gt("id", lastId);

    const { data, error } = await query.abortSignal(signal);
    if (error) throw new Error(error.message);

    for (const job of data) {
      const client = clients.get(job.client_id) ?? {
        id: job.client_id,
        name: job.clients?.name ?? "Unknown client",
        completedJobs: 0,
        paidCents: 0,
        unpaidCents: 0,
      };
      const jobCents = Math.round(job.price_charged * 100);
      const paymentTotal = job.is_paid ? "paidCents" : "unpaidCents";
      client.completedJobs += 1;
      client[paymentTotal] += jobCents;
      clients.set(job.client_id, client);
      totals[paymentTotal] += jobCents;
      lastId = job.id;
    }

    if (data.length < pageSize) break;
  }

  return {
    totals,
    clientTotals: [...clients.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  };
}

export async function addJob(job: NewJob) {
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select()
    .single();

  if (error) {
    console.error("Error adding job:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function updateJob(id: string, updates: Partial<NewJob>) {
  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating job:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function deleteJob(id: string) {
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting job:", error);
    throw new Error(error.message);
  }
}
