import { User, Property, Lease, Payment, MaintenanceRequest, UserRole, UserStatus } from '../types';
import { SEED_USERS, SEED_PROPERTIES } from '../constants';

// Keys for LocalStorage
const KEYS = {
  USERS: 'simba_users',
  PROPERTIES: 'simba_properties',
  LEASES: 'simba_leases',
  PAYMENTS: 'simba_payments',
  MAINTENANCE: 'simba_maintenance',
};

// Initialize DB if empty
export const initDB = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(KEYS.PROPERTIES, JSON.stringify(SEED_PROPERTIES));
    localStorage.setItem(KEYS.LEASES, JSON.stringify([]));
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify([]));
    localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify([]));
  }
};

const getTable = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setTable = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const MockDB = {
  // USERS
  getUsers: (): User[] => getTable<User>(KEYS.USERS),
  addUser: (user: User) => {
    const users = getTable<User>(KEYS.USERS);
    // Landlords default to PENDING, others APPROVED
    user.status = user.role === UserRole.LANDLORD ? 'PENDING' : 'APPROVED';
    users.push(user);
    setTable(KEYS.USERS, users);
    return user;
  },
  findUserByEmail: (email: string) => getTable<User>(KEYS.USERS).find(u => u.email === email),
  updateUserStatus: (userId: string, status: UserStatus) => {
    const users = getTable<User>(KEYS.USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].status = status;
      setTable(KEYS.USERS, users);
    }
  },

  // PROPERTIES
  getProperties: (): Property[] => getTable<Property>(KEYS.PROPERTIES),
  addProperty: (prop: Property) => {
    const props = getTable<Property>(KEYS.PROPERTIES);
    props.push(prop);
    setTable(KEYS.PROPERTIES, props);
    return prop;
  },
  updateProperty: (prop: Property) => {
    const props = getTable<Property>(KEYS.PROPERTIES);
    const idx = props.findIndex(p => p.id === prop.id);
    if (idx !== -1) {
      props[idx] = prop;
      setTable(KEYS.PROPERTIES, props);
    }
  },
  updatePropertyStatus: (id: string, status: string) => {
    const props = getTable<Property>(KEYS.PROPERTIES);
    const idx = props.findIndex(p => p.id === id);
    if (idx !== -1) {
      props[idx].status = status as any;
      setTable(KEYS.PROPERTIES, props);
    }
  },

  // LEASES
  getLeases: (): Lease[] => getTable<Lease>(KEYS.LEASES),
  addLease: (lease: Lease) => {
    const leases = getTable<Lease>(KEYS.LEASES);
    leases.push(lease);
    setTable(KEYS.LEASES, leases);
    // Auto update property status
    MockDB.updatePropertyStatus(lease.propertyId, 'OCCUPIED');
    return lease;
  },
  terminateLease: (id: string) => {
    const leases = getTable<Lease>(KEYS.LEASES);
    const idx = leases.findIndex(l => l.id === id);
    if (idx !== -1) {
      const lease = leases[idx];
      lease.isActive = false;
      setTable(KEYS.LEASES, leases);
      // Auto update property status to AVAILABLE
      MockDB.updatePropertyStatus(lease.propertyId, 'AVAILABLE');
    }
  },

  // PAYMENTS
  getPayments: (): Payment[] => getTable<Payment>(KEYS.PAYMENTS),
  addPayment: (payment: Payment) => {
    const payments = getTable<Payment>(KEYS.PAYMENTS);
    payments.push(payment);
    setTable(KEYS.PAYMENTS, payments);
    return payment;
  },

  // MAINTENANCE
  getMaintenance: (): MaintenanceRequest[] => getTable<MaintenanceRequest>(KEYS.MAINTENANCE),
  addMaintenance: (req: MaintenanceRequest) => {
    const reqs = getTable<MaintenanceRequest>(KEYS.MAINTENANCE);
    reqs.push(req);
    setTable(KEYS.MAINTENANCE, reqs);
    return req;
  }
};