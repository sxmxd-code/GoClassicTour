import React, { useState } from 'react';
import {
  Building,
  Bus,
  Plane,
  QrCode,
  Users,
  Bed,
  Phone,
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Compass,
  ArrowRight,
  ExternalLink,
  PhoneCall,
  MapPin,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';
import type { RoomAllocation, RoomGenderType, Pilgrim } from '../../types';

export const GroundOperationsHub: React.FC = () => {
  const {
    roomAllocations,
    hotels,
    pilgrims,
    packages,
    transports,
    flights,
    selectedBatchId,
    assignPilgrimToRoom,
    removePilgrimFromRoom,
    createRoom,
    updateFlightManifest,
  } = useErp();

  const { t, language } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'hotelMatrix' | 'busFleet' | 'flightManifest' | 'badges'>('hotelMatrix');
  const [selectedCity, setSelectedCity] = useState<'Makkah' | 'Madinah'>('Makkah');
  const [allocationAlert, setAllocationAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Room Modal
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState(14);
  const [newRoomType, setNewRoomType] = useState<RoomAllocation['roomType']>('quad');
  const [newRoomGender, setNewRoomGender] = useState<RoomGenderType>('male');

  // Emergency QR Modal Preview
  const [emergencyModalPilgrim, setEmergencyModalPilgrim] = useState<Pilgrim | null>(null);

  const selectedPackage = packages.find(p => p.id === selectedBatchId) || packages[0];
  const batchPilgrims = pilgrims.filter(p => p.packageBatchId === selectedPackage.id);
  const cityRooms = roomAllocations.filter(r => r.packageBatchId === selectedPackage.id && r.hotelCity === selectedCity);

  const makkahHotel = hotels.find(h => h.city === 'Makkah') || hotels[0];
  const madinahHotel = hotels.find(h => h.city === 'Madinah') || hotels[3];
  const activeHotel = selectedCity === 'Makkah' ? makkahHotel : madinahHotel;

  // Unassigned pilgrims for selected city
  const unassignedPilgrims = batchPilgrims.filter(p => {
    return selectedCity === 'Makkah' ? !p.makkahRoomId : !p.madinahRoomId;
  });

  const handleAssign = (pilgrimId: string, roomId: string) => {
    const result = assignPilgrimToRoom(pilgrimId, roomId, selectedCity);
    if (result.success) {
      setAllocationAlert({ type: 'success', message: result.message });
    } else {
      setAllocationAlert({ type: 'error', message: result.message });
    }
    setTimeout(() => setAllocationAlert(null), 4000);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) return;

    const capacity = 
      newRoomType === 'single' ? 1 :
      newRoomType === 'double' ? 2 :
      newRoomType === 'triple' ? 3 : 4;

    createRoom({
      packageBatchId: selectedPackage.id,
      hotelId: activeHotel.id,
      hotelCity: selectedCity,
      roomNumber: newRoomNumber,
      floor: newRoomFloor,
      roomType: newRoomType,
      capacity,
      genderType: newRoomGender,
      pilgrimIds: [],
      isFullyOccupied: false,
    });

    setNewRoomNumber('');
    setShowAddRoomModal(false);
  };

  const handleExportSaudiRooming = () => {
    let csv = `SAUDI GROUND ROOMING MANIFEST - CLASSIC TOUR & TRAVELS MUMBAI\n`;
    csv += `Batch: ${selectedPackage.code} - ${selectedPackage.title}\n`;
    csv += `City: ${selectedCity} Hotel: ${activeHotel.name}\n\n`;
    csv += `Room Number,Floor,Room Type,Gender Type,Occupancy,Pilgrim Name,Passport Number,Nationality,Gender,Mahram Head\n`;

    cityRooms.forEach(room => {
      if (room.pilgrimIds.length === 0) {
        csv += `${room.roomNumber},${room.floor},${room.roomType},${room.genderType},0/${room.capacity},EMPTY BED,EMPTY,EMPTY,EMPTY,EMPTY\n`;
      } else {
        room.pilgrimIds.forEach(pid => {
          const p = pilgrims.find(item => item.id === pid);
          if (p) {
            csv += `${room.roomNumber},${room.floor},${room.roomType},${room.genderType},${room.pilgrimIds.length}/${room.capacity},"${p.firstName} ${p.lastName}",${p.passportNumber},${p.nationality},${p.gender},${p.isMahramHead ? 'YES' : 'NO'}\n`;
          }
        });
      }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Saudi_Rooming_${selectedCity}_${selectedPackage.code}.csv`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-600" />
            <span>{t('nav.groundOps')}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Hotel Rooming Matrix with gender segregation, Flight PNR seats, Bus fleets, and printable Pilgrim ID Badges with Emergency QR
          </p>
        </div>

        {/* Sub Navigation Pills */}
        <div className="bg-slate-100 p-0.5 rounded-md flex items-center border border-slate-200 flex-wrap">
          <button
            onClick={() => setActiveSubTab('hotelMatrix')}
            className={`px-3 py-1.5 text-xs font-bold rounded-sm transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'hotelMatrix' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>{t('ground.hotelMatrix')}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('flightManifest')}
            className={`px-3 py-1.5 text-xs font-bold rounded-sm transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'flightManifest' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>{t('ground.flightManifest')}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('busFleet')}
            className={`px-3 py-1.5 text-xs font-bold rounded-sm transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'busFleet' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>{t('ground.busFleet')}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('badges')}
            className={`px-3 py-1.5 text-xs font-bold rounded-sm transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'badges' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{t('ground.badges')}</span>
          </button>
        </div>
      </div>

      {/* Allocation Rule Alert Banner */}
      {allocationAlert && (
        <div
          className={`p-3 rounded-md border text-xs flex items-center justify-between animate-in fade-in duration-150 ${
            allocationAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
          }`}
        >
          <div className="flex items-center gap-2">
            {allocationAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{allocationAlert.message}</span>
          </div>
          <button onClick={() => setAllocationAlert(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUB-TAB 1: HOTEL ROOMING MATRIX */}
      {activeSubTab === 'hotelMatrix' && (
        <div className="space-y-4">
          {/* City Selector & Action Strip */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-md p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCity('Makkah')}
                className={`px-4 py-1.5 rounded-md font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCity === 'Makkah'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>🕋 Makkah Al-Mukarramah</span>
                <span className="text-[10px] bg-slate-900/10 px-1 py-0.2 rounded-xs">
                  {roomAllocations.filter(r => r.packageBatchId === selectedPackage.id && r.hotelCity === 'Makkah').length} Rooms
                </span>
              </button>
              <button
                onClick={() => setSelectedCity('Madinah')}
                className={`px-4 py-1.5 rounded-md font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCity === 'Madinah'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>🕌 Madinah Al-Munawwarah</span>
                <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded-xs">
                  {roomAllocations.filter(r => r.packageBatchId === selectedPackage.id && r.hotelCity === 'Madinah').length} Rooms
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportSaudiRooming}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-md text-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('action.export')}</span>
              </button>
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-md text-xs transition shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Room</span>
              </button>
            </div>
          </div>

          {/* Hotel Contact Banner */}
          <div className="bg-slate-900 text-white rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-amber-300">
                  {language === 'ar' ? activeHotel.nameAr : activeHotel.name}
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-xs font-semibold">
                  {activeHotel.distanceToHaram}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{activeHotel.address}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-400 text-[10px] block">Front Desk / Reception:</span>
                <strong className="text-white font-mono">{activeHotel.receptionPhone}</strong>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-400 text-[10px] block">Hotel GM:</span>
                <strong className="text-white">{activeHotel.managerName}</strong>
              </div>
            </div>
          </div>

          {/* Room Allocation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {cityRooms.map((room) => {
              const occupants = room.pilgrimIds.map(pid => pilgrims.find(p => p.id === pid)).filter(Boolean) as Pilgrim[];
              const isFull = room.pilgrimIds.length >= room.capacity;

              return (
                <div
                  key={room.id}
                  className={`bg-white border rounded-md p-3.5 space-y-3 shadow-2xs transition ${
                    isFull ? 'border-slate-200' : 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-200'
                  }`}
                >
                  {/* Room Card Header */}
                  <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-sm">Room {room.roomNumber}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Floor {room.floor}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 capitalize">{room.roomType} Sharing</span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className={`px-1.5 py-0.2 rounded-xs text-[10px] font-bold block ${
                        room.genderType === 'male' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                        room.genderType === 'female' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {room.genderType === 'male' ? 'GENTS ONLY' :
                         room.genderType === 'female' ? 'LADIES ONLY' : 'FAMILY ROOM'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-700 block">
                        {room.pilgrimIds.length}/{room.capacity} Beds
                      </span>
                    </div>
                  </div>

                  {/* Bed Occupants Slots */}
                  <div className="space-y-1.5">
                    {Array.from({ length: room.capacity }).map((_, slotIdx) => {
                      const pilgrim = occupants[slotIdx];
                      if (pilgrim) {
                        return (
                          <div
                            key={pilgrim.id}
                            className="bg-slate-50 border border-slate-200 rounded-sm p-2 flex items-center justify-between text-xs group"
                          >
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{pilgrim.firstName} {pilgrim.lastName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{pilgrim.passportNumber} • {pilgrim.bloodGroup}</div>
                            </div>
                            <button
                              onClick={() => removePilgrimFromRoom(pilgrim.id, room.id, selectedCity)}
                              className="p-1 rounded-sm text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition opacity-80 group-hover:opacity-100"
                              title="Remove Pilgrim from Room"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={slotIdx}
                          className="border border-dashed border-slate-300 rounded-sm p-1.5 text-center bg-white"
                        >
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssign(e.target.value, room.id);
                                e.target.value = '';
                              }
                            }}
                            defaultValue=""
                            className="w-full text-xs font-semibold text-amber-800 bg-transparent focus:outline-none cursor-pointer"
                          >
                            <option value="" disabled>+ Assign Bed {slotIdx + 1} ({room.genderType})...</option>
                            {unassignedPilgrims
                              .filter(p => room.genderType === 'family' || p.gender === room.genderType)
                              .map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.firstName} {p.lastName} ({p.gender.toUpperCase()} • {p.passportNumber})
                                </option>
                              ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {cityRooms.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-md p-6 space-y-2">
                <Building className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-xs">No rooms allocated in {selectedCity} yet</h4>
                <p className="text-[11px] text-slate-500">Create a room or turn on Demo Mock Data in the sidebar to populate hotel allocations.</p>
                <button
                  onClick={() => setShowAddRoomModal(true)}
                  className="px-3 py-1.5 bg-[#03578F] text-white font-bold text-xs rounded-md shadow-2xs cursor-pointer"
                >
                  + Add New Room
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FLIGHT MANIFEST */}
      {activeSubTab === 'flightManifest' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flights.map((flt) => (
              <div key={flt.id} className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-md p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-sky-700" />
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">{flt.airline} — {flt.flightNumber}</h3>
                      <span className="font-mono text-xs text-slate-500">PNR: <strong className="text-slate-900">{flt.pnr}</strong></span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-sky-50 text-sky-800 rounded-xs border border-sky-200">
                    {flt.seatsAllocated} / {flt.totalSeatsBlocked} Seats Blocked
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-md border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Departure Airport</span>
                    <strong className="text-slate-900 block">{flt.departureAirport}</strong>
                    <span className="text-slate-500 font-mono text-[11px]">{flt.departureTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Arrival Airport</span>
                    <strong className="text-slate-900 block">{flt.arrivalAirport}</strong>
                    <span className="text-slate-500 font-mono text-[11px]">{flt.arrivalTime}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-900">Seat Manifest & Bag Tag Barcodes:</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                    {flt.pilgrimSeatMap.map((seat) => {
                      const pilgrim = pilgrims.find(p => p.id === seat.pilgrimId);
                      return (
                        <div key={seat.pilgrimId} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-sm">
                          <div>
                            <span className="font-bold text-slate-900">{pilgrim ? `${pilgrim.firstName} ${pilgrim.lastName}` : seat.pilgrimId}</span>
                            <div className="text-[10px] font-mono text-slate-500">Seat: {seat.seatNumber} • Bag Tag: {seat.bagTagNumber}</div>
                          </div>
                          <span className={`px-1.5 py-0.2 rounded-xs text-[10px] font-bold ${
                            seat.checkedIn ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {seat.checkedIn ? 'CHECKED-IN' : 'PENDING'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {flights.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-md p-6 space-y-2">
                <Plane className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-xs">No Flight Manifests Active</h4>
                <p className="text-[11px] text-slate-500">Turn on Demo Mock Data in the sidebar to populate group PNR seat maps.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BUS FLEET */}
      {activeSubTab === 'busFleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transports.map((bus) => (
            <div key={bus.id} className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-md p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bus className="w-5 h-5 text-amber-700" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{bus.vehicleNumber}</h3>
                    <span className="text-[10px] text-slate-500">{bus.capacity} Seater Luxury Coach</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-xs border border-emerald-200 uppercase">
                  {bus.status}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900 text-xs">Route: {bus.routeName}</div>
                <div className="text-[11px] text-slate-500">Departure: {bus.routeDate}</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-sm border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Bus Driver</span>
                    <strong className="text-slate-900">{bus.driverName}</strong>
                  </div>
                  <a
                    href={`tel:${bus.driverPhone}`}
                    className="p-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" /> Call
                  </a>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-sm border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Saudi Ground Ameer</span>
                    <strong className="text-slate-900">{bus.ameerLeaderName}</strong>
                  </div>
                  <a
                    href={`tel:${bus.ameerLeaderPhone}`}
                    className="p-1.5 rounded-sm bg-sky-700 hover:bg-sky-800 text-white font-bold text-[10px] flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" /> Call
                  </a>
                </div>
              </div>
            </div>
          ))}
          {transports.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-md p-6 space-y-2">
              <Bus className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-xs">No VIP Buses Allocated</h4>
              <p className="text-[11px] text-slate-500">Turn on Demo Mock Data in the sidebar to view luxury coach allocations.</p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: PILGRIM ID BADGES & EMERGENCY QR */}
      {activeSubTab === 'badges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-md border border-slate-200 rounded-md p-3.5 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>Printable Pilgrim ID Badges & Emergency Profile QR</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Standard CR80 Credit-Card size badges with hotel addresses in Arabic, Tour Ameer emergency hotline, and GPS directions
              </p>
            </div>
            {batchPilgrims.length > 0 && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-md text-xs transition cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All Badges</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchPilgrims.map((pilgrim) => {
              const makkahRoom = roomAllocations.find(r => r.id === pilgrim.makkahRoomId);
              const madinahRoom = roomAllocations.find(r => r.id === pilgrim.madinahRoomId);
              const qrPayload = `https://goclassictour.com/emergency?p=${pilgrim.passportNumber}&b=${pilgrim.bloodGroup}&h=MakkahSwissotel&a=966501234567`;

              return (
                <div
                  key={pilgrim.id}
                  className="bg-white border-2 border-slate-900 rounded-md p-4 space-y-3 shadow-xs relative overflow-hidden"
                >
                  {/* Badge Top Strip */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/logos/classiclogo.png"
                        alt="Classic Tour & Travels"
                        className="h-7 w-auto object-contain"
                      />
                      <span className="text-[9px] font-bold text-amber-800 border-l border-slate-300 pl-2">MUMBAI ➔ SAUDI ARABIA</span>
                    </div>
                    <span className="px-1.5 py-0.2 bg-slate-900 text-amber-400 font-bold text-[9px] rounded-xs">
                      HAJJ & UMRAH
                    </span>
                  </div>

                  {/* Pilgrim Photo & Bio */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-sm flex items-center justify-center font-bold text-slate-700 text-lg shrink-0">
                      {pilgrim.firstName[0]}
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-black text-slate-900 text-xs">{pilgrim.firstName} {pilgrim.lastName}</div>
                      <div className="text-[10px] text-slate-600 font-mono">Passport: <strong>{pilgrim.passportNumber}</strong></div>
                      <div className="text-[10px] text-slate-600">Blood Group: <strong className="text-rose-700">{pilgrim.bloodGroup}</strong></div>
                    </div>
                  </div>

                  {/* Hotel Addresses in Arabic & English */}
                  <div className="bg-slate-50 border border-slate-200 rounded-sm p-2 text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span>🕋 <strong>Makkah:</strong> Swissôtel Al Maqam</span>
                      <strong className="text-slate-900">{makkahRoom ? `Room ${makkahRoom.roomNumber}` : '—'}</strong>
                    </div>
                    <div className="text-[9px] text-slate-500 font-arabic text-right">فندق سويس أوتيل المقام مكة المكرمة</div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span>🕌 <strong>Madinah:</strong> Dar Al Taqwa</span>
                      <strong className="text-slate-900">{madinahRoom ? `Room ${madinahRoom.roomNumber}` : '—'}</strong>
                    </div>
                  </div>

                  {/* Emergency QR Code & Ameer Phone */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Emergency 24x7 Ameer</span>
                      <strong className="text-xs font-mono text-slate-900 block">+966 50 123 4567</strong>
                      <span className="text-[9px] text-slate-500">Maulana Imran (KSA Lead)</span>
                      <button
                        onClick={() => setEmergencyModalPilgrim(pilgrim)}
                        className="text-[10px] text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer block"
                      >
                        Test Mobile QR View
                      </button>
                    </div>
                    <div className="p-1 bg-white border border-slate-300 rounded-sm">
                      <QRCodeSVG value={qrPayload} size={50} />
                    </div>
                  </div>
                </div>
              );
            })}

            {batchPilgrims.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-md p-6 space-y-2">
                <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-xs">No Pilgrims Enrolled for Badges</h4>
                <p className="text-[11px] text-slate-500">Turn on Demo Mock Data in the sidebar to generate printable emergency ID cards.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Lost-Pilgrim Profile Simulator Modal */}
      {emergencyModalPilgrim && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-sm w-full p-5 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Lost Pilgrim Emergency Portal</span>
              </span>
              <button onClick={() => setEmergencyModalPilgrim(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mx-auto">
                {emergencyModalPilgrim.firstName[0]}
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                {emergencyModalPilgrim.firstName} {emergencyModalPilgrim.lastName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">{emergencyModalPilgrim.passportNumber} • Blood: {emergencyModalPilgrim.bloodGroup}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs space-y-2">
              <div className="font-bold text-amber-950">
                🕋 Pilgrim Hotel: Swissôtel Al Maqam Makkah
              </div>
              <div className="text-[11px] text-amber-900 font-arabic">
                فندق سويس أوتيل المقام — مجمع أبراج البيت أمام الحرم المكي
              </div>
            </div>

            <div className="space-y-2">
              <a
                href="tel:+966501234567"
                className="w-full py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Saudi Ground Ameer (+966 50 123 4567)</span>
              </a>
              <a
                href="https://maps.google.com/?q=Swissotel+Al+Maqam+Makkah"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <MapPin className="w-4 h-4 text-sky-700" />
                <span>Open Hotel GPS on Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-sm w-full p-5 text-slate-900 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" />
                <span>Add Room at {activeHotel.name}</span>
              </h3>
              <button onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1406"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 font-bold focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor</label>
                  <input
                    type="number"
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sharing Type</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 focus:outline-none"
                  >
                    <option value="quad">Quad (4 Beds)</option>
                    <option value="triple">Triple (3 Beds)</option>
                    <option value="double">Double (2 Beds)</option>
                    <option value="single">Single (1 Bed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender Segregation</label>
                <select
                  value={newRoomGender}
                  onChange={(e) => setNewRoomGender(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 focus:outline-none"
                >
                  <option value="male">Gents Only (Male)</option>
                  <option value="female">Ladies Only (Female)</option>
                  <option value="family">Family Room (Mixed)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
