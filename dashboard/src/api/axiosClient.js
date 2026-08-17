import axios from 'axios';
import { initialFactoryData, initialAgencyData, initialAdminData } from './mockData';

// Create an Axios instance
const axiosClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory persistent database copies for state mutation simulations
let dbFactory = JSON.parse(JSON.stringify(initialFactoryData));
let dbAgency = JSON.parse(JSON.stringify(initialAgencyData));
let dbAdmin = JSON.parse(JSON.stringify(initialAdminData));

// Axios mock handler interceptor
axiosClient.interceptors.request.use(async (config) => {
  // Simulate network latency (150ms)
  await new Promise((resolve) => setTimeout(resolve, 150));
  return config;
});

// Helper response generator
const makeResponse = (data, status = 200) => {
  return Promise.resolve({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  });
};

// Custom adapter/interceptor method simulating mock API calls
export const mockApi = {
  // Factory Endpoints
  getFactoryData: async () => makeResponse(dbFactory),
  addFactoryEmployee: async (employee) => {
    const newEmp = {
      id: `EMP-F0${dbFactory.employees.length + 1}`,
      status: 'Active',
      attendanceDays: 0,
      ...employee,
    };
    dbFactory.employees.unshift(newEmp);
    return makeResponse(newEmp, 201);
  },
  createFactoryBill: async (bill) => {
    const newBill = {
      id: `BILL-FB0${dbFactory.bills.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      ...bill,
    };
    dbFactory.bills.unshift(newBill);
    return makeResponse(newBill, 201);
  },
  createFactoryPayment: async (payment) => {
    const newPayment = {
      id: `PAY-FP0${dbFactory.payments.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      ...payment,
    };
    dbFactory.payments.unshift(newPayment);
    return makeResponse(newPayment, 201);
  },

  // Agency Endpoints
  getAgencyData: async () => makeResponse(dbAgency),
  addAgencyEmployee: async (employee) => {
    const newEmp = {
      id: `EMP-A0${dbAgency.employees.length + 1}`,
      status: 'Deployed',
      hoursThisWeek: 40,
      ...employee,
    };
    dbAgency.employees.unshift(newEmp);
    dbAgency.metrics.activePlacedWorkers += 1;
    return makeResponse(newEmp, 201);
  },
  createAgencyBill: async (bill) => {
    const newBill = {
      id: `INV-AG0${dbAgency.bills.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      ...bill,
    };
    dbAgency.bills.unshift(newBill);
    return makeResponse(newBill, 201);
  },
  createAgencyPayment: async (payment) => {
    const newPayment = {
      id: `PAY-AP0${dbAgency.payments.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      ...payment,
    };
    dbAgency.payments.unshift(newPayment);
    return makeResponse(newPayment, 201);
  },

  // Admin Endpoints
  getAdminData: async () => makeResponse(dbAdmin),
  addAdminUser: async (user) => {
    const newUser = {
      id: `USR-0${dbAdmin.users.length + 1}`,
      status: 'Active',
      lastLogin: 'Just now',
      ...user,
    };
    dbAdmin.users.unshift(newUser);
    // Add audit log entry
    dbAdmin.auditLogs.unshift({
      id: `LOG-${1093 + dbAdmin.auditLogs.length}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'Admin User',
      action: `Created new user ${newUser.name} (${newUser.role})`,
      portal: 'User Management',
      ip: '192.168.1.45',
      level: 'Success',
    });
    return makeResponse(newUser, 201);
  },
  updateSettings: async (settings) => {
    dbAdmin.systemSettings = { ...dbAdmin.systemSettings, ...settings };
    dbAdmin.auditLogs.unshift({
      id: `LOG-${1093 + dbAdmin.auditLogs.length}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'Admin User',
      action: 'Updated System Settings',
      portal: 'System Settings',
      ip: '192.168.1.45',
      level: 'Info',
    });
    return makeResponse(dbAdmin.systemSettings, 200);
  },
};

export default axiosClient;
