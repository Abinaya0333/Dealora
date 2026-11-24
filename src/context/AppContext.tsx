import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Project,
  Agreement,
  ScopeChangeRequest,
  NotificationItem,
  ScopeGuardAnalysis,
  ProjectMilestone,
  AuditEvent,
  ProjectHealthMetrics,
  ScopeItemAnalysis,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_PROJECTS,
  INITIAL_AGREEMENTS,
  INITIAL_CHANGE_REQUESTS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';
import { api } from '../services/api';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  users: User[];
  projects: Project[];
  currentUserProjects: Project[];
  agreements: Agreement[];
  changeRequests: ScopeChangeRequest[];
  notifications: NotificationItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;

  // Project Actions
  createProject: (data: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getProjectHealth: (projectId: string) => ProjectHealthMetrics;
  addAuditEvent: (
    projectId: string,
    eventName: string,
    details: string,
    previousStatus?: string,
    newStatus?: string,
    metadata?: Record<string, any>
  ) => void;

  // Agreement Actions
  createAgreementDraft: (data: Partial<Agreement>) => Promise<Agreement>;
  sendAgreementToClient: (agreementId: string) => void;

  // ScopeGuard & Proposal Actions
  submitChangeRequestByClient: (projectId: string, requestedText: string) => ScopeChangeRequest;
  runScopeGuardAnalysis: (
    projectId: string,
    originalScope: string,
    originalBudget: number,
    originalDays: number,
    newRequirements: string
  ) => Promise<ScopeGuardAnalysis>;
  updateScopeItemFinding: (
    requestId: string,
    itemIndex: number,
    updates: Partial<ScopeItemAnalysis>
  ) => void;
  sendRevisedProposal: (
    requestId: string,
    cost: number,
    days: number,
    notes: string,
    analysis?: ScopeGuardAnalysis
  ) => void;
  acceptRevisedProposal: (requestId: string) => void;
  rejectRevisedProposal: (requestId: string, reason?: string) => void;

  // Milestones Actions
  updateMilestoneStatus: (projectId: string, milestoneId: string, status: ProjectMilestone['status']) => void | Promise<void>;
  addProjectMilestone: (projectId: string, milestone: Omit<ProjectMilestone, 'id' | 'projectId' | 'simulatedTxId'>) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Modals & Exports
  isJudgeModalOpen: boolean;
  setIsJudgeModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  exportTargetAgreementId: string | null;
  openAgreementExport: (agreementId?: string) => void;

  // Demo State & Walkthrough
  resetDemoData: () => void;
  walkthroughStep: number;
  setWalkthroughStep: (step: number) => void;
  isWalkthroughOpen: boolean;
  setIsWalkthroughOpen: (open: boolean) => void;
  executeWalkthroughAction: (step: number) => Promise<void>;
  launchInteractiveJudgeDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'dealora_user_id_v1',
  PROJECTS: 'dealora_projects_v1',
  AGREEMENTS: 'dealora_agreements_v1',
  CHANGE_REQUESTS: 'dealora_change_requests_v1',
  NOTIFICATIONS: 'dealora_notifications_v1',
  WALKTHROUGH_STEP: 'dealora_step_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = DEMO_USERS;

  // Local storage state initialization
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const found = users.find((u) => u.id === savedId);
    return found || users[0]; // Default: Freelancer A
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [agreements, setAgreements] = useState<Agreement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AGREEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_AGREEMENTS;
    } catch {
      return INITIAL_AGREEMENTS;
    }
  });

  const [changeRequests, setChangeRequests] = useState<ScopeChangeRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHANGE_REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_CHANGE_REQUESTS;
    } catch {
      return INITIAL_CHANGE_REQUESTS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-1');
  const [walkthroughStep, setWalkthroughStep] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WALKTHROUGH_STEP);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(true);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportTargetAgreementId, setExportTargetAgreementId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(agreements));
  }, [agreements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHANGE_REQUESTS, JSON.stringify(changeRequests));
  }, [changeRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALKTHROUGH_STEP, walkthroughStep.toString());
  }, [walkthroughStep]);

  // Strict Role-Based Project Filtering (FEATURE 10: Security & Permissions)
  const currentUserProjects = useMemo(() => {
    if (currentUser.role === 'admin') {
      return projects;
    }
    if (currentUser.role === 'freelancer') {
      return projects.filter((p) => p.freelancerId === currentUser.id);
    }
    if (currentUser.role === 'client') {
      return projects.filter((p) => p.clientId === currentUser.id);
    }
    return [];
  }, [projects, currentUser]);

  // Ensure selectedProjectId is valid for the current user's scope
  useEffect(() => {
    if (currentUserProjects.length > 0) {
      const exists = currentUserProjects.some((p) => p.id === selectedProjectId);
      if (!exists) {
        setSelectedProjectId(currentUserProjects[0].id);
      }
    }
  }, [currentUser, currentUserProjects, selectedProjectId]);

  const switchUserById = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setActiveTab('admin-overview');
      } else {
        setActiveTab('dashboard');
      }
    }
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Append-only Project Audit Trail (FEATURE 6)
  const addAuditEvent = (
    projectId: string,
    eventName: string,
    details: string,
    previousStatus?: string,
    newStatus?: string,
    metadata?: Record<string, any>
  ) => {
    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      eventName,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toISOString(),
      previousStatus: previousStatus || 'unchanged',
      newStatus: newStatus || 'unchanged',
      details,
      metadata,
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              auditTrail: [newEvent, ...(p.auditTrail || [])],
            }
          : p
      )
    );
  };

  // Deterministic Project Health Score Calculation (FEATURE 4)
  const getProjectHealth = (projectId: string): ProjectHealthMetrics => {
    const proj = projects.find((p) => p.id === projectId) || projects[0];
    if (!proj) {
      return {
        status: 'Healthy',
        score: 100,
        scopeStabilityPct: 100,
        pendingApprovalsCount: 0,
        milestoneCompletionPct: 100,
        daysRemaining: 15,
        outstandingRequestsCount: 0,
        reasons: ['Baseline project configuration active.'],
      };
    }

    const reasons: string[] = [];
    let score = 100;

    // 1. Scope Stability
    const pendingChanges = changeRequests.filter(
      (r) => r.projectId === projectId && (r.status === 'submitted' || r.status === 'analyzed')
    );
    let scopeStabilityPct = 100;
    if (proj.status === 'scope_alert' || pendingChanges.length > 0) {
      score -= 25;
      scopeStabilityPct = 65;
      reasons.push(`${pendingChanges.length || 1} unbilled client scope expansion(s) detected.`);
    } else {
      reasons.push('Scope is locked and stable under current agreement.');
    }

    // 2. Pending Approvals
    const pendingProposals = changeRequests.filter(
      (r) => r.projectId === projectId && r.status === 'proposal_sent'
    );
    const pendingApprovalsCount = pendingProposals.length;
    if (pendingApprovalsCount > 0) {
      score -= 10;
      reasons.push('Revised proposal sent; awaiting client signature for Version 2.0.');
    }

    // 3. Milestone Completion Rate
    const totalMilestones = proj.milestones.length || 1;
    const releasedMilestones = proj.milestones.filter((m) => m.status === 'released').length;
    const milestoneCompletionPct = Math.round((releasedMilestones / totalMilestones) * 100);

    if (milestoneCompletionPct === 100) {
      reasons.push('All scheduled milestone phases released.');
    } else {
      reasons.push(`${milestoneCompletionPct}% milestones released (${releasedMilestones}/${totalMilestones} phases).`);
    }

    // 4. Deadline Status
    const deadlineDate = new Date(proj.deadline).getTime();
    const now = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24)));

    if (daysRemaining < 3 && milestoneCompletionPct < 80) {
      score -= 20;
      reasons.push(`Deadline imminent (${daysRemaining} days remaining) with pending deliverables.`);
    } else {
      reasons.push(`${daysRemaining} business days remaining until target delivery.`);
    }

    // Classify Health Status
    let status: 'Healthy' | 'Needs Attention' | 'At Risk' = 'Healthy';
    if (score < 65) {
      status = 'At Risk';
    } else if (score < 85) {
      status = 'Needs Attention';
    }

    return {
      status,
      score: Math.max(20, Math.min(100, score)),
      scopeStabilityPct,
      pendingApprovalsCount,
      milestoneCompletionPct,
      daysRemaining,
      outstandingRequestsCount: pendingChanges.length,
      reasons,
    };
  };

  // Create Project
  const createProject = (data: Partial<Project>): Project => {
    const id = `proj-${Date.now()}`;
    const budgetVal = data.budget || 200;
    const timelineVal = data.timelineDays || 15;

    const newProj: Project = {
      id,
      title: data.title || 'New Web Project',
      freelancerId: currentUser.role === 'freelancer' ? currentUser.id : 'freelancer-a',
      clientId: data.clientId || 'client-a',
      description: data.description || 'Full-stack responsive web project.',
      deliverables: data.deliverables || ['Website with 5 pages', 'Contact form', 'Responsive design'],
      budget: budgetVal,
      timelineDays: timelineVal,
      startDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + timelineVal * 86400000).toISOString().split('T')[0],
      status: 'active',
      currentVersion: 1,
      milestones: [
        {
          id: `ms-${id}-1`,
          projectId: id,
          title: 'Initial Wireframes & Page Architecture',
          description: 'Structure, wireframe specifications, and design signoff.',
          amount: Math.round(budgetVal * 0.4),
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          status: 'pending',
          simulatedTxId: `TX-SIM-${Math.floor(100000 + Math.random() * 900000)}-TB`,
        },
        {
          id: `ms-${id}-2`,
          projectId: id,
          title: 'Complete Coding, Responsive Testing & Launch',
          description: 'Full deliverable implementation and deployment.',
          amount: Math.round(budgetVal * 0.6),
          dueDate: new Date(Date.now() + timelineVal * 86400000).toISOString().split('T')[0],
          status: 'pending',
          simulatedTxId: `TX-SIM-${Math.floor(100000 + Math.random() * 900000)}-TB`,
        },
      ],
      auditTrail: [
        {
          id: `aud-${Date.now()}-1`,
          projectId: id,
          eventName: 'Project Workspace Initialized',
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          timestamp: new Date().toISOString(),
          previousStatus: 'None',
          newStatus: 'active',
          details: `Created project with $${budgetVal} budget and ${timelineVal}-day timeline.`,
        },
      ],
    };

    setProjects((prev) => [newProj, ...prev]);
    setSelectedProjectId(newProj.id);

    addNotification({
      recipientId: newProj.clientId,
      type: 'project',
      title: `New Project Created: ${newProj.title}`,
      message: `${currentUser.name} created a new project workspace.`,
      linkTab: 'projects',
      linkProjectId: newProj.id,
    });

    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // Create Agreement Draft
  const createAgreementDraft = async (data: Partial<Agreement>): Promise<Agreement> => {
    const proj = projects.find((p) => p.id === (data.projectId || selectedProjectId));
    const client = users.find((u) => u.id === proj?.clientId);
    const freelancer = users.find((u) => u.id === proj?.freelancerId) || currentUser;

    let content = data.content || '';

    if (!content) {
      try {
        const res = await fetch('/api/gemini/generate-agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectTitle: proj?.title || 'Website Development',
            clientName: client?.name || 'Client',
            freelancerName: freelancer.name,
            budget: data.budget || proj?.budget || 200,
            timelineDays: data.timelineDays || proj?.timelineDays || 15,
            deliverables: data.deliverables || proj?.deliverables || ['Website with 5 pages', 'Contact form', 'Responsive design'],
            revisionLimit: data.revisionLimit || 2,
          }),
        });
        const resJson = await res.json();
        if (resJson.content) {
          content = resJson.content;
        }
      } catch (e) {
        console.warn('Could not call generate-agreement:', e);
      }
    }

    const newAgr: Agreement = {
      id: `agr-${Date.now()}`,
      projectId: proj?.id || 'proj-1',
      version: data.version || 1,
      title: data.title || `Services Agreement v${data.version || 1}.0`,
      content: content || 'Draft Agreement',
      deliverables: data.deliverables || proj?.deliverables || ['5 pages', 'Contact form', 'Responsive design'],
      budget: data.budget || proj?.budget || 200,
      timelineDays: data.timelineDays || proj?.timelineDays || 15,
      status: 'draft',
      createdAt: new Date().toISOString(),
      revisionLimit: 2,
      notes: data.notes || 'Created via Dealora AI Agreement Drafter',
      signers: {
        freelancerName: freelancer.name,
        clientName: client?.name || 'Client',
      },
    };

    setAgreements((prev) => [newAgr, ...prev]);

    if (proj) {
      addAuditEvent(
        proj.id,
        `Agreement v${newAgr.version}.0 Generated`,
        `AI generated agreement drafted with $${newAgr.budget} budget and ScopeGuard clause.`,
        'None',
        'draft'
      );
    }

    return newAgr;
  };

  const sendAgreementToClient = (agreementId: string) => {
    const agr = agreements.find((a) => a.id === agreementId);
    if (!agr) return;

    setAgreements((prev) =>
      prev.map((a) => (a.id === agreementId ? { ...a, status: 'sent_to_client' } : a))
    );

    const proj = projects.find((p) => p.id === agr.projectId);
    if (proj) {
      addAuditEvent(
        proj.id,
        `Agreement v${agr.version}.0 Sent for Review`,
        `Submitted contract to ${proj.clientId} for client signoff.`,
        'draft',
        'sent_to_client'
      );

      addNotification({
        recipientId: proj.clientId,
        type: 'agreement',
        title: `New Agreement v${agr.version}.0 Awaiting Approval`,
        message: `${currentUser.name} submitted the initial project agreement ($${agr.budget}, ${agr.timelineDays} days).`,
        linkTab: 'agreements',
        linkProjectId: proj.id,
      });
    }
  };

  // Submit Client Change Request
  const submitChangeRequestByClient = (projectId: string, requestedText: string): ScopeChangeRequest => {
    const proj = projects.find((p) => p.id === projectId);
    const newReq: ScopeChangeRequest = {
      id: `req-${Date.now()}`,
      projectId,
      clientId: currentUser.id,
      freelancerId: proj?.freelancerId || 'freelancer-a',
      title: 'Additional Feature & Scope Expansion Request',
      requestedText,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };

    setChangeRequests((prev) => [newReq, ...prev]);

    // Mark project status as scope_alert
    if (proj) {
      updateProject(projectId, { status: 'scope_alert' });

      addAuditEvent(
        projectId,
        'Additional Requirements Submitted',
        `Client requested: "${requestedText.substring(0, 100)}..."`,
        'active',
        'scope_alert'
      );

      addNotification({
        recipientId: proj.freelancerId,
        type: 'scope_request',
        title: '⚠️ Scope Alert: New Client Requirements Submitted',
        message: `${currentUser.name} requested modifications: "${requestedText.substring(0, 70)}..." Run ScopeGuard AI to assess impact.`,
        linkTab: 'scopeguard',
        linkProjectId: projectId,
        linkRequestId: newReq.id,
      });
    }

    return newReq;
  };

  // Run ScopeGuard AI Analysis (FEATURE 1, 2, 3)
  const runScopeGuardAnalysis = async (
    projectId: string,
    originalScope: string,
    originalBudget: number,
    originalDays: number,
    newRequirements: string
  ): Promise<ScopeGuardAnalysis> => {
    const proj = projects.find((p) => p.id === projectId);
    const response = await fetch('/api/gemini/analyze-scope', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectTitle: proj?.title || 'Website Development',
        originalScope,
        originalBudget,
        originalTimelineDays: originalDays,
        newRequirements,
      }),
    });

    const result = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Scope analysis failed');
    }

    const analysisData: ScopeGuardAnalysis = {
      ...result.data,
      source: result.source,
      isSampleFallback: result.isSampleFallback,
      items: (result.data.items || []).map((it: ScopeItemAnalysis, idx: number) => ({
        ...it,
        id: `scope-item-${idx}`,
        freelancerStatus: it.freelancerStatus || 'pending',
        freelancerNotes: it.freelancerNotes || '',
      })),
    };

    // Store in latest change request if present
    setChangeRequests((prev) => {
      const match = prev.find((r) => r.projectId === projectId && r.status === 'submitted');
      if (match) {
        return prev.map((r) =>
          r.id === match.id
            ? {
                ...r,
                status: 'analyzed',
                analysis: analysisData,
                customAdditionalCost: analysisData.totalAdditionalCost,
                customAdditionalDays: analysisData.totalAdditionalDays,
              }
            : r
        );
      }
      return prev;
    });

    if (proj) {
      addAuditEvent(
        projectId,
        'ScopeGuard AI Analysis Executed',
        `Analyzed ${analysisData.items.length} items (${analysisData.riskLevel} risk). Projected additional cost: +$${analysisData.totalAdditionalCost}.`,
        'scope_alert',
        'analyzed'
      );

      addNotification({
        recipientId: currentUser.id,
        type: 'analysis',
        title: 'ScopeGuard AI Analysis Completed',
        message: `Detected ${analysisData.items.length} scope differences. Review AI evidence and effort breakdown.`,
        linkTab: 'scopeguard',
        linkProjectId: projectId,
      });
    }

    return analysisData;
  };

  // Freelancer verifies or edits an AI finding (FEATURE 2)
  const updateScopeItemFinding = (
    requestId: string,
    itemIndex: number,
    updates: Partial<ScopeItemAnalysis>
  ) => {
    setChangeRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId || !r.analysis) return r;
        const updatedItems = [...r.analysis.items];
        if (updatedItems[itemIndex]) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            ...updates,
          };
        }
        return {
          ...r,
          analysis: {
            ...r.analysis,
            items: updatedItems,
          },
        };
      })
    );
  };

  // Send Revised Proposal to Client
  const sendRevisedProposal = (
    requestId: string,
    cost: number,
    days: number,
    notes: string,
    analysis?: ScopeGuardAnalysis
  ) => {
    let targetReq: ScopeChangeRequest | undefined = changeRequests.find((r) => r.id === requestId);

    if (!targetReq) {
      const proj = projects.find((p) => p.id === selectedProjectId);
      targetReq = {
        id: `req-${Date.now()}`,
        projectId: selectedProjectId,
        clientId: proj?.clientId || 'client-a',
        freelancerId: currentUser.id,
        title: 'Revised Proposal for Scope Additions',
        requestedText: 'Add 3 additional pages, add an admin dashboard, integrate a payment gateway',
        submittedAt: new Date().toISOString(),
        status: 'proposal_sent',
        analysis,
        customAdditionalCost: cost,
        customAdditionalDays: days,
        freelancerProposalNotes: notes,
        proposalSentAt: new Date().toISOString(),
      };
      setChangeRequests((prev) => [targetReq!, ...prev]);
    } else {
      setChangeRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'proposal_sent',
                customAdditionalCost: cost,
                customAdditionalDays: days,
                freelancerProposalNotes: notes,
                proposalSentAt: new Date().toISOString(),
                ...(analysis ? { analysis } : {}),
              }
            : r
        )
      );
    }

    const proj = projects.find((p) => p.id === targetReq?.projectId);
    if (proj) {
      addAuditEvent(
        proj.id,
        'Revised Scope Proposal Sent',
        `Transmitted proposal to client with +$${cost} and +${days} days. Notes: "${notes.substring(0, 60)}..."`,
        'analyzed',
        'proposal_sent'
      );

      addNotification({
        recipientId: proj.clientId,
        type: 'proposal',
        title: `Revised Proposal Received: +$${cost} | +${days} Days`,
        message: `${currentUser.name} submitted a ScopeGuard-backed proposal for your new requirements. Please review & sign Version 2.0.`,
        linkTab: 'proposals',
        linkProjectId: proj.id,
        linkRequestId: targetReq.id,
      });
    }
  };

  // Client Accepts Proposal -> Creates Version 2.0! (FEATURE 1, 6)
  const acceptRevisedProposal = (requestId: string) => {
    const req = changeRequests.find((r) => r.id === requestId) || changeRequests[0];
    const projectId = req ? req.projectId : selectedProjectId;
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const addCost = req?.customAdditionalCost || (req?.analysis?.totalAdditionalCost ?? 150);
    const addDays = req?.customAdditionalDays || (req?.analysis?.totalAdditionalDays ?? 7);

    const oldBudget = proj.budget;
    const newBudget = oldBudget + addCost;
    const oldDays = proj.timelineDays;
    const newDays = oldDays + addDays;

    // 1. Mark request accepted
    setChangeRequests((prev) =>
      prev.map((r) =>
        r.id === (req ? req.id : r.id)
          ? { ...r, status: 'accepted', clientReviewedAt: new Date().toISOString() }
          : r
      )
    );

    // 2. Mark Version 1 agreement as superseded
    setAgreements((prev) =>
      prev.map((a) =>
        a.projectId === projectId && a.version === 1 ? { ...a, status: 'superseded' } : a
      )
    );

    // 3. Create Version 2.0 Agreement
    const updatedDeliverables = [
      ...proj.deliverables,
      '3 Additional custom pages (Expanding total footprint to 8 pages)',
      'Admin Dashboard with user & content management controls',
      'Secure Payment Gateway Integration with webhook processing',
    ];

    const v2Content = `MASTER FREELANCE SERVICES AGREEMENT – VERSION 2.0 (REVISED ADDENDUM)
-----------------------------------------------------------------------------
FREELANCER: Alex Rivera (Senior Web Developer)
CLIENT: Marcus Vance (NexaTech Solutions)
AMENDMENT EFFECTIVE DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
SUPERSEDES: Version 1.0 (Signed Nov 1, 2026)

1. REVISED SCOPE OF WORK & EXPANDED DELIVERABLES
In addition to the original 5 pages, contact form, and responsive design, this Version 2.0 explicitly incorporates the following additions validated via ScopeGuard™ AI:
   1.1 Three (3) Additional Custom Pages (Expanding total footprint to 8 pages)
   1.2 Dedicated Admin Dashboard with role-based view and management controls
   1.3 Production-grade Payment Gateway Integration with checkout workflows and validation

2. REVISED BUDGET & TIMELINE ADJUSTMENT
Original Baseline Budget: $${oldBudget} USD
Agreed Scope Expansion Fee: +$${addCost} USD
REVISED TOTAL CONTRACT VALUE: $${newBudget} USD

Original Project Timeline: ${oldDays} business days
Added Implementation Window: +${addDays} business days
REVISED TOTAL PROJECT DURATION: ${newDays} business days

3. UPDATED MILESTONE SCHEDULE
- Milestone 1: Wireframing & Initial Pages ($80, Released)
- Milestone 2: 5 Responsive Pages & Contact Form ($120, Escrow Funded)
- Milestone 3: Admin Dashboard & Payment Gateway Integration ($${addCost}, Scheduled Escrow)

4. DISPUTE PREVENTION & AUDIT RECORD
Both parties have agreed to these terms transparently via Dealora ScopeGuard AI.`;

    const v2Agreement: Agreement = {
      id: `agr-${projectId}-v2`,
      projectId,
      version: 2,
      title: `Services Agreement v2.0 – Corporate Website (Revised Scope)`,
      content: v2Content,
      deliverables: updatedDeliverables,
      budget: newBudget,
      timelineDays: newDays,
      status: 'accepted',
      createdAt: new Date().toISOString(),
      signedAt: new Date().toISOString(),
      revisionLimit: 3,
      notes: `Upgraded from v1.0. Scope expanded with +$${addCost} and +${addDays} days.`,
      signers: {
        freelancerName: 'Alex Rivera',
        freelancerSignedAt: new Date().toISOString(),
        clientName: 'Marcus Vance',
        clientSignedAt: new Date().toISOString(),
      },
    };

    setAgreements((prev) => [v2Agreement, ...prev]);

    // 4. Update Project with Version 2, updated budget, and Milestone 3
    const newMilestone: ProjectMilestone = {
      id: `ms-${projectId}-3`,
      projectId,
      title: 'Milestone 3: Admin Dashboard & Payment Gateway Integration',
      description: 'Role-based admin view, transaction state management, and payment checkout testing.',
      amount: addCost,
      dueDate: new Date(Date.now() + newDays * 86400000).toISOString().split('T')[0],
      status: 'escrow_funded',
      simulatedTxId: `TX-SIM-${Math.floor(100000 + Math.random() * 900000)}-TB`,
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              budget: newBudget,
              timelineDays: newDays,
              currentVersion: 2,
              status: 'active',
              deliverables: updatedDeliverables,
              milestones: [...p.milestones, newMilestone],
            }
          : p
      )
    );

    // 5. Append Audit Trail Event
    addAuditEvent(
      projectId,
      'Agreement Version 2.0 Accepted & Activated',
      `Client approved scope addendum. Revised budget: $${newBudget} (+$${addCost}), Timeline: ${newDays} days (+${addDays}d). Milestone 3 ($${addCost}) scheduled in escrow.`,
      'proposal_sent',
      'active',
      {
        oldBudget,
        newBudget,
        oldDays,
        newDays,
        agreementVersion: 2,
      }
    );

    // 6. Confetti
    try {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#10b981', '#6366f1'],
      });
    } catch {}

    // 7. Notifications
    addNotification({
      recipientId: proj.freelancerId,
      type: 'proposal',
      title: '🎉 Proposal Accepted! Version 2.0 Activated',
      message: `${currentUser.name} accepted your revised proposal ($${newBudget}, ${newDays} days). Version 2 agreement is officially live!`,
      linkTab: 'version-history',
      linkProjectId: projectId,
    });

    addNotification({
      recipientId: currentUser.id,
      type: 'agreement',
      title: 'Agreement Version 2.0 Confirmed',
      message: `You successfully accepted the scope expansion proposal for ${proj.title}.`,
      linkTab: 'version-history',
      linkProjectId: projectId,
    });
  };

  // Client Rejects Proposal
  const rejectRevisedProposal = (requestId: string, reason?: string) => {
    const req = changeRequests.find((r) => r.id === requestId);
    if (!req) return;

    setChangeRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              clientReviewedAt: new Date().toISOString(),
              clientRejectionReason: reason || 'Client decided not to proceed with additional features at this time.',
            }
          : r
      )
    );

    const proj = projects.find((p) => p.id === req.projectId);
    if (proj) {
      updateProject(proj.id, { status: 'active' });

      addAuditEvent(
        proj.id,
        'Revised Proposal Declined – Version 1.0 Preserved',
        `Client opted out of scope additions. Reason: "${reason || 'Budget constraints'}". Original v1.0 terms ($${proj.budget}) preserved.`,
        'proposal_sent',
        'active'
      );

      addNotification({
        recipientId: proj.freelancerId,
        type: 'proposal',
        title: 'Proposal Declined – Original Scope Maintained',
        message: `${currentUser.name} opted to proceed with original Version 1.0 specifications only. Original budget and timeline are intact.`,
        linkTab: 'agreements',
        linkProjectId: proj.id,
      });
    }
  };

  // Milestone updates
  const updateMilestoneStatus = async (projectId: string, milestoneId: string, status: ProjectMilestone['status']) => {
    // Sync with backend escrow engine
    try {
      if (status === 'escrow_funded') {
        const initRes = await api.payments.initialize(projectId, milestoneId, currentUser.id);
        if (initRes.success && initRes.transaction) {
          await api.payments.lock(initRes.transaction.id, currentUser.id);
        }
      } else if (status === 'in_review') {
        await api.milestones.submit(milestoneId, 'Deliverable submitted for client review', currentUser.id);
      } else if (status === 'released') {
        await api.milestones.approve(milestoneId, currentUser.id);
      }
    } catch (e) {
      console.warn('Backend payment sync fallback:', e);
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          milestones: p.milestones.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  status,
                  releaseDate: status === 'released' ? new Date().toISOString().split('T')[0] : m.releaseDate,
                }
              : m
          ),
        };
      })
    );

    const targetProj = projects.find((p) => p.id === projectId);
    const targetMs = targetProj?.milestones.find((m) => m.id === milestoneId);

    if (status === 'released') {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      addAuditEvent(
        projectId,
        `Milestone Payment Released ($${targetMs?.amount || 0})`,
        `Client verified deliverable for "${targetMs?.title}". Simulated TX ${targetMs?.simulatedTxId} cleared.`,
        'escrow_funded',
        'released'
      );

      addNotification({
        recipientId: targetProj?.freelancerId || 'freelancer-a',
        type: 'milestone',
        title: `Milestone Payment Released ($${targetMs?.amount || 0})`,
        message: `Milestone "${targetMs?.title}" has been authorized and simulated payout recorded.`,
        linkTab: 'milestones',
        linkProjectId: projectId,
      });
    } else {
      addAuditEvent(
        projectId,
        `Milestone Status Updated to ${status}`,
        `Milestone "${targetMs?.title}" updated.`,
        targetMs?.status,
        status
      );
    }
  };

  const addProjectMilestone = (
    projectId: string,
    milestoneData: Omit<ProjectMilestone, 'id' | 'projectId' | 'simulatedTxId'>
  ) => {
    const newMs: ProjectMilestone = {
      ...milestoneData,
      id: `ms-${projectId}-${Date.now()}`,
      projectId,
      simulatedTxId: `TX-SIM-${Math.floor(100000 + Math.random() * 900000)}-TB`,
    };

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, milestones: [...p.milestones, newMs] } : p))
    );

    addAuditEvent(
      projectId,
      'New Milestone Added',
      `Added milestone phase "${newMs.title}" ($${newMs.amount}).`
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Open PDF Export Dialog
  const openAgreementExport = (agreementId?: string) => {
    const targetId = agreementId || agreements.find((a) => a.projectId === selectedProjectId)?.id || null;
    setExportTargetAgreementId(targetId);
    setIsExportModalOpen(true);
  };

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.AGREEMENTS);
    localStorage.removeItem(STORAGE_KEYS.CHANGE_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.WALKTHROUGH_STEP);

    setProjects(INITIAL_PROJECTS);
    setAgreements(INITIAL_AGREEMENTS);
    setChangeRequests(INITIAL_CHANGE_REQUESTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(DEMO_USERS[0]);
    setWalkthroughStep(0);
    setActiveTab('dashboard');
    setSelectedProjectId('proj-1');
  };

  // Launch Dedicated Interactive Judge Demo Mode (FEATURE 8)
  const launchInteractiveJudgeDemo = () => {
    setIsJudgeModalOpen(true);
  };

  // 19-Step Demo Walkthrough Automator
  const executeWalkthroughAction = async (step: number) => {
    setWalkthroughStep(step);
    switch (step) {
      case 0:
      case 1:
        switchUserById('freelancer-a');
        setActiveTab('dashboard');
        break;
      case 2:
      case 3:
      case 4:
        switchUserById('freelancer-a');
        setSelectedProjectId('proj-1');
        setActiveTab('projects');
        break;
      case 5:
        switchUserById('freelancer-a');
        setSelectedProjectId('proj-1');
        setActiveTab('agreements');
        break;
      case 6:
      case 7:
        switchUserById('client-a');
        setSelectedProjectId('proj-1');
        setActiveTab('submit-scope');
        break;
      case 8:
      case 9:
      case 10:
        switchUserById('freelancer-a');
        setSelectedProjectId('proj-1');
        setActiveTab('scopeguard');
        break;
      case 11:
      case 12:
      case 13:
      case 14:
        switchUserById('freelancer-a');
        setActiveTab('scopeguard');
        break;
      case 15:
        switchUserById('client-a');
        setSelectedProjectId('proj-1');
        setActiveTab('proposals');
        break;
      case 16:
      case 17:
        switchUserById('client-a');
        acceptRevisedProposal('req-1');
        setActiveTab('version-history');
        break;
      case 18:
      case 19:
        setActiveTab('version-history');
        break;
      default:
        break;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserById,
        users,
        projects,
        currentUserProjects,
        agreements,
        changeRequests,
        notifications,
        activeTab,
        setActiveTab,
        selectedProjectId,
        setSelectedProjectId,
        createProject,
        updateProject,
        getProjectHealth,
        addAuditEvent,
        createAgreementDraft,
        sendAgreementToClient,
        submitChangeRequestByClient,
        runScopeGuardAnalysis,
        updateScopeItemFinding,
        sendRevisedProposal,
        acceptRevisedProposal,
        rejectRevisedProposal,
        updateMilestoneStatus,
        addProjectMilestone,
        markNotificationRead,
        clearAllNotifications,
        isJudgeModalOpen,
        setIsJudgeModalOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        exportTargetAgreementId,
        openAgreementExport,
        resetDemoData,
        walkthroughStep,
        setWalkthroughStep,
        isWalkthroughOpen,
        setIsWalkthroughOpen,
        executeWalkthroughAction,
        launchInteractiveJudgeDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
