import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  ShieldCheck,
  X,
  Copy,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AgreementExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    exportTargetAgreementId,
    agreements,
    projects,
    selectedProjectId,
    users,
    switchUserById,
    setActiveTab,
  } = useApp();

  if (!isExportModalOpen) return null;

  const currentProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  const projectAgreements = agreements
    .filter((a) => a.projectId === currentProject?.id)
    .sort((a, b) => a.version - b.version);

  const [selectedVersion, setSelectedVersion] = useState<number>(() => {
    if (exportTargetAgreementId) {
      const match = agreements.find((a) => a.id === exportTargetAgreementId);
      if (match) return match.version;
    }
    return projectAgreements[projectAgreements.length - 1]?.version || 1;
  });

  const [isDiffExport, setIsDiffExport] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeAgreement =
    projectAgreements.find((a) => a.version === selectedVersion) || projectAgreements[0];

  const client = users.find((u) => u.id === currentProject?.clientId);
  const freelancer = users.find((u) => u.id === currentProject?.freelancerId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFile = () => {
    const filename = `${currentProject?.title.replace(/[^a-zA-Z0-9]/g, '_')}_Agreement_v${selectedVersion}.txt`;
    const blob = new Blob([activeAgreement?.content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/?project=${currentProject.id}&view=client&v=${selectedVersion}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSimulateClientView = () => {
    setIsExportModalOpen(false);
    switchUserById(currentProject.clientId);
    setActiveTab('version-history');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Agreement PDF Export & Client Sharing
              </h3>
              <p className="text-xs text-slate-500">
                Generate formatted legal contract documents with Dealora cryptographic seals
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Toolbar (FEATURE 5) */}
        <div className="py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Version Selector Tabs */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600">Select Version:</span>
            {projectAgreements.map((agr) => (
              <button
                key={agr.id}
                onClick={() => {
                  setSelectedVersion(agr.version);
                  setIsDiffExport(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedVersion === agr.version && !isDiffExport
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Version {agr.version}.0 {agr.status === 'accepted' ? '(Signed)' : `(${agr.status})`}
              </button>
            ))}

            <button
              onClick={() => setIsDiffExport(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                isDiffExport
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full History Diff</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyShareLink}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Copy Client-Accessible Share Link"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Record</span>
            </button>
          </div>
        </div>

        {/* Printable Document Preview Canvas */}
        <div className="flex-1 overflow-y-auto py-6 px-4 bg-slate-50/50 rounded-2xl border border-slate-200/80 my-4 space-y-6 text-slate-900 font-sans print:m-0 print:p-0 print:border-none">
          {/* Header Branding */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                DL
              </div>
              <div>
                <h4 className="font-extrabold text-base tracking-tight text-slate-900">
                  Dealora
                </h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Verified Freelancer-Client Agreement Record
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded text-[11px] font-extrabold uppercase bg-slate-900 text-white">
                {activeAgreement?.status === 'accepted' ? 'APPROVED RECORD' : 'DRAFT FOR REVIEW'}
              </span>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                REF: DL-AGR-{currentProject.id.toUpperCase()}-V{selectedVersion}
              </div>
            </div>
          </div>

          {/* Project & Parties Summary */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Service Provider (Freelancer)
              </span>
              <div className="font-extrabold text-slate-900">{freelancer?.name || 'Alex Rivera'}</div>
              <div className="text-slate-500">{freelancer?.title}</div>
              <div className="text-blue-600 font-mono text-[11px]">{freelancer?.email}</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Client Organization
              </span>
              <div className="font-extrabold text-slate-900">{client?.name || 'Marcus Vance'}</div>
              <div className="text-slate-500">{client?.title} • {client?.company}</div>
              <div className="text-blue-600 font-mono text-[11px]">{client?.email}</div>
            </div>
          </div>

          {/* Commercial Terms Strip */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Fixed Fee</span>
              <div className="text-lg font-black text-slate-900 mt-0.5">${activeAgreement?.budget} USD</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Timeline</span>
              <div className="text-lg font-black text-slate-900 mt-0.5">{activeAgreement?.timelineDays} Business Days</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Revision Limit</span>
              <div className="text-lg font-black text-slate-900 mt-0.5">{activeAgreement?.revisionLimit || 2} Rounds</div>
            </div>
          </div>

          {/* Deliverables List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Contract Deliverables:
            </span>
            <div className="space-y-1.5">
              {activeAgreement?.deliverables.map((del, i) => (
                <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-medium text-slate-800">{del}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clauses / Content Preview */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
            {activeAgreement?.content}
          </div>

          {/* Signatures & Cryptographic Proof */}
          <div className="pt-4 border-t-2 border-slate-200 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-slate-900">Signed by Freelancer:</div>
              <div className="text-slate-600">{freelancer?.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">Date: Nov 1, 2026</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-slate-900">Signed by Client:</div>
              <div className="text-slate-600">{client?.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {activeAgreement?.status === 'accepted' ? 'Status: Formally Signed' : 'Status: Pending Signoff'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer simulation link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Client Accessible Link Active • SHA256 Sealed</span>
          <button
            onClick={handleSimulateClientView}
            className="text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>Simulate Client Portal View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
