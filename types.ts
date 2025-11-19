
import React from 'react';

export interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

export interface Employee {
  name: string;
  role: string;
}

export interface Confirmation {
  name: string;
  phone: string;
  guests: number;
  transport: boolean;
  timestamp: string;
}
