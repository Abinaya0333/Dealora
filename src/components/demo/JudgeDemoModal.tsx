import React from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Users,
  ShieldCheck,
  FileSignature,
  DollarSign,
  Clock,
  ArrowRight,
  X,
  AlertCircle,
  Coins,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const JudgeDemoModal: React.FC = () => {
  const {
    isJudgeModalOpen,
    setIsJudgeModalOpen,
    switchUserById,
    setActiveTab,
    setSelectedProjectId,
    acceptRevisedProposal,
    resetDemoData,
    submitChangeRequestByClient,
    projects,
  } = useApp();

  if (!isJudgeModalOpen) return null;

  const currentProject = projects.find((p) => p.id === 'proj-1') || projects[0];

  const judgeSteps = [
    {
      num: 1,
      title: 'Login as Freelancer A',
      desc: 'Switch to Alex Rivera (Senior Web Developer) profile.',
      roleBadge: 'Freelancer',
      run: () => {
        switchUserById('freelancer-a');
        setActiveTab('dashboard');
        setIsJudgeModalOpen(false);
      },
    },
    {
      num: 2,
      title: 'Verify Project Baseline ($200, 15d)',
      desc: 'Original scope: 5 pages, contact form, responsive design.',
      roleBadge: 'Freelancer',
      run: () => {
        switchUserById('freelancer-a');
        setSelectedProjectId('proj-1');
        setActiveTab('projects');
        setIsJudgeModalOpen(false);
      },
    },
    {
      num: 3,
      title: 'Switch to Client A & Submit Scope Additions',
      desc: 'Marcus Vance submits: 3 extra pages, Admin Dashboard, Payment Gateway.',
      roleBadge: 'Client',
      run: () => {
        switchUserById('client-a');
        setSelectedProjectId('proj-1');
        submitChangeRequestByClient(
          'proj-1',
          'Add 3 additional custom pages, add an admin dashboard with role-based auth, and integrate a secure payment gateway with webhook processing'
        );
        setActiveTab('submit-scope');
        setIsJudgeModalOpen(false);
      },
    },
    {
      num: 4,
      title: 'Switch to Freelancer A & Run ScopeGuard AI',
      desc: 'Gemini 3.8 Flash detects additions and calculates +$150 and +7 days.',
      roleBadge: 'Freelancer',
      run: () => {
        switchUserById('freelancer-a');
        setSelectedProjectId('proj-1');
        setActiveTab('scopeguard');
        setIsJudgeModalOpen(false);
      },
    },
    {
      num: 5,
      title: 'Review Evidence, AI Confidence & Estimates',
      desc: 'Inspect 5 category diffs, 95% AI confidence, and hourly assumptions.',
      roleBadge: 'Freelancer',
      run: () => {
        switchUserById('freelancer-a');
        setActiveTab('scopeguard');
        setIsJudgeModalOpen(false);
      },
    },
    {
      num: 6,
      title: 'Switch to Client A to Review Proposal',
      desc: 'Marcus Vance reviews formal proposal (+150, +7 days).',
      roleBadge: 'Client',
      run: () => {
        switchUserById('client-a');
        setSelectedProjectId('proj-1');
        setActiveTab('proposals');
        setIsJudgeModalOpen(false);
      },
    },
    {
      num: 7,
      title: 'Client Accepts Proposal & Activates v2.0',
      desc: 'Generates Version 2.0 without overwriting Version 1.0 ($350 total).',
      roleBadge: 'Client',
      run: () => {
        switchUserById('client-a');
        acceptRevisedProposal('req-1');
        setActiveTab('version-history');
        setIsJudgeModalOpen(false);
      },
    },
    {
      num: 8,
      title: 'Inspect Side-by-Side Version Evolution',
      desc: 'Compare v1.0 ($200) vs v2.0 ($350) with cryptographic seals.',
      roleBadge: 'Both',
      run: () => {
        setActiveTab('version-history');
        setIsJudgeModalOpen(false);
      },
    },
    {
      num: 9,
      title: 'Inspect Updated Milestone Escrow Ledger',
      desc: 'Milestone 3 ($150) scheduled in simulated escrow.',
      roleBadge: 'Escrow',
      run: () => {
        setActiveTab('milestones');
        setIsJudgeModalOpen(false);
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Hackathon Judge Demonstration Center
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                  Interactive Mode
                </span>
              </div>
              <p className="text-xs text-slate-500">
                1-click execution for the complete end-to-end Dealora protocol
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsJudgeModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice (FEATURE 8) */}
        <div className="my-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-start space-x-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>DEMO MODE – No real money is transferred or held:</strong> All PayPal escrow
            milestones, transactions, and agreements are simulated for safe hackathon review.
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-2 pr-1">
          {judgeSteps.map((step) => (
            <div
              key={step.num}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  {step.num}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{step.title}</h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                      {step.roleBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{step.desc}</p>
                </div>
              </div>

              <button
                onClick={step.run}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Execute Step</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer with Reset Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (confirm('Reset demo state to baseline ($200 project, Step 1)?')) {
                resetDemoData();
                setIsJudgeModalOpen(false);
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Step 1</span>
          </button>

          <button
            onClick={() => setIsJudgeModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Judge Center
          </button>
        </div>
      </div>
    </div>
  );
};
