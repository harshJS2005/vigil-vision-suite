import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Criminal, Case, BlockedIP } from '@/types';
import { mockBlockedIPs, mockCases, mockCriminals } from '@/data/mockData';

export interface NewCriminalInput {
  name: string;
  age: number;
  charges: string[];
  description: string;
  image: string; // data URL or URL
  status: Criminal['status'];
}

export interface UpdateCriminalInput extends Partial<NewCriminalInput> {
  id: string;
}

export interface NewCaseInput {
  title: string;
  description: string;
  reportedBy: string;
  priority: Case['priority'];
}

export interface NewBlockedIPInput {
  ipAddress: string;
  reason: string;
  blockedBy: string;
}

interface SecurityState {
  criminals: Criminal[];
  cases: Case[];
  blockedIPs: BlockedIP[];
  // Criminals
  addCriminal: (input: NewCriminalInput) => Criminal;
  updateCriminal: (input: UpdateCriminalInput) => void;
  deleteCriminal: (id: string) => void;
  // Cases
  addCase: (input: NewCaseInput) => Case;
  updateCaseStatus: (id: string, status: Case['status']) => void;
  addEvidenceToCase: (id: string, evidence: string) => void;
  // IP Blocking
  blockIP: (input: NewBlockedIPInput) => BlockedIP;
  unblockIP: (id: string) => void;
  deleteIP: (id: string) => void;
}

const nextCriminalId = (list: Criminal[]) => (list.length ? (Math.max(...list.map(c => Number(c.id))) + 1).toString() : '1');
const nextCaseId = (list: Case[]) => `CASE${String(list.length + 1).padStart(3, '0')}`;
const nextIPId = (list: BlockedIP[]) => (list.length ? (Math.max(...list.map(c => Number(c.id))) + 1).toString() : '1');

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      criminals: mockCriminals,
      cases: mockCases,
      blockedIPs: mockBlockedIPs,

      addCriminal: (input) => {
        const id = nextCriminalId(get().criminals);
        const identificationNumber = `CR${String(Number(id)).padStart(3, '0')}`;
        const record: Criminal = {
          id,
          name: input.name,
          age: input.age,
          charges: input.charges,
          lastSeen: new Date().toISOString().split('T')[0],
          status: input.status,
          image: input.image,
          description: input.description,
          identificationNumber,
        };
        set((state) => ({ criminals: [...state.criminals, record] }));
        return record;
      },

      updateCriminal: (input) => {
        set((state) => ({
          criminals: state.criminals.map((c) => c.id === input.id ? { ...c, ...input } as Criminal : c)
        }));
      },

      deleteCriminal: (id) => {
        set((state) => ({ criminals: state.criminals.filter((c) => c.id !== id) }));
      },

      addCase: (input) => {
        const id = nextCaseId(get().cases);
        const record: Case = {
          id,
          title: input.title,
          description: input.description,
          reportedBy: input.reportedBy,
          reportedDate: new Date().toISOString().split('T')[0],
          status: 'open',
          priority: input.priority,
          evidence: [],
        };
        set((state) => ({ cases: [record, ...state.cases] }));
        return record;
      },

      updateCaseStatus: (id, status) => {
        set((state) => ({
          cases: state.cases.map((c) => c.id === id ? { ...c, status } : c)
        }));
      },

      addEvidenceToCase: (id, evidence) => {
        if (!evidence.trim()) return;
        set((state) => ({
          cases: state.cases.map((c) => c.id === id ? { ...c, evidence: [...c.evidence, evidence.trim()] } : c)
        }));
      },

      blockIP: (input) => {
        const id = nextIPId(get().blockedIPs);
        const record: BlockedIP = {
          id,
          ipAddress: input.ipAddress,
          reason: input.reason,
          blockedDate: new Date().toISOString().split('T')[0],
          blockedBy: input.blockedBy,
          status: 'active',
        };
        set((state) => ({ blockedIPs: [record, ...state.blockedIPs] }));
        return record;
      },

      unblockIP: (id) => {
        set((state) => ({
          blockedIPs: state.blockedIPs.map((ip) => ip.id === id ? { ...ip, status: 'expired' } : ip)
        }));
      },

      deleteIP: (id) => {
        set((state) => ({ blockedIPs: state.blockedIPs.filter((ip) => ip.id !== id) }));
      }
    }),
    { name: 'secureai-security-store' }
  )
);
