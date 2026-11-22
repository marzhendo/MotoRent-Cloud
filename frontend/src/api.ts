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

export interface Vehicle {
  id: string;
  model_name: string;
  category: 'Motor' | 'Mobil';
  plate_number: string;
  daily_rate: int_or_number;
  status: 'Available' | 'Rented' | 'Maintenance';
  created_at: string;
}

type int_or_number = number;

export interface VehicleCreate {
  model_name: string;
  category: 'Motor' | 'Mobil';
  plate_number: string;
  daily_rate: number;
  status: 'Available' | 'Rented' | 'Maintenance';
}

export interface VehicleUpdate {
  model_name?: string;
  category?: 'Motor' | 'Mobil';
  plate_number?: string;
  daily_rate?: number;
  status?: 'Available' | 'Rented' | 'Maintenance';
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

// ==================== Customer APIs ====================

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

// ==================== Vehicle APIs ====================

export async function fetchVehicles(
  category?: string,
  status?: string,
  search?: string
): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const url = `${API_BASE}/vehicles${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function fetchVehicle(id: string): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`);
  if (!res.ok) throw new Error(`Vehicle ${id} not found`);
  return res.json();
}

export async function createVehicle(data: VehicleCreate): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create vehicle');
  }
  return res.json();
}

export async function updateVehicle(id: string, data: VehicleUpdate): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update vehicle');
  }
  return res.json();
}

export async function deleteVehicle(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete vehicle');
  }
}
