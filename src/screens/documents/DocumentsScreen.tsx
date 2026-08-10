import React, { useState } from 'react';
import {
  FileText,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  ShieldCheck,
  X,
  FileCheck,
  HelpCircle,
  Download,
} from 'lucide-react';
import { ByeLawChapter, NOCApplication, NOCType } from '../../models/document';
import { BYE_LAW_CHAPTERS, submitNOCApplication, approveNOC } from '../../api/documentApi';
import { GOA_SOCIETY_ACT_HIGHLIGHTS, COMPLIANCE_FORMS_LIST } from '../../../docs/goa_society_act_reference';
import { printNOCCertificate } from '../../utils/pdfGenerator';
import { UserSession } from '../../api/authApi';

interface DocumentsScreenProps {
  session: UserSession;
  nocs: NOCApplication[];
  onRefreshNOCs: () => void;
}

export const DocumentsScreen: React.FC<DocumentsScreenProps> = ({
  session,
  nocs,
  onRefreshNOCs,
}) => {
  const [activeTab, setActiveTab] = useState<'noc' | 'byelaws' | 'goa_act'>('noc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNOCModal, setShowNOCModal] = useState(false);

  // NOC Form State
  const [nocType, setNocType] = useState<NOCType>('Tenant Verification & Lease');
  const [purposeReason, setPurposeReason] = useState('');
  const [docName, setDocName] = useState('Leave_and_License_Agreement.pdf');

  const committeeView = session.role === 'Secretary' || session.role === 'Treasurer';

  const myNocs = nocs.filter(
    (n) => n.flatNumber === session.resident.flatNumber || committeeView
  );

  const handleNOCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purposeReason.trim()) return;

    submitNOCApplication(
      nocType,
      session.resident.name,
      session.resident.flatNumber,
      session.resident.phone,
      session.resident.email,
      purposeReason,
      [docName]
    );

    setPurposeReason('');
    setShowNOCModal(false);
    onRefreshNOCs();
  };

  const handleApproveNOC = (id: string) => {
    const approved = approveNOC(id, `${session.resident.name} (Hon. Secretary)`);
    if (approved) {
      onRefreshNOCs();
      printNOCCertificate(approved);
    }
  };

  const filteredByeLaws = BYE_LAW_CHAPTERS.filter(
    (ch) =>
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <span>Society Bye-Laws, NOC Forms & Goa Act Compliance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official NOC Certificates, Goa Co-operative Societies Act 2001 regulations & digital handbook
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('noc')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'noc' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            NOC Applications
          </button>
          <button
            onClick={() => setActiveTab('byelaws')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'byelaws' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Society Bye-Laws
          </button>
          <button
            onClick={() => setActiveTab('goa_act')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'goa_act' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Goa Act Reference
          </button>
        </div>
      </div>

      {/* NOC Tab */}
      {activeTab === 'noc' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-bold text-base">
              NOC Applications {committeeView ? '(All Society Flats)' : `(Flat ${session.resident.flatNumber})`}
            </h3>
            <button
              onClick={() => setShowNOCModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for New NOC</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myNocs.map((noc) => (
              <div
                key={noc.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-teal-400">{noc.id}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        noc.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {noc.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white">{noc.type}</h4>
                  <div className="text-xs text-slate-400 mt-1">
                    Applicant: <strong className="text-slate-200">{noc.applicantName}</strong> (Flat {noc.flatNumber})
                  </div>

                  <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    {noc.purposeReason}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Submitted: {noc.submissionDate}</span>

                  {noc.status === 'Approved' ? (
                    <button
                      onClick={() => printNOCCertificate(noc)}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-300 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 border border-emerald-500/30 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Official NOC</span>
                    </button>
                  ) : committeeView ? (
                    <button
                      onClick={() => handleApproveNOC(noc.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition shadow"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve & Generate NOC</span>
                    </button>
                  ) : (
                    <span className="text-amber-400 text-[11px] font-semibold">
                      Under Secretary Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bye-Laws Tab */}
      {activeTab === 'byelaws' && (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Sapana Park CHS Bye-Laws (e.g., non-occupancy, parking, late fee, renovation)..."
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-teal-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          </div>

          <div className="space-y-4">
            {filteredByeLaws.map((ch) => (
              <div key={ch.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-2 text-teal-400 font-bold text-xs uppercase mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Chapter {ch.chapterNumber}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{ch.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{ch.summary}</p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-400">
                  {ch.fullText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goa Act Reference Tab */}
      {activeTab === 'goa_act' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Goa Co-operative Societies Act 2001 - Statutory Compliance Highlights</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOA_SOCIETY_ACT_HIGHLIGHTS.map((sec, idx) => (
                <div key={idx} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-xs">
                  <div className="font-bold text-emerald-300 mb-1">{sec.sectionNo}: {sec.topic}</div>
                  <p className="text-slate-300 leading-relaxed">{sec.keyRequirement}</p>
                  <div className="mt-2 text-[10px] text-amber-300/80 italic">{sec.penaltyNotice}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
            <h3 className="font-bold text-base text-white">Standard Goa Society Compliance Forms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {COMPLIANCE_FORMS_LIST.map((form, idx) => (
                <div key={idx} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex items-start space-x-3">
                  <FileCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-200">{form.formCode}: {form.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{form.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Apply NOC Modal */}
      {showNOCModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Apply for Society NOC Certificate</span>
              </h3>
              <button onClick={() => setShowNOCModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNOCSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">NOC Type</label>
                <select
                  value={nocType}
                  onChange={(e) => setNocType(e.target.value as NOCType)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Tenant Verification & Lease">Tenant Verification & Lease</option>
                  <option value="Flat Renovation & Interior Work">Flat Renovation & Interior Work</option>
                  <option value="Passport Renewal">Passport Renewal</option>
                  <option value="Bank Loan & Flat Mortgage">Bank Loan & Flat Mortgage</option>
                  <option value="Vehicle Parking Slot Allotment">Vehicle Parking Slot Allotment</option>
                  <option value="Flat Transfer & Sale">Flat Transfer & Sale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Purpose / Details of Request
                </label>
                <textarea
                  value={purposeReason}
                  onChange={(e) => setPurposeReason(e.target.value)}
                  rows={3}
                  placeholder="State specific purpose, names of persons involved, or scope of renovation..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Attached Document Reference</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNOCModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 hover:text-white py-2.5 rounded-xl font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs transition shadow"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
