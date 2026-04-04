"use server";

import { db } from './db';
import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

// Fetch all categories for transactions
export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return data;
}

// Log a new transaction (using node-postgres)
export async function createTransaction(formData: FormData) {
  const amount = formData.get('amount') as string;
  const description = formData.get('description') as string;
  const categoryId = formData.get('category_id') as string;
  const type = formData.get('type') as string;
  const date = formData.get('date') as string;

  const query = `
    INSERT INTO transactions (amount, description, category_id, type, date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const params = [amount, description, categoryId, type, date];
  
  try {
    const res = await db.query(query, params);
    revalidatePath('/');
    revalidatePath('/transactions');
    return res.rows[0];
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Get Budget Overview data for Dashboard
export async function getBudgetOverview() {
  // Direct SQL query using node-postgres for complex calculations
  const query = `
    SELECT 
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income
    FROM transactions
    WHERE date >= date_trunc('month', current_date)
  `;
  
  try {
    const res = await db.query(query);
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching budget overview:', err);
    return { total_expenses: 0, total_income: 0 };
  }
}
