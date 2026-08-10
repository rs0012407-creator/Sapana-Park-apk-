import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  UserCheck,
  Send,
  X,
  ShieldCheck,
  FileText,
  Camera,
  Image as ImageIcon,
  Trash2,
  Maximize2,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../models/complaint';
import { createComplaint, updateComplaintStatus, deleteComplaint } from '../../api/complaintApi';
import { UserSession } from '../../api/authApi';

interface ComplaintsScreenProps {
  session: UserSession;
  complaints: Complaint[];
  onRefreshComplaints: () => void;
  onOpenAIHelp: () => void;
}

export const ComplaintsScreen: React.FC<ComplaintsScreenProps> = ({
  session,
  complaints,
  onRefreshComplaints,
  onOpenAIHelp,
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Plumbing & Water Supply');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [description, setDescription] = useState('');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);

  // Update status state for Committee/Secretary view
  const [newStatusUpdate, setNewStatusUpdate] = useState<ComplaintStatus>('In Progress');
  const [updateNote, setUpdateNote] = useState('');
  const [assignedVendor, setAssignedVendor] = useState('');

  const committeeView = session.role === 'Secretary' || session.role === 'Treasurer';

  const categories: ComplaintCategory[] = [
    'Plumbing & Water Supply',
    'Electrical & Generator',
    'Lift Maintenance',
    'Security & Gate Pass',
    'Sanitation & Garbage',
    'Civil & Leakage',
    'Noise & Disturbance',
    'General & Others',
  ];

  // Handle Photo File selection (Gallery or Camera capture)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              setAttachedPhotos((prev) => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleRemoveAttachedPhoto = (index: number) => {
    setAttachedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createComplaint({
      title,
      category,
      priority,
      description,
      flatNumber: session.resident.flatNumber,
      residentName: session.resident.name,
      residentPhone: session.resident.phone,
      photoUrls: attachedPhotos,
    });

    setTitle('');
    setDescription('');
    setAttachedPhotos([]);
    setShowNewModal(false);
    onRefreshComplaints();
  };

  const handleDeleteComplaintTicket = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this complaint ticket?')) {
      deleteComplaint(id);
      if (selectedComplaint?.id === id) {
        setSelectedComplaint(null);
      }
      onRefreshComplaints();
    }
  };

  const handleStatusUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !updateNote.trim()) return;

    const updated = updateComplaintStatus(
      selectedComplaint.id,
      newStatusUpdate,
      committeeView ? `${session.role} (${session.resident.name})` : `Resident (${session.resident.name})`,
      updateNote,
      assignedVendor
    );

    if (updated) {
      setSelectedComplaint(updated);
      setUpdateNote('');
      onRefreshComplaints();
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === 'All') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-sky-400" />
            <span>Helpdesk & Maintenance Complaint Tickets</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Logged complaints for Sapana Park CHS • Attach photos from Camera/Gallery to highlight exact maintenance issues
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>File New Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterStatus === status
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredComplaints.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedComplaint(c)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition shadow-md flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-sky-400 font-bold">{c.id}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold border border-slate-700">
                    {c.category}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      c.status === 'Open'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : c.status === 'In Progress'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {c.status}
                  </span>
                  <button
                    onClick={(e) => handleDeleteComplaintTicket(e, c.id)}
                    title="Delete Complaint Ticket"
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm text-white">{c.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {c.description}
              </p>

              {/* Photos Thumbnails if present */}
              {c.photoUrls && c.photoUrls.length > 0 && (
                <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <Camera className="w-3 h-3 text-sky-400" />
                    <span>{c.photoUrls.length} Photo Attached:</span>
                  </span>
                  <div className="flex space-x-1.5 overflow-x-auto">
                    {c.photoUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Issue photo"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700 hover:opacity-80 transition"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Flat: <strong className="text-slate-200">{c.flatNumber}</strong> ({c.residentName})</span>
              <span className="flex items-center text-sky-400 font-semibold">
                <span>View Timeline ({c.timeline.length})</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Complaint Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                <span>Log New Complaint Ticket</span>
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Issue Subject / Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wing B Main Pipe Leakage"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe floor, wing location, duration of issue..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Photo Upload Section (Camera & Gallery) */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-sky-400" />
                    <span>Attach Photo Evidence (Camera / Gallery)</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-xl border border-slate-700 text-xs font-medium cursor-pointer flex items-center justify-center space-x-2 transition">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Take Photo / Select Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Photo Previews */}
                {attachedPhotos.length > 0 && (
                  <div className="flex space-x-2 overflow-x-auto pt-2">
                    {attachedPhotos.map((photo, i) => (
                      <div key={i} className="relative shrink-0">
                        <img
                          src={photo}
                          alt="preview"
                          className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachedPhoto(i)}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 hover:text-white py-2.5 rounded-xl font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs transition shadow-lg"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Timeline Drawer Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {selectedComplaint.id}
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {selectedComplaint.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{selectedComplaint.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Logged by Flat {selectedComplaint.flatNumber} ({selectedComplaint.residentName}) on {selectedComplaint.createdAt}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleDeleteComplaintTicket(e, selectedComplaint.id)}
                  title="Delete Ticket"
                  className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Timeline & Photos */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-slate-200">Original Issue Summary:</div>
                <p>{selectedComplaint.description}</p>

                {/* Display Photos if attached */}
                {selectedComplaint.photoUrls && selectedComplaint.photoUrls.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-bold text-slate-300 block">Attached Complaint Photos:</span>
                    <div className="flex space-x-2 overflow-x-auto">
                      {selectedComplaint.photoUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Evidence"
                          onClick={() => setFullscreenPhoto(url)}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-600 cursor-pointer hover:scale-105 transition"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedComplaint.assignedVendor && (
                  <div className="mt-2 text-[11px] text-teal-300 font-medium">
                    Assigned Vendor: {selectedComplaint.assignedVendor}
                  </div>
                )}
              </div>

              <h4 className="font-bold text-sm text-slate-200 pt-2 border-t border-slate-800">
                Ticket Progress Timeline
              </h4>

              <div className="space-y-3 relative border-l-2 border-slate-800 ml-3 pl-4">
                {selectedComplaint.timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-slate-900" />
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                        <span className="font-semibold text-slate-200">{event.updatedBy}</span>
                        <span>{event.timestamp}</span>
                      </div>
                      <p className="text-slate-300">{event.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Committee Update Action Form */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-4 space-y-3">
                <h5 className="font-bold text-xs text-slate-200 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Append Progress Note or Update Status</span>
                </h5>

                <form onSubmit={handleStatusUpdateSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Update Status</label>
                      <select
                        value={newStatusUpdate}
                        onChange={(e) => setNewStatusUpdate(e.target.value as ComplaintStatus)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Assigned Vendor / Tech</label>
                      <input
                        type="text"
                        value={assignedVendor}
                        onChange={(e) => setAssignedVendor(e.target.value)}
                        placeholder="e.g. Francis Plumber"
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      placeholder="Type resolution update or technician report note..."
                      required
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Update to Timeline</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox */}
      {fullscreenPhoto && (
        <div
          onClick={() => setFullscreenPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <img src={fullscreenPhoto} alt="Full view" className="max-w-full max-h-[90vh] rounded-2xl object-contain" />
          <button
            onClick={() => setFullscreenPhoto(null)}
            className="absolute top-4 right-4 bg-slate-800 text-white p-2 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
