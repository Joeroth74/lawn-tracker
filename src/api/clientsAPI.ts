import { supabase } from "../utils/supabase";
import type { Database } from "../utils/database.types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type NewClient = Database["public"]["Tables"]["clients"]["Insert"];

export async function getClients() {
  const { data, error } = await supabase.from("clients").select("*");

  if (error) {
    console.error("Error fetching clients:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function addClient(client: NewClient) {
  const { data, error } = await supabase
    .from("clients")
    .insert(client)
    .select()
    .single();

  if (error) {
    console.error("Error adding client:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function updateClient(id: string, updates: Partial<NewClient>) {
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating client:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function deleteClient(id: string) {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting client:", error);
    throw new Error(error.message);
  }
}
