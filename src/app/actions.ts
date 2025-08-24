'use server';

import { categorizeTransaction } from '@/ai/flows/categorize-transaction';
import type { CategorizeTransactionInput, CategorizeTransactionOutput } from '@/ai/flows/categorize-transaction';

export async function suggestCategory(input: CategorizeTransactionInput): Promise<CategorizeTransactionOutput> {
  return await categorizeTransaction(input);
}
