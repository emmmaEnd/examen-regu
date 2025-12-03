
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabaseClient.js';

const TABLE = 'app_users';

export async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data; // puede ser null
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createUser({ email, password, full_name, phone, role = 'user' }) {
  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ email, password_hash, full_name, phone, role }])
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateLastAccess(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ last_access: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updatePassword(id, newPassword) {
  const password_hash = await bcrypt.hash(newPassword, 10);

  const { data, error } = await supabase
    .from(TABLE)
    .update({ password_hash })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, email, full_name, phone, role, last_access, created_at');

  if (error) throw error;
  return data;
}
