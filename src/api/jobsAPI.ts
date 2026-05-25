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
