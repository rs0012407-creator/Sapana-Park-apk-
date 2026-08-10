import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldCheck,
  FileCheck,
  Upload,
  Phone,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileText,
  Trash2,
  Eye,
  Download,
  UserPlus,
  Mail,
  Smartphone,
  Shield,
  Edit,
} from 'lucide-react';
import { UserSession } from '../api/authApi';
import { VerificationDocument, FamilyMember } from '../models/resident';

interface ProfileModalProps {
  session: UserSession;
  onClose: () => void;
  onUpdateSession?: (updatedSession: UserSession) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  session,
  onClose,
  onUpdateSession,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'family' | 'documents'>('details');

  // Document states
  const initialDocs: VerificationDocument[] = session.resident.verificationDocuments || [
    {
      id: 'DOC-01',
      type: 'Aadhaar Card',
      documentNumber: 'XXXX-XXXX-8921',
      status: 'Verified',
      uploadedDate: '2025-04-10',
      fileName: 'Aadhaar_Front_Back.pdf',
    },
    {
      id: 'DOC-02',
      type: 'PAN Card',
      documentNumber: 'ABCDE1234F',
      status: 'Verified',
      uploadedDate: '2025-04-10',
      fileName: 'PAN_Card.pdf',
    },
    {
      id: 'DOC-03',
      type: session.resident.residentType === 'Owner' ? 'Possession Certificate' : 'Rent Agreement',
      documentNumber: session.resident.ownershipShareNo || 'CERT-452-2025',
      status: 'Verified',
      uploadedDate: '2025-05-01',
      fileName: session.resident.residentType === 'Owner' ? 'Share_Certificate.pdf' : 'Registered_Rent_Agreement.pdf',
    },
    {
      id: 'DOC-04',
      type: 'Police Verification Form N-1',
      documentNumber: 'POL-GOA-2025-88',
      status: session.resident.residentType === 'Tenant' ? 'Verified' : 'Submitted',
      uploadedDate: '2025-06-15',
      fileName: 'Police_N1_Stamp.pdf',
    },
  ];

  const [documents, setDocuments] = useState<VerificationDocument[]>(initialDocs);
  const [showAddDocForm, setShowAddDocForm] = useState<boolean>(false);
  const [newDocType, setNewDocType] = useState<VerificationDocument['type']>('Aadhaar Card');
  const [newDocNumber, setNewDocNumber] = useState<string>('');
  const [newFileName, setNewFileName] = useState<string>('');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');

  // Family Occupant states
  const initialFamily: FamilyMember[] = session.resident.familyMembers || [
    {
      id: 'FAM-01',
      name: 'Sunita Naik',
      relation: 'Spouse',
      age: 42,
      phone: '+91 98221 45671',
      idProofNumber: 'Aadhaar XXXX-9012',
    },
    {
      id: 'FAM-02',
      name: 'Aarav Naik',
      relation: 'Son',
      age: 16,
      phone: '+91 98221 45672',
      idProofNumber: 'Aadhaar XXXX-3456',
    },
  ];

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamily);
  const [showAddFamilyForm, setShowAddFamilyForm] = useState<boolean>(false);
  const [famName, setFamName] = useState('');
  const [famRelation, setFamRelation] = useState('Spouse');
  const [famAge, setFamAge] = useState<number>(30);
  const [famPhone, setFamPhone] = useState('');
  const [famIdProof, setFamIdProof] = useState('');

  // Preview Image Modal state
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);

  // Sync back to session
  const saveSessionUpdates = (updatedDocs: VerificationDocument[], updatedFamily: FamilyMember[]) => {
    if (onUpdateSession) {
      const updatedSession: UserSession = {
        ...session,
        resident: {
          ...session.resident,
          verificationDocuments: updatedDocs,
          familyMembers: updatedFamily,
          occupantsCount: updatedFamily.length + 1, // Primary member + family
        },
      };
      onUpdateSession(updatedSession);
    }
  };

  // Upload file handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Document add handler
  const handleAddDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocNumber.trim()) return;

    const createdDoc: VerificationDocument = {
      id: `DOC-${Date.now()}`,
      type: newDocType,
      documentNumber: newDocNumber,
      status: 'Submitted',
      uploadedDate: new Date().toISOString().split('T')[0],
      fileName: newFileName || `${newDocType.replace(/\s+/g, '_')}.pdf`,
      fileDataUrl,
    };

    const updatedDocs = [createdDoc, ...documents];
    setDocuments(updatedDocs);
    saveSessionUpdates(updatedDocs, familyMembers);

    setShowAddDocForm(false);
    setNewDocNumber('');
    setNewFileName('');
    setFileDataUrl('');
  };

  // Document delete handler
  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document record?')) {
      const updatedDocs = documents.filter((d) => d.id !== id);
      setDocuments(updatedDocs);
      saveSessionUpdates(updatedDocs, familyMembers);
    }
  };

  // Family member add handler
  const handleAddFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!famName.trim()) return;

    const newMember: FamilyMember = {
      id: `FAM-${Date.now()}`,
      name: famName,
      relation: famRelation,
      age: famAge || 25,
      phone: famPhone,
      idProofNumber: famIdProof,
    };

    const updatedFamily = [...familyMembers, newMember];
    setFamilyMembers(updatedFamily);
    saveSessionUpdates(documents, updatedFamily);

    setShowAddFamilyForm(false);
    setFamName('');
    setFamPhone('');
    setFamIdProof('');
  };

  // Family member delete handler
  const handleDeleteFamilyMember = (id: string) => {
    if (window.confirm('Are you sure you want to delete this occupant/family member?')) {
      const updatedFamily = familyMembers.filter((m) => m.id !== id);
      setFamilyMembers(updatedFamily);
      saveSessionUpdates(documents, updatedFamily);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl my-auto p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
              {session.resident.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-white">{session.resident.name}</h2>
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Member</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Flat <strong className="text-emerald-300 font-mono">{session.resident.flatNumber}</strong> • Member ID: <span className="font-mono text-slate-200">{session.resident.memberId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex space-x-2 my-4 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'details'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Profile Particulars</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'family'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Family & Occupants ({familyMembers.length + 1})</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'documents'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Govt Docs ({documents.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* TAB 1: Member Particulars */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Primary Identity Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Sapana Park CHS Flat Allocation</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Resident Role</span>
                    <strong className="text-white font-bold">{session.resident.residentType}</strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Wing & Flat No.</span>
                    <strong className="text-emerald-300 font-mono font-bold">Wing {session.resident.wing} • {session.resident.flatNumber}</strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Society Member ID</span>
                    <strong className="text-amber-300 font-mono font-bold">{session.resident.memberId}</strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Share Certificate No.</span>
                    <strong className="text-slate-200 font-mono font-semibold">{session.resident.ownershipShareNo || 'SHARE-GOA-452/A'}</strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Registered Occupants</span>
                    <strong className="text-slate-200 font-semibold">{familyMembers.length + 1} Residents</strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Move-In Possession</span>
                    <strong className="text-slate-200 font-semibold">{session.resident.moveInDate || '2021-03-15'}</strong>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Phone className="w-4 h-4" />
                  <span>Primary Contacts & Emergency Reference</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Mobile Phone Number</span>
                    <span className="font-mono text-emerald-300 font-bold">{session.resident.phone}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Registered Email Address</span>
                    <span className="font-mono text-slate-200">{session.resident.email}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Emergency SOS Contact</span>
                      <strong className="text-white">{session.resident.emergencyContact.name} ({session.resident.emergencyContact.relation})</strong>
                    </div>
                    <span className="font-mono text-amber-400 font-bold text-xs">{session.resident.emergencyContact.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Family & Occupants Details */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Registered Flat Occupants & Family Members
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Add family members or tenant occupants for gate security pass verification
                  </p>
                </div>

                <button
                  onClick={() => setShowAddFamilyForm(!showAddFamilyForm)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Occupant</span>
                </button>
              </div>

              {/* Add Family Member Form */}
              {showAddFamilyForm && (
                <form
                  onSubmit={handleAddFamilySubmit}
                  className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3 animate-in fade-in duration-150 text-xs"
                >
                  <h4 className="font-bold text-emerald-300 flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>Register New Family Occupant</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Naik"
                        value={famName}
                        onChange={(e) => setFamName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Relationship</label>
                      <select
                        value={famRelation}
                        onChange={(e) => setFamRelation(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Relative">Relative</option>
                        <option value="Domestic Help">Domestic Help</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Age</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={famAge}
                        onChange={(e) => setFamAge(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Mobile Number</label>
                      <input
                        type="text"
                        placeholder="+91 98220 00000"
                        value={famPhone}
                        onChange={(e) => setFamPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">ID Proof Reference</label>
                      <input
                        type="text"
                        placeholder="Aadhaar / Voter ID"
                        value={famIdProof}
                        onChange={(e) => setFamIdProof(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddFamilyForm(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow"
                    >
                      Save Occupant
                    </button>
                  </div>
                </form>
              )}

              {/* Primary Head Member Card */}
              <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 p-3.5 rounded-2xl border border-emerald-500/40 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <strong className="text-white font-bold">{session.resident.name}</strong>
                      <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Primary Member (Head)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Phone: <span className="text-emerald-300 font-mono">{session.resident.phone}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Family Members List */}
              <div className="space-y-2">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-slate-900 text-slate-300 rounded-xl border border-slate-800">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <strong className="text-white font-bold">{member.name}</strong>
                          <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {member.relation} ({member.age} yrs)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {member.phone ? `Mobile: ${member.phone}` : 'No separate phone'} {member.idProofNumber ? `• ${member.idProofNumber}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteFamilyMember(member.id)}
                      title="Delete occupant details"
                      className="p-2 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-xl transition border border-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Verification Documents & Upload/Delete */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Member Verification & ID Records
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Aadhaar, PAN, Share Certificate, Police Verification & Tenant Agreements
                  </p>
                </div>

                <button
                  onClick={() => setShowAddDocForm(!showAddDocForm)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Document</span>
                </button>
              </div>

              {/* Add New Document Form */}
              {showAddDocForm && (
                <form
                  onSubmit={handleAddDocumentSubmit}
                  className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="text-xs font-bold text-emerald-300 flex items-center space-x-1">
                    <Upload className="w-4 h-4" />
                    <span>Upload Government ID / Verification Document</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Document Category</label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Possession Certificate">Possession Certificate / Sale Deed</option>
                        <option value="Rent Agreement">Registered Rent Agreement</option>
                        <option value="Police Verification Form N-1">Police Verification Form N-1</option>
                        <option value="Electricity Bill">Electricity / PWD Bill</option>
                        <option value="Other">Other Certificate</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Document Number / Reference ID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. XXXX-1234-8890 or POL-GOA-102"
                        value={newDocNumber}
                        onChange={(e) => setNewDocNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Select File / Take Photo</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-1.5 text-slate-300 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDocForm(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow"
                    >
                      Submit & Save
                    </button>
                  </div>
                </form>
              )}

              {/* Documents List */}
              <div className="space-y-2.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <strong className="text-white font-bold">{doc.type}</strong>
                          <span
                            className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase ${
                              doc.status === 'Verified'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : doc.status === 'Submitted'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {doc.documentNumber} • Uploaded: {doc.uploadedDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {doc.fileName && (
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded font-mono hidden sm:inline border border-slate-800">
                          {doc.fileName}
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete Document"
                        className="p-2 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-xl transition border border-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
