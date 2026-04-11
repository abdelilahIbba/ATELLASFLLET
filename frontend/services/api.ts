/**
 * api.ts — Centralized HTTP client for the Laravel backend.
 *
 * In development: Vite proxies /api/* → http://localhost:8000/api/*
 * In production:  VITE_API_BASE_URL should be the full origin, e.g. https://api.example.com/api
 *
 * Auth:  Sanctum token-based.  The token is stored under `auth_token` in
 *        localStorage and sent in every request as `Authorization: Bearer <token>`.
 */

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------
// Prefer the explicit env var (set at build time via Dockerfile ARG or Vercel env).
// Fall back to the hardcoded production URL only when nothing is configured.
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.PROD ? 'https://atellasfleet-backend.onrender.com/api' : '/api');

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
export const getToken = (): string | null => localStorage.getItem('auth_token');
export const setToken = (token: string): void => localStorage.setItem('auth_token', token);
export const clearToken = (): void => localStorage.removeItem('auth_token');

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Pass a FormData body directly (skips JSON serialisation) */
  formData?: FormData;
  /** Extra headers merged on top of defaults */
  headers?: Record<string, string>;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
  /** Suggested alternative booking window returned by the server on a 422 conflict */
  suggested_slot?: { start: string; end: string };
  /** Occupied unit numbers returned by the server on a 422 conflict */
  occupied_units?: number[];
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, formData, headers: extraHeaders = {} } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...extraHeaders,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };

  if (formData) {
    // Let the browser set multipart/form-data boundary automatically
    init.body = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, init);

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const err: ApiError = {
      message:        data?.message        ?? `HTTP ${response.status}`,
      errors:         data?.errors,
      status:         response.status,
      suggested_slot: data?.suggested_slot,
      occupied_units: data?.occupied_units,
    };
    throw err;
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------
export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', headers }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  upload: <T>(endpoint: string, formData: FormData, method: 'POST' | 'PUT' | 'PATCH' = 'POST') =>
    request<T>(endpoint, { method, formData }),
};

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------
export interface LoginPayload  { email: string; password: string }
export interface RegisterPayload extends LoginPayload {
  name: string;
  password_confirmation?: string;  // required by Laravel 'confirmed' rule
  phone?: string;
  national_id?: string;
  driver_license_number?: string;
}
/** Shape returned by POST /api/login and POST /api/register */
export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    kyc_status: string;
    avatar: string | null;
    phone?: string | null;
    national_id?: string | null;
    driver_license_number?: string | null;
  };
}

export const authApi = {
  /** POST /api/login */
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/login', payload),

  /** POST /api/register */
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/register', payload),

  /** POST /api/logout  (requires auth token) */
  logout: () =>
    api.post<{ message: string }>('/logout', {}),

  /** GET /api/me  (requires auth token) */
  me: () =>
    api.get<{ user: AuthResponse['user'] }>('/me'),
};

// ---------------------------------------------------------------------------
// Cars / Fleet
// ---------------------------------------------------------------------------
export const carsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return api.get<{ data: unknown[] }>(`/cars${qs}`);
  },
  get: (id: number | string) => api.get<{ data: unknown }>(`/cars/${id}`),
  checkAvailability: (payload: { car_id: number | string; start_date: string; end_date: string }) =>
    api.post<{ available: boolean; remaining_units?: number; suggested_slot?: { start: string; end: string } }>(
      '/cars/check-availability',
      payload,
    ),
  bookedPeriods: (carId: number | string) =>
    api.get<{ total_units: number; booked_periods: { start: string; end: string }[] }>(
      `/cars/${carId}/booked-periods`,
    ),
};

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------
export interface CostBreakdown {
  days: number;
  daily_price: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  security_deposit_rate: number;
  security_deposit: number;
  total: number;
  car: { id: number; name: string };
}

export interface VerifyIdentityResponse {
  verified: boolean;
  first_name: string;
  last_name: string;
  national_id_number: string | null;   // null when OCR couldn't extract a document number
  driver_license_number: string | null;
  message: string;
}

export const bookingsApi = {
  list: () => api.get<{ data: unknown[] }>('/bookings'),
  get: (id: number | string) => api.get<{ data: unknown }>(`/bookings/${id}`),
  create: (payload: unknown) => api.post<{ data: unknown }>('/bookings', payload),
  updateStatus: (id: number | string, status: string) =>
    api.patch<{ data: unknown }>(`/bookings/${id}/status`, { status }),

  /**
   * Step 2 — POST /api/bookings/verify-identity
   * Sends extracted OCR fields + optional document files.
   * Backend compares names and sets kyc_status=Verified on match.
   */
  verifyIdentity: (formData: FormData) =>
    api.upload<VerifyIdentityResponse>('/bookings/verify-identity', formData),

  /**
   * Step 3 — POST /api/bookings/calculate-cost
   * Pure cost calculation; no DB write.
   */
  calculateCost: (payload: { car_id: number | string; start_date: string; end_date: string }) =>
    api.post<CostBreakdown>('/bookings/calculate-cost', payload),

  /**
   * Step 4 — POST /api/bookings/finalize
   * Full server-side validation + confirmed booking creation + confirmation email.
   */
  finalizeReservation: (payload: {
    car_id: number | string;
    start_date: string;
    end_date: string;
    pickup_latitude: number;
    pickup_longitude: number;
    pickup_address?: string;
    notes?: string;
  }) => api.post<{ message: string; booking: unknown; cost: CostBreakdown }>('/bookings/finalize', payload),
};

// ---------------------------------------------------------------------------
// Admin — Cars
// ---------------------------------------------------------------------------
export const adminCarsApi = {
  /**
   * GET /api/admin/cars — authenticated admin endpoint, scoped by demo_account_id.
   */
  list: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return api.get<{ data: unknown[] }>(`/admin/cars${qs}`);
  },
  create: (formData: FormData) => api.upload<{ message: string; car: unknown }>('/admin/cars', formData),
  /**
   * PHP does not parse multipart bodies for PUT requests, so we send as POST
   * with _method=PUT and let Laravel's method-spoofing handle it.
   */
  update: (id: number | string, formData: FormData) => {
    formData.set('_method', 'PUT');
    return api.upload<{ message: string; car: unknown }>(`/admin/cars/${id}`, formData, 'POST');
  },
  delete: (id: number | string) => api.delete<void>(`/admin/cars/${id}`),
  updateGps: (id: number | string, lat: number, lng: number) =>
    api.patch<{ data: unknown }>(`/admin/cars/${id}/gps`, { latitude: lat, longitude: lng }),
};

// ---------------------------------------------------------------------------
// Admin — Bookings
// ---------------------------------------------------------------------------
export const adminBookingsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return api.get<{ data: any[] }>(`/admin/bookings${qs}`);
  },
  get: (id: number | string) => api.get<{ booking: unknown }>(`/admin/bookings/${id}`),
  create: (payload: Record<string, unknown>) =>
    api.post<{ message: string; booking: unknown }>('/admin/bookings', payload),
  update: (id: number | string, payload: Record<string, unknown>) =>
    api.put<{ message: string; booking: unknown }>(`/admin/bookings/${id}`, payload),
  updateStatus: (id: number | string, status: string, paymentStatus?: string, notes?: string) =>
    api.put<{ message: string; booking: unknown }>(`/admin/bookings/${id}/status`, {
      status,
      ...(paymentStatus !== undefined && { payment_status: paymentStatus }),
      ...(notes          !== undefined && { notes }),
    }),
  delete: (id: number | string) => api.delete<void>(`/admin/bookings/${id}`),
};

// ---------------------------------------------------------------------------
// Admin — Clients
// ---------------------------------------------------------------------------
export const adminClientsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return api.get<{ data: unknown[] }>(`/admin/clients${qs}`);
  },
  get: (id: number | string) => api.get<{ client: unknown }>(`/admin/clients/${id}`),
  create: (formData: FormData) =>
    api.upload<{ message: string; client: unknown }>('/admin/clients', formData),
  /**
   * PHP does not parse multipart bodies for PUT, so we POST with _method=PUT.
   * This allows file uploads (avatar, doc_id_front, etc.) alongside text fields.
   */
  update: (id: number | string, formData: FormData) => {
    formData.set('_method', 'PUT');
    return api.upload<{ message: string; client: unknown }>(`/admin/clients/${id}`, formData, 'POST');
  },
  updateKyc: (id: number | string, kyc_status: string) =>
    api.patch<{ message: string; kyc_status: string }>(`/admin/clients/${id}/kyc`, { kyc_status }),
  delete: (id: number | string) => api.delete<void>(`/admin/clients/${id}`),
};

// ---------------------------------------------------------------------------
// Admin — Reviews
// ---------------------------------------------------------------------------
export const adminReviewsApi = {
  list: () => api.get<{ data: unknown[] }>('/admin/reviews'),
  approve: (id: number | string) =>
    api.patch<{ data: unknown }>(`/admin/reviews/${id}`, { status: 'Published' }),
  hide: (id: number | string) =>
    api.patch<{ data: unknown }>(`/admin/reviews/${id}`, { status: 'Hidden' }),
  delete: (id: number | string) => api.delete<void>(`/admin/reviews/${id}`),
};

// Public reviews
export const reviewsApi = {
  list: () => api.get<{ data: unknown[] }>('/reviews'),
  create: (payload: unknown) => api.post<{ data: unknown }>('/reviews', payload),
};

// ---------------------------------------------------------------------------
// Admin — Fines / Infractions
// ---------------------------------------------------------------------------
export const adminFinesApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return api.get<{ data: unknown[] }>(`/admin/fines${qs}`);
  },
  /** GET /api/admin/cars/{carId}/infractions — all infractions for one car */
  listByCar: (carId: number | string) =>
    api.get<{ data: unknown[] }>(`/admin/cars/${carId}/infractions`),
  create: (payload: unknown) => api.post<{ message: string; fine: unknown }>('/admin/fines', payload),
  update: (id: number | string, payload: unknown) =>
    api.put<{ message: string; fine: unknown }>(`/admin/fines/${id}`, payload),
  delete: (id: number | string) => api.delete<void>(`/admin/fines/${id}`),
};

// ---------------------------------------------------------------------------
// Admin — Maintenance
// ---------------------------------------------------------------------------
export const adminMaintenanceApi = {
  list: () => api.get<{ data: unknown[] }>('/admin/maintenance'),
  create: (payload: unknown) => api.post<{ data: unknown }>('/admin/maintenance', payload),
  update: (id: number | string, payload: unknown) =>
    api.put<{ data: unknown }>(`/admin/maintenance/${id}`, payload),
  delete: (id: number | string) => api.delete<void>(`/admin/maintenance/${id}`),
};

// ---------------------------------------------------------------------------
// Admin — Contacts / Messages
// ---------------------------------------------------------------------------
export const adminContactsApi = {
  /** GET /api/admin/contacts — list with optional filters */
  list: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return api.get<{ data: unknown[] }>(`/admin/contacts${qs}`);
  },
  /** GET /api/admin/contacts/{id} — fetch single contact, auto-marks as read */
  get: (id: number | string) =>
    api.get<{ contact: unknown }>(`/admin/contacts/${id}`),
  /** POST /api/admin/contacts/{id}/reply — send admin reply */
  reply: (id: number | string, reply_text: string) =>
    api.post<{ message: string; contact: unknown }>(`/admin/contacts/${id}/reply`, { reply_text }),
  /** PATCH /api/admin/contacts/{id}/read — toggle is_read */
  toggleRead: (id: number | string) =>
    api.patch<{ contact: unknown }>(`/admin/contacts/${id}/read`, {}),
  /** DELETE /api/admin/contacts/{id} */
  delete: (id: number | string) => api.delete<void>(`/admin/contacts/${id}`),
};

// ---------------------------------------------------------------------------
// Admin — Settings
// ---------------------------------------------------------------------------
export const adminSettingsApi = {
  get: () => api.get<Record<string, unknown>>('/admin/settings'),
  update: (settings: Record<string, unknown>) =>
    api.put<Record<string, unknown>>('/admin/settings', { settings }),
};

// ---------------------------------------------------------------------------
// Admin — Demo Accounts
// ---------------------------------------------------------------------------
export interface DemoAccountResource {
  id: number;
  clientName: string;
  email: string;
  plan: string;
  createdAt: string;
  expiresAt: string;
  daysLeft: number;
  accessKey: string;
  status: 'Active' | 'Expired';
  permissions: string[];
}

export const adminDemoApi = {
  /** GET /api/admin/demo — list all demo accounts */
  list: () => api.get<{ data: DemoAccountResource[] }>('/admin/demo'),
  /** POST /api/admin/demo — create + auto-send credentials email */
  create: (payload: { client_name: string; email: string; duration: number; permissions?: string[] }) =>
    api.post<{ message: string; data: DemoAccountResource }>('/admin/demo', payload),
  /** POST /api/admin/demo/{id}/resend — resend credentials email */
  resend: (id: number | string) =>
    api.post<{ message: string }>(`/admin/demo/${id}/resend`, {}),
  /** POST /api/admin/demo/{id}/extend — extend by N days */
  extend: (id: number | string, days: number) =>
    api.post<{ message: string; data: DemoAccountResource }>(`/admin/demo/${id}/extend`, { days }),
  /** PUT /api/admin/demo/{id}/permissions — update allowed tabs */
  updatePermissions: (id: number | string, permissions: string[]) =>
    api.put<{ message: string; data: DemoAccountResource }>(`/admin/demo/${id}/permissions`, { permissions }),
  /** DELETE /api/admin/demo/{id} */
  delete: (id: number | string) => api.delete<void>(`/admin/demo/${id}`),
};

// ---------------------------------------------------------------------------
// Admin — Analytics
// ---------------------------------------------------------------------------
export const adminAnalyticsApi = {
  dashboard: () => api.get<unknown>('/admin/analytics/dashboard'),
};

// ---------------------------------------------------------------------------
// Public — Testimonials / Contact / Blog
// ---------------------------------------------------------------------------
export const testimonialsApi = {
  list: () => api.get<{ data: unknown[] }>('/testimonials'),
};

export const contactApi = {
  submit: (payload: unknown) => api.post<{ message: string }>('/contact', payload),
};

/** Authenticated-client message thread */
export const clientThreadApi = {
  /** Fetch all messages in the current client's thread */
  getThread: () => api.get<{ data: unknown[] }>('/my-thread'),
  /** Send a new message as the authenticated client (no name/email needed) */
  send: (payload: { subject: string; message: string; type?: string }) =>
    api.post<{ message: string; contact: unknown }>('/my-message', payload),
};

export const blogApi = {
  list: () => api.get<{ data: unknown[] }>('/blog'),
  get: (id: number | string) => api.get<{ data: unknown }>(`/blog/${id}`),
};

// ---------------------------------------------------------------------------
// Pickup / Drop-off Points
// ---------------------------------------------------------------------------
export interface PickupPoint {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  type: 'pickup' | 'dropoff' | 'both';
  is_active: boolean;
  notes: string | null;
}

/** Public — fetches active points used in the booking modal */
export const pickupPointsApi = {
  list: () => api.get<PickupPoint[]>('/pickup-points'),
};

/** Admin — full CRUD for managing points */
export const adminPickupPointsApi = {
  list:    ()                                => api.get<PickupPoint[]>('/admin/pickup-points'),
  create:  (data: Omit<PickupPoint, 'id'>)   => api.post<PickupPoint>('/admin/pickup-points', data),
  update:  (id: number, data: Partial<Omit<PickupPoint, 'id'>>) =>
             api.put<PickupPoint>(`/admin/pickup-points/${id}`, data),
  destroy: (id: number)                      => api.delete<{ message: string }>(`/admin/pickup-points/${id}`),
};

// ---------------------------------------------------------------------------
// Admin — Contracts
// ---------------------------------------------------------------------------
export const adminContractsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return api.get<{ data: any[] }>(`/admin/contracts${qs}`);
  },
  get: (id: number | string) => api.get<{ contract: unknown }>(`/admin/contracts/${id}`),
  create: (payload: Record<string, unknown>) =>
    api.post<{ message: string; contract: unknown }>('/admin/contracts', payload),
  update: (id: number | string, payload: Record<string, unknown>) =>
    api.put<{ message: string; contract: unknown }>(`/admin/contracts/${id}`, payload),
  delete: (id: number | string) => api.delete<void>(`/admin/contracts/${id}`),
  createFromBooking: (bookingId: number | string) =>
    api.post<{ message: string; contract: unknown }>(`/admin/contracts/from-booking/${bookingId}`, {}),
  generateInvoice: (contractId: number | string) =>
    api.post<{ message: string; invoice: unknown }>(`/admin/invoices/from-contract/${contractId}`, {}),
};

// ---------------------------------------------------------------------------
// Admin — Invoices
// ---------------------------------------------------------------------------
export const adminInvoicesApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return api.get<{ data: any[] }>(`/admin/invoices${qs}`);
  },
  get: (id: number | string) => api.get<{ invoice: unknown }>(`/admin/invoices/${id}`),
  create: (payload: Record<string, unknown>) =>
    api.post<{ message: string; invoice: unknown }>('/admin/invoices', payload),
  update: (id: number | string, payload: Record<string, unknown>) =>
    api.put<{ message: string; invoice: unknown }>(`/admin/invoices/${id}`, payload),
  delete: (id: number | string) => api.delete<void>(`/admin/invoices/${id}`),
  markPaid: (id: number | string, paymentMethod: string) =>
    api.patch<{ message: string; invoice: unknown }>(`/admin/invoices/${id}/mark-paid`, {
      payment_method: paymentMethod,
    }),
  createFromContract: (contractId: number | string) =>
    api.post<{ message: string; invoice: unknown }>(`/admin/invoices/from-contract/${contractId}`, {}),
};

// ---------------------------------------------------------------------------
// Admin — Expenses
// ---------------------------------------------------------------------------
export const adminExpensesApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return api.get<{ data: any[]; stats: any }>(`/admin/expenses${qs}`);
  },
  summary: () => api.get<{ summary: any[] }>('/admin/expenses/summary'),
  get: (id: number | string) => api.get<{ expense: unknown }>(`/admin/expenses/${id}`),
  create: (payload: Record<string, unknown>) =>
    api.post<{ message: string; expense: unknown }>('/admin/expenses', payload),
  update: (id: number | string, payload: Record<string, unknown>) =>
    api.put<{ message: string; expense: unknown }>(`/admin/expenses/${id}`, payload),
  delete: (id: number | string) => api.delete<void>(`/admin/expenses/${id}`),
};
