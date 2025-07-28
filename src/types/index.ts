export interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  items: Item[];
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  projectDate: string;
  purpose: string[];
}

export interface Quote {
  id: string;
  customer: Customer;
  selectedItems: Item[];
  basePrice: number;
  totalPrice: number;
  createdAt: string;
  status: 'new' | 'analyzing' | 'negotiating' | 'awaiting-signature' | 'approved' | 'awaiting-payment' | 'paid' | 'rejected' | 'completed';
  assignedTo?: string;
  internalNotes?: string;
  finalApprovedAmount?: number;
  contractLink?: string;
  paymentMethod?: string;
  paymentLink?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}