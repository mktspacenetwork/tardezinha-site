
import React from 'react';

declare var confetti: any;

export interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

export interface Employee {
  id?: number;
  name: string;
  role: string;
  department: string;
  created_at?: string;
}

export interface Companion {
  id?: number;
  confirmation_id?: number;
  name: string;
  age: number;
  document: string; // RG ou CPF
  type: 'adult' | 'child';
  created_at?: string;
}

export interface Confirmation {
  id?: number;
  employee_id?: number;
  employee_name: string;
  employee_rg: string;
  department: string;
  has_companions: boolean;
  wants_transport: boolean;
  companions?: Companion[];
  total_adults: number;
  total_children: number;
  total_daily_passes: number;
  total_transport: number;
  embarked?: boolean;
  created_at?: string;
  updated_at?: string;
}
