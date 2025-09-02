export interface Criminal {
  id: string;
  name: string;
  age: number;
  charges: string[];
  lastSeen: string;
  status: 'active' | 'captured' | 'deceased';
  image: string;
  description: string;
  identificationNumber: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  reportedBy: string;
  reportedDate: string;
  status: 'open' | 'investigating' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedOfficer?: string;
  evidence: string[];
}

export interface RecognitionResult {
  confidence: number;
  match: Criminal | null;
  timestamp: string;
  imageData: string;
}

export interface BlockedIP {
  id: string;
  ipAddress: string;
  reason: string;
  blockedDate: string;
  blockedBy: string;
  status: 'active' | 'expired';
}