// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'guest';
  phone?: string;
  language: 'en' | 'es';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'admin' | 'staff' | 'guest';
}

// Room types
export interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  capacity: number;
  price: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  floor: number;
  amenities: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

// Guest types
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  passportNumber?: string;
  dateOfBirth?: string;
  preferences?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

// Reservation types
export interface Reservation {
  id: string;
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalAmount: number;
  depositAmount: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  guest?: Guest;
  room?: Room;
}

// Billing types
export interface Billing {
  id: string;
  reservationId: string;
  guestId: string;
  roomId: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer';
  paymentDate?: string;
  dueDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  reservation?: Reservation;
  guest?: Guest;
  room?: Room;
}

// Housekeeping types
export interface Housekeeping {
  id: string;
  roomId: string;
  type: 'daily' | 'deep_clean' | 'maintenance' | 'turnover';
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  assignedTo?: string;
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  room?: Room;
  assignedUser?: User;
}

// Audit log types
export interface AuditLog {
  id: string;
  tableName: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  user?: User;
}

// Export configuration types
export interface ExportConfig {
  id: string;
  name: string;
  description?: string;
  tableName: string;
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  lastExport?: string;
  nextExport?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
  roles?: string[];
}

// Language types
export interface Language {
  code: 'en' | 'es';
  name: string;
  flag: string;
}

// Theme types
export interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
} 