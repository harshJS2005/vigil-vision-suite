import { Criminal, Case, BlockedIP } from '@/types';

export const mockCriminals: Criminal[] = [
  {
    id: '1',
    name: 'John Doe',
    age: 34,
    charges: ['Armed Robbery', 'Assault'],
    lastSeen: '2024-01-15',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    description: 'Wanted for armed robbery at downtown bank. Considered dangerous.',
    identificationNumber: 'CR001'
  },
  {
    id: '2',
    name: 'Jane Smith',
    age: 28,
    charges: ['Fraud', 'Identity Theft'],
    lastSeen: '2024-01-20',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=200&h=200&fit=crop&crop=face',
    description: 'Involved in major credit card fraud scheme.',
    identificationNumber: 'CR002'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    age: 42,
    charges: ['Drug Trafficking'],
    lastSeen: '2024-01-10',
    status: 'captured',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    description: 'Leader of drug trafficking ring. Recently apprehended.',
    identificationNumber: 'CR003'
  }
];

export const mockCases: Case[] = [
  {
    id: 'CASE001',
    title: 'Downtown Bank Robbery',
    description: 'Armed robbery occurred at First National Bank on Main Street',
    reportedBy: 'Bank Manager',
    reportedDate: '2024-01-15',
    status: 'investigating',
    priority: 'high',
    assignedOfficer: 'Officer Smith',
    evidence: ['Security footage', 'Witness statements']
  },
  {
    id: 'CASE002',
    title: 'Vehicle Theft Ring',
    description: 'Multiple car thefts reported in residential area',
    reportedBy: 'Multiple Citizens',
    reportedDate: '2024-01-18',
    status: 'open',
    priority: 'medium',
    assignedOfficer: 'Detective Johnson',
    evidence: ['CCTV footage', 'License plate records']
  },
  {
    id: 'CASE003',
    title: 'Fraud Investigation',
    description: 'Large scale credit card fraud detected',
    reportedBy: 'Financial Institution',
    reportedDate: '2024-01-20',
    status: 'investigating',
    priority: 'critical',
    assignedOfficer: 'Detective Brown',
    evidence: ['Transaction records', 'Digital forensics']
  }
];

export const mockBlockedIPs: BlockedIP[] = [
  {
    id: '1',
    ipAddress: '192.168.1.100',
    reason: 'Suspicious activity detected',
    blockedDate: '2024-01-20',
    blockedBy: 'Security System',
    status: 'active'
  },
  {
    id: '2',
    ipAddress: '10.0.0.50',
    reason: 'Multiple failed login attempts',
    blockedDate: '2024-01-19',
    blockedBy: 'Admin',
    status: 'active'
  },
  {
    id: '3',
    ipAddress: '172.16.0.25',
    reason: 'DDoS attack source',
    blockedDate: '2024-01-18',
    blockedBy: 'Firewall',
    status: 'expired'
  }
];