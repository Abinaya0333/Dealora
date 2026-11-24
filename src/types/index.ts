export type UserRole = 'freelancer' | 'client' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  company?: string;
  hourlyRate?: number;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'escrow_funded' | 'in_review' | 'released';
  simulatedTxId: string;
  releaseDate?: string;
}

export interface AuditEvent {
  id: string;
  projectId: string;
  eventName: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
  previousStatus?: string;
  newStatus?: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface Project {
  id: string;
  title: string;
  freelancerId: string;
  clientId: string;
  description: string;
  deliverables: string[];
  budget: number;
  timelineDays: number;
  startDate: string;
  deadline: string;
  status: 'active' | 'review' | 'completed' | 'scope_alert';
  currentVersion: number;
  milestones: ProjectMilestone[];
  auditTrail: AuditEvent[];
}

export interface Agreement {
  id: string;
  projectId: string;
  version: number;
  title: string;
  content: string;
  deliverables: string[];
  budget: number;
  timelineDays: number;
  status: 'draft' | 'sent_to_client' | 'accepted' | 'rejected' | 'superseded';
  createdAt: string;
  signedAt?: string;
  revisionLimit: number;
  notes?: string;
  signers?: {
    freelancerName: string;
    freelancerSignedAt?: string;
    clientName: string;
    clientSignedAt?: string;
  };
}

export type ScopeChangeType =
  | 'added'
  | 'modified'
  | 'removed'
  | 'unchanged'
  | 'needs_clarification';

export type FreelancerVerificationStatus =
  | 'pending'
  | 'confirmed'
  | 'edited'
  | 'marked_incorrect'
  | 'clarification_requested';

export interface ScopeItemAnalysis {
  id?: string;
  changeType: ScopeChangeType;
  originalRequirement: string;
  newRequirement: string;
  explanation: string;
  projectImpact: string;
  confidenceScore: number; // e.g. 94%
  confidenceLevel: 'High' | 'Medium' | 'Low';
  originalClauseRef: string;
  newRequestRef: string;
  infoRequired?: string;
  freelancerStatus?: FreelancerVerificationStatus;
  freelancerNotes?: string;
  estimatedEffort: string;
  estimatedHours: number;
  complexity: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedCost: number;
  estimatedDays: number;
  estimationReason: string;
}

export interface ScopeGuardAnalysis {
  summary: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  items: ScopeItemAnalysis[];
  totalAdditionalCost: number;
  totalAdditionalDays: number;
  totalAdditionalHours: number;
  revisedBudget: number;
  revisedTimelineDays: number;
  assumptions: string[];
  recommendations: string[];
  isSampleFallback?: boolean;
  source?: string;
}

export interface ScopeChangeRequest {
  id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  title: string;
  requestedText: string;
  submittedAt: string;
  status: 'submitted' | 'analyzed' | 'proposal_sent' | 'accepted' | 'rejected';
  analysis?: ScopeGuardAnalysis;
  customAdditionalCost?: number;
  customAdditionalDays?: number;
  freelancerProposalNotes?: string;
  proposalSentAt?: string;
  clientReviewedAt?: string;
  clientRejectionReason?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // user id or 'all'
  type: 'project' | 'agreement' | 'scope_request' | 'analysis' | 'proposal' | 'milestone' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
  linkProjectId?: string;
  linkRequestId?: string;
}

export interface ProjectHealthMetrics {
  status: 'Healthy' | 'Needs Attention' | 'At Risk';
  score: number; // 0 - 100
  scopeStabilityPct: number;
  pendingApprovalsCount: number;
  milestoneCompletionPct: number;
  daysRemaining: number;
  outstandingRequestsCount: number;
  reasons: string[];
}
