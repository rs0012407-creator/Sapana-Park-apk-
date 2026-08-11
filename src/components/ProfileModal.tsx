import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldCheck,
  FileCheck,
  Upload,
  Phone,
  Building2,
  Users,
  Plus,
  FileText,
  Trash2,
  Eye,
  UserPlus,
  Mail,
  Edit,
  Heart,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Camera,
  Save,
  RotateCcw,
  User,
  Image,
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

  // Primary Profile Edit & Photo Upload State
  const [isEditingPrimary, setIsEditingPrimary] = useState(false);
  const [showDeleteProfileConfirm, setShowDeleteProfileConfirm] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  const [resName, setResName] = useState(session.resident.name);
  const [resEmail, setResEmail] = useState(session.resident.email);
  const [resPhone, setResPhone] = useState(session.resident.phone);
  const [resFlat, setResFlat] = useState(session.resident.flatNumber);
  const [resWing, setResWing] = useState(session.resident.wing);
  const [resResidentType, setResResidentType] = useState(session.resident.residentType);
  const [resMemberId, setResMemberId] = useState(session.resident.memberId || 'SP-RES-2026');
  const [resAvatarUrl, setResAvatarUrl] = useState(session.resident.avatarUrl || '');
  const [resEmergName, setResEmergName] = useState(session.resident.emergencyContact?.name || 'Managing Committee');
  const [resEmergRel, setResEmergRel] = useState(session.resident.emergencyContact?.relation || 'Secretary');
  const [resEmergPhone, setResEmergPhone] = useState(session.resident.emergencyContact?.phone || '+91 98221 45670');
  const [resOccupation, setResOccupation] = useState('Resident / Professional');
  const [resBloodGroup, setResBloodGroup] = useState('O+');
  const [resVehicles, setResVehicles] = useState(session.resident.vehicles ? session.resident.vehicles.join(', ') : 'GA-03-AB-1234');

  // Photo upload handler
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        setResAvatarUrl(photoData);
        if (onUpdateSession) {
          const updatedSession: UserSession = {
            ...session,
            resident: {
              ...session.resident,
              avatarUrl: photoData,
            },
            userAccount: session.userAccount
              ? {
                  ...session.userAccount,
                  profilePhoto: photoData,
                }
              : undefined,
          };
          onUpdateSession(updatedSession);
          setProfileSuccessMsg('Profile photo uploaded and updated!');
          setTimeout(() => setProfileSuccessMsg(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Photo delete / remove handler
  const handleDeleteProfilePhoto = () => {
    setResAvatarUrl('');
    if (onUpdateSession) {
      const updatedSession: UserSession = {
        ...session,
        resident: {
          ...session.resident,
          avatarUrl: '',
        },
        userAccount: session.userAccount
          ? {
              ...session.userAccount,
              profilePhoto: '',
            }
          : undefined,
      };
      onUpdateSession(updatedSession);
      setProfileSuccessMsg('Profile photo removed!');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    }
  };

  // Save Primary Resident Profile Details
  const handleSavePrimaryProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleArray = resVehicles.split(',').map((v) => v.trim()).filter(Boolean);

    const updatedSession: UserSession = {
      ...session,
      resident: {
        ...session.resident,
        name: resName,
        email: resEmail,
        phone: resPhone,
        flatNumber: resFlat,
        wing: resWing,
        residentType: resResidentType as any,
        memberId: resMemberId,
        avatarUrl: resAvatarUrl,
        vehicles: vehicleArray,
        emergencyContact: {
          name: resEmergName,
          relation: resEmergRel,
          phone: resEmergPhone,
        },
      },
      userAccount: session.userAccount
        ? {
            ...session.userAccount,
            fullName: resName,
            email: resEmail,
            mobileNumber: resPhone,
            flatNumber: resFlat,
            blockNumber: resWing,
            residentType: resResidentType as any,
            profilePhoto: resAvatarUrl,
          }
        : undefined,
    };

    if (onUpdateSession) {
      onUpdateSession(updatedSession);
    }
    setIsEditingPrimary(false);
    setProfileSuccessMsg('All profile details updated & saved!');
    setTimeout(() => setProfileSuccessMsg(null), 3000);
  };

  // Clear / Reset Profile Details handler
  const handleResetProfileDetails = () => {
    setResName('Sapana Park Resident');
    setResPhone('+91 90000 00000');
    setResAvatarUrl('');
    setResVehicles('');
    setResEmergName('Colony Security');
    setResEmergRel('Gate Security');
    setResEmergPhone('0832-2412345');

    const resetSession: UserSession = {
      ...session,
      resident: {
        ...session.resident,
        name: 'Sapana Park Resident',
        avatarUrl: '',
        phone: '+91 90000 00000',
        vehicles: [],
        emergencyContact: {
          name: 'Colony Security',
          relation: 'Gate Security',
          phone: '0832-2412345',
        },
      },
    };

    if (onUpdateSession) {
      onUpdateSession(resetSession);
    }
    setShowDeleteProfileConfirm(false);
    setIsEditingPrimary(false);
    setProfileSuccessMsg('Profile details cleared and reset!');
    setTimeout(() => setProfileSuccessMsg(null), 3000);
  };

  // Document states
  const initialDocs: VerificationDocument[] = session.resident.verificationDocuments || [
    {
      id: 'DOC-01',
      type: 'Aadhaar Card',
      documentNumber: 'XXXX-XXXX-8921',
      status: 'Verified',
      uploadedDate: '2025-04-10',
      fileName: 'Aadhaar_Front_Back.pdf',
      remarks: 'Primary Identity Verified by Managing Committee',
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
  const [newDocRemarks, setNewDocRemarks] = useState<string>('');
  const [newDocExpiry, setNewDocExpiry] = useState<string>('');
  const [newFileName, setNewFileName] = useState<string>('');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');

  // Preview Document Modal state
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);

  // Family Occupant states
  const initialFamily: FamilyMember[] = session.resident.familyMembers || [
    {
      id: 'FAM-01',
      name: 'Sunita Naik',
      relation: 'Spouse',
      age: 42,
      gender: 'Female',
      occupation: 'Architect / Interior Designer',
      email: 'sunita.naik@gmail.com',
      bloodGroup: 'O+',
      phone: '+91 98221 45671',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-9012',
    },
    {
      id: 'FAM-02',
      name: 'Aarav Naik',
      relation: 'Son',
      age: 16,
      gender: 'Male',
      occupation: 'Student (HSSC Goa Board)',
      bloodGroup: 'B+',
      phone: '+91 98221 45672',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-3456',
    },
  ];

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamily);
  const [showAddFamilyForm, setShowAddFamilyForm] = useState<boolean>(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);

  // Form Fields for Family Member
  const [famName, setFamName] = useState('');
  const [famRelation, setFamRelation] = useState('Spouse');
  const [famAge, setFamAge] = useState<number>(30);
  const [famGender, setFamGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [famOccupation, setFamOccupation] = useState('');
  const [famEmail, setFamEmail] = useState('');
  const [famBloodGroup, setFamBloodGroup] = useState('O+');
  const [famPhone, setFamPhone] = useState('');
  const [famIdProofType, setFamIdProofType] = useState('Aadhaar Card');
  const [famIdProofNumber, setFamIdProofNumber] = useState('');

  // Sync back to parent session
  const saveSessionUpdates = (updatedDocs: VerificationDocument[], updatedFamily: FamilyMember[]) => {
    if (onUpdateSession) {
      const updatedSession: UserSession = {
        ...session,
        resident: {
          ...session.resident,
          verificationDocuments: updatedDocs,
          familyMembers: updatedFamily,
          occupantsCount: updatedFamily.length + 1, // Primary head + family
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

  // Document Add Handler
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
      fileDataUrl: fileDataUrl || undefined,
      expiryDate: newDocExpiry || undefined,
      remarks: newDocRemarks || undefined,
    };

    const updatedDocs = [createdDoc, ...documents];
    setDocuments(updatedDocs);
    saveSessionUpdates(updatedDocs, familyMembers);

    setShowAddDocForm(false);
    setNewDocNumber('');
    setNewDocRemarks('');
    setNewDocExpiry('');
    setNewFileName('');
    setFileDataUrl('');
  };

  // Document Delete Handler
  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Are you sure you want to delete this identification document record?')) {
      const updatedDocs = documents.filter((d) => d.id !== id);
      setDocuments(updatedDocs);
      saveSessionUpdates(updatedDocs, familyMembers);
    }
  };

  // Open Edit Family Member Modal / Form
  const handleStartEditFamily = (member: FamilyMember) => {
    setEditingFamilyMember(member);
    setFamName(member.name);
    setFamRelation(member.relation);
    setFamAge(member.age);
    setFamGender(member.gender || 'Male');
    setFamOccupation(member.occupation || '');
    setFamEmail(member.email || '');
    setFamBloodGroup(member.bloodGroup || 'O+');
    setFamPhone(member.phone || '');
    setFamIdProofType(member.idProofType || 'Aadhaar Card');
    setFamIdProofNumber(member.idProofNumber || '');
    setShowAddFamilyForm(true);
  };

  const handleResetFamilyForm = () => {
    setEditingFamilyMember(null);
    setFamName('');
    setFamRelation('Spouse');
    setFamAge(30);
    setFamGender('Female');
    setFamOccupation('');
    setFamEmail('');
    setFamBloodGroup('O+');
    setFamPhone('');
    setFamIdProofType('Aadhaar Card');
    setFamIdProofNumber('');
    setShowAddFamilyForm(false);
  };

  // Family Member Add or Update Handler
  const handleSaveFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!famName.trim()) return;

    if (editingFamilyMember) {
      const updatedFamily = familyMembers.map((m) =>
        m.id === editingFamilyMember.id
          ? {
              ...m,
              name: famName,
              relation: famRelation,
              age: famAge || 25,
              gender: famGender,
              occupation: famOccupation,
              email: famEmail,
              bloodGroup: famBloodGroup,
              phone: famPhone,
              idProofType: famIdProofType,
              idProofNumber: famIdProofNumber,
            }
          : m
      );
      setFamilyMembers(updatedFamily);
      saveSessionUpdates(documents, updatedFamily);
    } else {
      const newMember: FamilyMember = {
        id: `FAM-${Date.now()}`,
        name: famName,
        relation: famRelation,
        age: famAge || 25,
        gender: famGender,
        occupation: famOccupation,
        email: famEmail,
        bloodGroup: famBloodGroup,
        phone: famPhone,
        idProofType: famIdProofType,
        idProofNumber: famIdProofNumber,
      };

      const updatedFamily = [...familyMembers, newMember];
      setFamilyMembers(updatedFamily);
      saveSessionUpdates(documents, updatedFamily);
    }

    handleResetFamilyForm();
  };

  // Family Member Delete Handler
  const handleDeleteFamilyMember = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete family occupant "${name}"?`)) {
      const updatedFamily = familyMembers.filter((m) => m.id !== id);
      setFamilyMembers(updatedFamily);
      saveSessionUpdates(documents, updatedFamily);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl my-auto p-5 sm:p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            {/* Avatar with Photo Upload & Remove Buttons */}
            <div className="relative group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-xl shadow-lg overflow-hidden shrink-0">
                {resAvatarUrl || session.resident.avatarUrl ? (
                  <img
                    src={resAvatarUrl || session.resident.avatarUrl}
                    alt={resName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(resName || session.resident.name).charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Quick Upload / Remove Overlay */}
              <label className="absolute -bottom-1 -right-1 bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-full cursor-pointer shadow-md transition border border-slate-900" title="Upload / Change Profile Photo">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                />
              </label>

              {(resAvatarUrl || session.resident.avatarUrl) && (
                <button
                  type="button"
                  onClick={handleDeleteProfilePhoto}
                  className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full shadow-md transition border border-slate-900"
                  title="Delete Profile Photo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">{resName}</h2>
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aadhaar & KYC Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Flat <strong className="text-emerald-300 font-mono">{resFlat}</strong> (Wing {resWing}) • Member ID: <span className="font-mono text-slate-200">{resMemberId}</span>
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

        {/* Profile Success Alert Banner */}
        {profileSuccessMsg && (
          <div className="mt-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-2 my-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'details'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Member Particulars</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'family'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Family & Members ({familyMembers.length + 1})</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'documents'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Identity Docs ({documents.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1 no-scrollbar">
          {/* TAB 1: Member Particulars */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Action Bar for Primary Profile Edit & Photo Upload */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Primary Resident Account Profile</span>
                </div>

                <div className="flex items-center space-x-2">
                  {!isEditingPrimary ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditingPrimary(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Fill Up / Edit Profile Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeleteProfileConfirm(true)}
                        className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Clear / Reset Profile</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingPrimary(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </div>

              {/* EDIT FORM MODE */}
              {isEditingPrimary ? (
                <form onSubmit={handleSavePrimaryProfileSubmit} className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-4 animate-in fade-in">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center space-x-1.5">
                      <Edit className="w-4 h-4" />
                      <span>Fill Up & Update Resident Profile Details</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">All fields are saved to your resident profile</span>
                  </div>

                  {/* Photo Upload Section inside Edit Form */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {resAvatarUrl ? (
                          <img src={resAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Profile Photo</h4>
                        <p className="text-[10px] text-slate-400">Upload a clear passport photo or profile picture</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition flex items-center space-x-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePhotoUpload}
                          className="hidden"
                        />
                      </label>

                      {resAvatarUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteProfilePhoto}
                          className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Delete Photo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Full Name *</label>
                      <input
                        type="text"
                        value={resName}
                        onChange={(e) => setResName(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Email Address *</label>
                      <input
                        type="email"
                        value={resEmail}
                        onChange={(e) => setResEmail(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Mobile Number *</label>
                      <input
                        type="tel"
                        value={resPhone}
                        onChange={(e) => setResPhone(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-emerald-300 rounded-xl p-2.5 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Resident Category *</label>
                      <select
                        value={resResidentType}
                        onChange={(e) => setResResidentType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Owner">Flat Owner</option>
                        <option value="Tenant">Verified Tenant</option>
                        <option value="Family Member">Family Resident</option>
                        <option value="Shop Owner">Commercial Shop Owner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Wing Block *</label>
                      <input
                        type="text"
                        value={resWing}
                        onChange={(e) => setResWing(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Flat Number *</label>
                      <input
                        type="text"
                        value={resFlat}
                        onChange={(e) => setResFlat(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Society Member Code</label>
                      <input
                        type="text"
                        value={resMemberId}
                        onChange={(e) => setResMemberId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-amber-300 rounded-xl p-2.5 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Registered Vehicles (Comma Separated)</label>
                      <input
                        type="text"
                        value={resVehicles}
                        onChange={(e) => setResVehicles(e.target.value)}
                        placeholder="e.g. GA-03-AB-1234, GA-07-CD-5678"
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Emergency Contact Person</label>
                      <input
                        type="text"
                        value={resEmergName}
                        onChange={(e) => setResEmergName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Emergency Relation & Phone</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Relation (e.g. Brother)"
                          value={resEmergRel}
                          onChange={(e) => setResEmergRel(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={resEmergPhone}
                          onChange={(e) => setResEmergPhone(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-amber-300 font-mono rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingPrimary(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile Details</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* DISPLAY MODE */
                <>
                  {/* Primary Flat Identity Box */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4" />
                      <span>Sapana Park Society Flat Details</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Resident Status</span>
                        <strong className="text-white font-bold">{resResidentType}</strong>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Wing & Flat No.</span>
                        <strong className="text-emerald-300 font-mono font-bold">Wing {resWing} • {resFlat}</strong>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Society Member Code</span>
                        <strong className="text-amber-300 font-mono font-bold">{resMemberId}</strong>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Share Certificate No.</span>
                        <strong className="text-slate-200 font-mono font-semibold">{session.resident.ownershipShareNo || 'SHARE-GOA-452/A'}</strong>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Total Occupants</span>
                        <strong className="text-slate-200 font-semibold">{familyMembers.length + 1} Residents</strong>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Registered Vehicles</span>
                        <strong className="text-slate-200 font-mono text-[11px] truncate block">{resVehicles || 'None registered'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Primary Head Contact & Emergency */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Phone className="w-4 h-4" />
                      <span>Primary Contacts & Emergency SOS</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Primary Mobile Number</span>
                        <span className="font-mono text-emerald-300 font-bold">{resPhone}</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Registered Email</span>
                        <span className="font-mono text-slate-200">{resEmail}</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 sm:col-span-2 flex items-center justify-between">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Emergency SOS Contact</span>
                          <strong className="text-white">{resEmergName} ({resEmergRel})</strong>
                        </div>
                        <span className="font-mono text-amber-400 font-bold text-xs">{resEmergPhone}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Delete / Reset Confirmation Modal Overlay */}
          {showDeleteProfileConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                  <Trash2 className="w-5 h-5" />
                  <span>Reset / Clear Profile Details?</span>
                </div>
                <p className="text-xs text-slate-300">
                  Are you sure you want to clear your resident details and profile picture? This will reset custom fields to initial defaults.
                </p>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setShowDeleteProfileConfirm(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetProfileDetails}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow"
                  >
                    Yes, Clear Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Family & Member Details (Add, Edit, Fill Up All Details & Delete) */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Flat Occupants & Family Members Directory
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Fill up all details of family members. Add, edit, or delete members anytime.
                  </p>
                </div>

                <button
                  onClick={() => {
                    handleResetFamilyForm();
                    setShowAddFamilyForm(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Family Member</span>
                </button>
              </div>

              {/* Add / Edit Family Member Form */}
              {showAddFamilyForm && (
                <form
                  onSubmit={handleSaveFamilySubmit}
                  className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-emerald-500/50 space-y-3 animate-in fade-in duration-150 text-xs shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-emerald-300 flex items-center space-x-1.5">
                      <Users className="w-4 h-4" />
                      <span>{editingFamilyMember ? 'Edit Family Member Details' : 'Fill Up New Member Details'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleResetFamilyForm}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Naik"
                        value={famName}
                        onChange={(e) => setFamName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Relationship *</label>
                      <select
                        value={famRelation}
                        onChange={(e) => setFamRelation(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Relative">Relative</option>
                        <option value="Tenant Occupant">Tenant Occupant</option>
                        <option value="Domestic Help / Maid">Domestic Help / Maid</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Age (Years)</label>
                      <input
                        type="number"
                        min="1"
                        max="110"
                        value={famAge}
                        onChange={(e) => setFamAge(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Gender</label>
                      <select
                        value={famGender}
                        onChange={(e) => setFamGender(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Blood Group</label>
                      <select
                        value={famBloodGroup}
                        onChange={(e) => setFamBloodGroup(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Mobile Phone</label>
                      <input
                        type="text"
                        placeholder="+91 98220 00000"
                        value={famPhone}
                        onChange={(e) => setFamPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Occupation / School</label>
                      <input
                        type="text"
                        placeholder="e.g. Software Engineer / Student"
                        value={famOccupation}
                        onChange={(e) => setFamOccupation(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">ID Proof Type</label>
                      <select
                        value={famIdProofType}
                        onChange={(e) => setFamIdProofType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Voter ID Card">Voter ID Card</option>
                        <option value="Passport">Passport</option>
                        <option value="School / College ID">School / College ID</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">ID Proof Number</label>
                      <input
                        type="text"
                        placeholder="XXXX-XXXX-1234"
                        value={famIdProofNumber}
                        onChange={(e) => setFamIdProofNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleResetFamilyForm}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                    >
                      {editingFamilyMember ? 'Update Member Details' : 'Save Member Details'}
                    </button>
                  </div>
                </form>
              )}

              {/* Primary Head Member Card (Immutable Owner Head) */}
              <div className="bg-gradient-to-r from-emerald-950/70 to-slate-950 p-4 rounded-2xl border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl shrink-0 mt-0.5">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <strong className="text-white font-bold text-sm">{session.resident.name}</strong>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Primary Member (Head of Flat)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-mono text-emerald-300">📞 {session.resident.phone}</span>
                      <span className="font-mono text-slate-300">✉️ {session.resident.email}</span>
                      <span className="text-amber-300">🩸 O+</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* List of Registered Family Members */}
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-slate-900 text-teal-400 rounded-xl border border-slate-800 shrink-0 mt-0.5">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <strong className="text-white font-bold text-sm">{member.name}</strong>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-emerald-300 border border-slate-700">
                            {member.relation} • {member.age} Yrs ({member.gender || 'Female'})
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 mt-1.5 space-y-1">
                          {member.occupation && (
                            <div className="flex items-center space-x-1 text-slate-400">
                              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                              <span>{member.occupation}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-400">
                            {member.phone && <span className="text-emerald-300">Mobile: {member.phone}</span>}
                            {member.bloodGroup && <span className="text-rose-400">Blood Group: {member.bloodGroup}</span>}
                            {member.idProofNumber && <span>{member.idProofType || 'ID Proof'}: {member.idProofNumber}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Member Actions: Edit & Delete */}
                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                      <button
                        onClick={() => handleStartEditFamily(member)}
                        title="Edit member details"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 hover:text-white rounded-xl transition border border-slate-800 text-xs font-semibold flex items-center space-x-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteFamilyMember(member.id, member.name)}
                        title="Delete family member"
                        className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900 text-rose-300 hover:text-white rounded-xl transition border border-rose-500/30 text-xs font-semibold flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Identification Documents (Add, Preview & Delete) */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Member Identification Documents & KYC
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Upload & manage Aadhaar, PAN Card, Voter ID, Driving License, Agreements & Bills.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddDocForm(!showAddDocForm)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Identified Document</span>
                </button>
              </div>

              {/* Add New Document Form */}
              {showAddDocForm && (
                <form
                  onSubmit={handleAddDocumentSubmit}
                  className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-emerald-500/50 space-y-3 animate-in fade-in duration-150 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                      <Upload className="w-4 h-4" />
                      <span>Upload & Add New Identity Document</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddDocForm(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Document Category *</label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Voter ID">Voter ID Card</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Passport">Passport</option>
                        <option value="Possession Certificate">Possession Certificate / Sale Deed</option>
                        <option value="Rent Agreement">Registered Rent Agreement</option>
                        <option value="Police Verification Form N-1">Police Verification Form N-1</option>
                        <option value="Electricity Bill">Electricity / PWD Water Bill</option>
                        <option value="Other">Other Certificate / Document</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Document Number / ID *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. XXXX-XXXX-1234 or POL-GOA-102"
                        value={newDocNumber}
                        onChange={(e) => setNewDocNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Expiry Date (If applicable)</label>
                      <input
                        type="date"
                        value={newDocExpiry}
                        onChange={(e) => setNewDocExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Remarks / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Verified copy for society records"
                        value={newDocRemarks}
                        onChange={(e) => setNewDocRemarks(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-bold">Upload File / Capture Photo</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-300 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddDocForm(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow"
                    >
                      Save Document
                    </button>
                  </div>
                </form>
              )}

              {/* Documents List */}
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <strong className="text-white font-bold text-sm">{doc.type}</strong>
                          <span
                            className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
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

                        <div className="text-xs text-slate-300 mt-1 font-mono">
                          Document No: <strong className="text-emerald-300">{doc.documentNumber}</strong> • Uploaded: {doc.uploadedDate}
                        </div>

                        {doc.remarks && (
                          <p className="text-[11px] text-slate-400 mt-0.5 italic">
                            Remarks: {doc.remarks}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        title="View Document Details"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 hover:text-white rounded-xl transition border border-slate-800 text-xs font-semibold flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete Document"
                        className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900 text-rose-300 hover:text-white rounded-xl transition border border-rose-500/30 text-xs font-semibold flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">{previewDoc.type}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Document No:</span>
                <span className="font-mono text-emerald-300 font-bold">{previewDoc.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold">{previewDoc.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Upload Date:</span>
                <span className="text-slate-300">{previewDoc.uploadedDate}</span>
              </div>
              {previewDoc.fileName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">File Name:</span>
                  <span className="font-mono text-slate-300">{previewDoc.fileName}</span>
                </div>
              )}
            </div>

            {/* Render Data URL preview if available, or placeholder badge */}
            {previewDoc.fileDataUrl ? (
              <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center max-h-64">
                <img
                  src={previewDoc.fileDataUrl}
                  alt={previewDoc.type}
                  className="max-h-60 object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                <FileCode className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">Official Encrypted Record stored in Sapana Park CHS Cloud Vault.</p>
                <p className="text-[10px] text-slate-500 font-mono">Reference Hash: {previewDoc.id}-VERIFIED-GOA-452</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
