import React, { createContext, useContext, useEffect, useState } from 'react';
import { DataContextType, Property, Lease, User, Payment, MaintenanceRequest, UserStatus } from '../types';
import { MockDB, initDB } from '../services/mockDatabase';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);

  const refreshData = () => {
    setProperties(MockDB.getProperties());
    setLeases(MockDB.getLeases());
    setUsers(MockDB.getUsers());
    setPayments(MockDB.getPayments());
    setMaintenance(MockDB.getMaintenance());
  };

  useEffect(() => {
    initDB();
    refreshData();
  }, []);

  const addProperty = (p: Omit<Property, 'id'>) => {
    const newProp: Property = { ...p, id: `prop-${Date.now()}` };
    const saved = MockDB.addProperty(newProp);
    refreshData();
    return saved;
  };

  const updateProperty = (p: Property) => {
    MockDB.updateProperty(p);
    refreshData();
  };

  const createLease = (l: Omit<Lease, 'id'>) => {
    const newLease: Lease = { ...l, id: `lease-${Date.now()}` };
    const saved = MockDB.addLease(newLease);
    refreshData();
    return saved;
  };

  const terminateLease = (leaseId: string) => {
    MockDB.terminateLease(leaseId);
    refreshData();
  };

  const makePayment = (p: Omit<Payment, 'id'>) => {
    const newPay: Payment = { ...p, id: `pay-${Date.now()}` };
    const saved = MockDB.addPayment(newPay);
    refreshData();
    return saved;
  };

  const reportIssue = (m: Omit<MaintenanceRequest, 'id'>) => {
    const newM: MaintenanceRequest = { ...m, id: `maint-${Date.now()}` };
    const saved = MockDB.addMaintenance(newM);
    refreshData();
    return saved;
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    MockDB.updateUserStatus(userId, status);
    refreshData();
  };

  return (
    <DataContext.Provider value={{
      properties, leases, users, payments, maintenance,
      refreshData, addProperty, updateProperty, createLease, terminateLease, makePayment, reportIssue, updateUserStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};