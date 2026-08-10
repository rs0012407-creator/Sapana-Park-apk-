import React, { useState } from 'react';
import { Contact, Search, Car, ShieldCheck, Phone, User, Building2 } from 'lucide-react';
import { getAllResidents, getAllVehicles } from '../../api/directoryApi';
import { Resident } from '../../models/resident';
import { Vehicle } from '../../models/vehicle';

export const DirectoryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'residents' | 'vehicles'>('residents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState<string>('All');

  const residents = getAllResidents();
  const vehicles = getAllVehicles();

  const filteredResidents = residents.filter((r) => {
    const matchesWing = selectedWing === 'All' || r.wing === selectedWing;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery);
    return matchesWing && matchesSearch;
  });

  const filteredVehicles = vehicles.filter((v) => {
    return (
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.parkingSlotNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Contact className="w-5 h-5 text-emerald-400" />
            <span>Sapana Park CHS Directory & Vehicle Lookup</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Wings A, B, C & D • Resident owners, verified tenants, emergency contacts & parking allocations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('residents')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'residents' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resident Directory
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'vehicles' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vehicle & Parking
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'residents'
                ? 'Search by name, flat (e.g. A-302), phone...'
                : 'Search by plate (e.g. GA-07-C-4589), flat, owner...'
            }
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        </div>

        {activeTab === 'residents' && (
          <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
            {['All', 'A', 'B', 'C', 'D'].map((wing) => (
              <button
                key={wing}
                onClick={() => setSelectedWing(wing)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedWing === wing ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {wing === 'All' ? 'All Wings' : `Wing ${wing}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Residents Grid */}
      {activeTab === 'residents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResidents.map((r) => (
            <div
              key={r.id}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    Flat {r.flatNumber}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        r.residentType === 'Owner'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}
                    >
                      {r.residentType}
                    </span>
                    {r.isCommitteeMember && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                        {r.committeeRole}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white">{r.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Member ID: <span className="font-mono text-slate-300">{r.memberId}</span> • Move-in: {r.moveInDate}
                </p>

                <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Phone:</span>
                    <a href={`tel:${r.phone}`} className="font-mono text-emerald-400 font-bold hover:underline">
                      +91 {r.phone}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Contact:</span>
                    <span className="text-slate-200">{r.emergencyContact.name} ({r.emergencyContact.relation})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicles Grid */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold font-mono text-white tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {v.plateNumber}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                    {v.vehicleType}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-200 mt-2">{v.makeModel}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Owner: <strong className="text-slate-300">{v.ownerName}</strong> (Flat {v.flatNumber})
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-500">Parking Slot</div>
                <div className="text-xs font-bold text-amber-300 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 mt-0.5">
                  {v.parkingSlotNumber}
                </div>
                {v.rfidTagNo && (
                  <div className="text-[9px] text-emerald-400 font-mono mt-1">
                    {v.rfidTagNo}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
