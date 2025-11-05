export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  plan_value: number;
  plan_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountReceivable {
  id: string;
  customer_id: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  is_recurring: boolean;
  status: 'verde' | 'amarelo' | 'vermelho';
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
    phone?: string;
  };
}

export interface AccountPayable {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  is_recurring: boolean;
  category?: string;
  status: 'verde' | 'amarelo' | 'vermelho';
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data?: any;
  new_data?: any;
  created_at: string;
}

