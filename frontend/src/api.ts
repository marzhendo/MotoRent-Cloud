export interface Customer {
  id: string;
  name: string;
  phone: string;
  license_number: string;
  status: 'Active' | 'Blacklisted';
  created_at: string;
}

export interface CustomerCreate {
  name: string;
  phone: string;
  license_number: string;
  status: 'Active' | 'Blacklisted';
}

export interface CustomerUpdate {
  name?: string;
  phone?: string;
  license_number?: string;
  status?: 'Active' | 'Blacklisted';
}

export interface SystemInfo {
  status: string;
  service: string;
  version: string;
  instance_id: string;
  uptime_seconds: number;
}

const API_BASE = '/api';

export async function fetchSystemInfo(): Promise<SystemInfo> {
  const res = await fetch(`${API_BASE}/info`);
  if (!res.ok) throw new Error('Failed to fetch system telemetry');
  return res.json();
}

export async function fetchCustomers(status?: string, search?: string): Promise<Customer[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const url = `${API_BASE}/customers${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customers/${id}`);
  if (!res.ok) throw new Error(`Customer ${id} not found`);
  return res.json();
}

export async function createCustomer(data: CustomerCreate): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create customer');
  }
  return res.json();
}

export async function updateCustomer(id: string, data: CustomerUpdate): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update customer');
  }
  return res.json();
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete customer');
  }
}
