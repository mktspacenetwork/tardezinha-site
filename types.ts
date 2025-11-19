
import React from 'react';

declare var confetti: any;

export interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

export interface Employee {
  name: string;
  role: string;
}

export interface Confirmation {
  id?: number; // Optional for new inserts, required for reads
  name: string;
  phone: string;
  guests: number;
  transport: boolean;
  created_at?: string; // Supabase generates this automatically
}
