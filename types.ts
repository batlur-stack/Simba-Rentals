export enum UserRole {
  ADMIN = 'ADMIN',
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT'
}

export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  password?: string; // In real app, this would be hashed
  joinedDate: string;
}

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  address: string; // e.g., "Westlands, Nairobi"
  city: string;
  propertyType: string;
  rentAmount: number;
  depositAmount: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  imageUrl: string;
  features: string[];
}

export interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  date: string;
  type: 'RENT' | 'DEPOSIT';
  method: 'MPESA' | 'BANK_TRANSFER' | 'CASH';
  status: 'COMPLETED' | 'PENDING';
  transactionCode: string; // e.g., QDH...
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dateReported: string;
}

// Helper Context Types
export interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => Promise<boolean | string>;
  register: (user: Partial<User>) => Promise<boolean>;
  logout: () => void;
}

export interface DataContextType {
  properties: Property[];
  leases: Lease[];
  users: User[];
  payments: Payment[];
  maintenance: MaintenanceRequest[];
  refreshData: () => void;
  addProperty: (p: Omit<Property, 'id'>) => Property;
  updateProperty: (p: Property) => void;
  createLease: (l: Omit<Lease, 'id'>) => Lease;
  terminateLease: (leaseId: string) => void;
  makePayment: (p: Omit<Payment, 'id'>) => Payment;
  reportIssue: (m: Omit<MaintenanceRequest, 'id'>) => MaintenanceRequest;
  updateUserStatus: (userId: string, status: UserStatus) => void;
}