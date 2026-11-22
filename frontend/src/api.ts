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
  daily_rate: number;
  status: 'Available' | 'Rented' | 'Maintenance';
  created_at: string;
}

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

export interface Rental {
  id: string;
  customer_id: string;
  vehicle_id: string;
  duration_days: number;
  daily_rate_snapshot: number;
  total_cost: number;
  rental_status: 'Ongoing' | 'Completed' | 'Canceled';
  rented_at: string;
  expected_return_at: string;
  returned_at?: string;
  created_at: string;
}

export interface RentalCreate {
  customer_id: string;
  vehicle_id: string;
  duration_days: number;
}

export interface SystemInfo {
  status: string;
  service: string;
  version: string;
  instance_id: string;
  uptime_seconds: number;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';

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

// ==================== Rental APIs ====================

export async function fetchRentals(
  status?: string,
  customerId?: string,
  vehicleId?: string
): Promise<Rental[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (customerId) params.append('customer_id', customerId);
  if (vehicleId) params.append('vehicle_id', vehicleId);

  const url = `${API_BASE}/rentals${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch rentals');
  return res.json();
}

export async function createRental(data: RentalCreate): Promise<Rental> {
  const res = await fetch(`${API_BASE}/rentals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create rental transaction');
  }
  return res.json();
}

export async function returnRental(id: string): Promise<Rental> {
  const res = await fetch(`${API_BASE}/rentals/${id}/return`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to process return');
  }
  return res.json();
}

export async function cancelRental(id: string): Promise<Rental> {
  const res = await fetch(`${API_BASE}/rentals/${id}/cancel`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to cancel rental');
  }
  return res.json();
}
