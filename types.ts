
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

// Wizard types
export interface WizardData {
  employee: Employee | null;
  employeeRG: string;
  attending: boolean | null;
  companions: Companion[];
  wantsTransport: boolean | null;
  transportSeatsNeeded: number;
  childrenOnLap: number[]; // IDs of children under 5 who will be on lap (free)
  costs: {
    dailyPasses: number;
    transport: number;
    total: number;
    breakdown: {
      adultPasses: number;
      childPasses: number;
      halfPricePasses: number;
      transportSeats: number;
    };
  };
}

export interface CostCalculation {
  dailyPasses: number;
  transport: number;
  total: number;
  breakdown: {
    adultPasses: number; // 13+ years
    childPasses: number; // 0-12 years (half price)
    halfPricePasses: number; // Count of half-price tickets
    transportSeats: number; // Paid transport seats
  };
}
