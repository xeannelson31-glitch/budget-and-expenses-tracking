"use server";

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

// Fetch all categories for transactions
export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return data;
}

// Log a new transaction (using Supabase SDK)
export async function createTransaction(formData: FormData) {
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const categoryId = formData.get('category_id') as string;
  const type = formData.get('type') as string;
  const date = formData.get('date') as string;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ amount, description, category_id: categoryId, type, date })
      .select()
      .single();

    if (error) throw error;
    
    revalidatePath('/');
    revalidatePath('/transactions');
    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Get Budget Overview data for Dashboard
export async function getBudgetOverview() {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    if (error) throw error;

    const totals = (data || []).reduce((acc, tx) => {
      const amt = Number(tx.amount);
      if (tx.type === 'expense') acc.total_expenses += Math.abs(amt);
      else if (tx.type === 'income') acc.total_income += amt;
      return acc;
    }, { total_expenses: 0, total_income: 0 });

    return totals;
  } catch (err) {
    console.error('Error fetching budget overview:', err);
    return { total_expenses: 0, total_income: 0 };
  }
}
