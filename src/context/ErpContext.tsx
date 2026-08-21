import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserRole,
  Pilgrim,
  Booking,
  PackageBatch,
  Hotel,
  RoomAllocation,
  TransportAllocation,
  FlightManifest,
  Lead,
  LeadStatus,
  SubAgent,
  FinancialTransaction,
  AuditLog,
  WhatsAppMessage,
} from '../types';
import {
  INITIAL_HOTELS,
  INITIAL_PACKAGES,
  INITIAL_ROOM_ALLOCATIONS,
  INITIAL_PILGRIMS,
  INITIAL_BOOKINGS,
  INITIAL_TRANSPORTS,
  INITIAL_FLIGHTS,
  INITIAL_LEADS,
  INITIAL_SUB_AGENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WHATSAPP_MESSAGES,
} from '../utils/mockData';
import { DEFAULT_EXCHANGE_RATE_SAR_TO_INR } from '../utils/currency';

interface ErpContextType {
  // Role & Global State
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  selectedBatchId: string;
  setSelectedBatchId: (id: string) => void;
  sarExchangeRate: number;
  setSarExchangeRate: (rate: number) => void;

  // Mock Data Mode Toggle
  useMockData: boolean;
  setUseMockData: (enabled: boolean) => void;
  toggleMockData: () => void;

  // Data Collections
  pilgrims: Pilgrim[];
  bookings: Booking[];
  packages: PackageBatch[];
  hotels: Hotel[];
  roomAllocations: RoomAllocation[];
  transports: TransportAllocation[];
  flights: FlightManifest[];
  leads: Lead[];
  subAgents: SubAgent[];
  transactions: FinancialTransaction[];
  auditLogs: AuditLog[];
  whatsappMessages: WhatsAppMessage[];

  // CRUD & Mutation Actions
  addPilgrim: (pilgrim: Omit<Pilgrim, 'id' | 'createdAt'>) => Pilgrim;
  updatePilgrim: (id: string, updates: Partial<Pilgrim>) => void;
  deletePilgrim: (id: string) => void;

  addBooking: (booking: Omit<Booking, 'id' | 'bookedAt'>) => Booking;
  updateBooking: (id: string, updates: Partial<Booking>) => void;

  addPackage: (pkg: Omit<PackageBatch, 'id'>) => PackageBatch;
  updatePackage: (id: string, updates: Partial<PackageBatch>) => void;

  // Ground Allocations
  assignPilgrimToRoom: (pilgrimId: string, roomId: string, hotelCity: 'Makkah' | 'Madinah') => { success: boolean; message: string };
  removePilgrimFromRoom: (pilgrimId: string, roomId: string, hotelCity: 'Makkah' | 'Madinah') => void;
  createRoom: (room: Omit<RoomAllocation, 'id'>) => RoomAllocation;

  assignPilgrimToTransport: (pilgrimId: string, transportId: string) => void;
  updateFlightManifest: (flightId: string, updates: Partial<FlightManifest>) => void;

  // CRM
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Lead;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  // B2B & Finance
  updateSubAgentWallet: (agentId: string, amount: number, type: 'credit' | 'debit') => void;
  addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'createdAt'>) => FinancialTransaction;

  // WhatsApp & Audit
  sendWhatsAppNotification: (message: Omit<WhatsAppMessage, 'id' | 'timestamp'>) => void;
  addAuditLog: (action: string, module: AuditLog['module'], details: string) => void;
  resetToSampleData: () => void;
  clearToEmptyData: () => void;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

const STORAGE_PREFIX = 'ctt_erp_';

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user role
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem(`${STORAGE_PREFIX}role`) as UserRole) || 'super_admin';
  });

  // Selected departure batch
  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_PREFIX}selected_batch`) || 'pkg-umrah-sep-2026';
  });

  // SAR to INR conversion rate
  const [sarExchangeRate, setSarExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}exchange_rate`);
    return saved ? parseFloat(saved) : DEFAULT_EXCHANGE_RATE_SAR_TO_INR;
  });

  // Mock data toggle state
  const [useMockData, setUseMockDataState] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`);
    return saved !== null ? saved === 'true' : true;
  });

  // Main collections with localStorage persistence
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>(() => {
    const isMock = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`) !== 'false';
    if (!isMock) return [];
    const saved = localStorage.getItem(`${STORAGE_PREFIX}pilgrims`);
    return saved ? JSON.parse(saved) : INITIAL_PILGRIMS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const isMock = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`) !== 'false';
    if (!isMock) return [];
    const saved = localStorage.getItem(`${STORAGE_PREFIX}bookings`);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [packages, setPackages] = useState<PackageBatch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}packages`);
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [hotels] = useState<Hotel[]>(INITIAL_HOTELS);

  const [roomAllocations, setRoomAllocations] = useState<RoomAllocation[]>(() => {
    const isMock = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`) !== 'false';
    if (!isMock) return [];
    const saved = localStorage.getItem(`${STORAGE_PREFIX}room_allocations`);
    return saved ? JSON.parse(saved) : INITIAL_ROOM_ALLOCATIONS;
  });

  const [transports, setTransports] = useState<TransportAllocation[]>(() => {
    const isMock = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`) !== 'false';
    if (!isMock) return [];
    const saved = localStorage.getItem(`${STORAGE_PREFIX}transports`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSPORTS;
  });

  const [flights, setFlights] = useState<FlightManifest[]>(() => {
    const isMock = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`) !== 'false';
    if (!isMock) return [];
    const saved = localStorage.getItem(`${STORAGE_PREFIX}flights`);
    return saved ? JSON.parse(saved) : INITIAL_FLIGHTS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const isMock = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`) !== 'false';
    if (!isMock) return [];
    const saved = localStorage.getItem(`${STORAGE_PREFIX}leads`);
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [subAgents, setSubAgents] = useState<SubAgent[]>(() => {
    const isMock = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`) !== 'false';
    if (!isMock) return [];
    const saved = localStorage.getItem(`${STORAGE_PREFIX}sub_agents`);
    return saved ? JSON.parse(saved) : INITIAL_SUB_AGENTS;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const isMock = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`) !== 'false';
    if (!isMock) return [];
    const saved = localStorage.getItem(`${STORAGE_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const isMock = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`) !== 'false';
    if (!isMock) return [];
    const saved = localStorage.getItem(`${STORAGE_PREFIX}audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>(() => {
    const isMock = localStorage.getItem(`${STORAGE_PREFIX}use_mock_data`) !== 'false';
    if (!isMock) return [];
    const saved = localStorage.getItem(`${STORAGE_PREFIX}whatsapp`);
    return saved ? JSON.parse(saved) : (INITIAL_WHATSAPP_MESSAGES as WhatsAppMessage[]);
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}role`, currentUserRole);
    localStorage.setItem(`${STORAGE_PREFIX}selected_batch`, selectedBatchId);
    localStorage.setItem(`${STORAGE_PREFIX}exchange_rate`, String(sarExchangeRate));
    localStorage.setItem(`${STORAGE_PREFIX}use_mock_data`, String(useMockData));
    localStorage.setItem(`${STORAGE_PREFIX}pilgrims`, JSON.stringify(pilgrims));
    localStorage.setItem(`${STORAGE_PREFIX}bookings`, JSON.stringify(bookings));
    localStorage.setItem(`${STORAGE_PREFIX}packages`, JSON.stringify(packages));
    localStorage.setItem(`${STORAGE_PREFIX}room_allocations`, JSON.stringify(roomAllocations));
    localStorage.setItem(`${STORAGE_PREFIX}transports`, JSON.stringify(transports));
    localStorage.setItem(`${STORAGE_PREFIX}flights`, JSON.stringify(flights));
    localStorage.setItem(`${STORAGE_PREFIX}leads`, JSON.stringify(leads));
    localStorage.setItem(`${STORAGE_PREFIX}sub_agents`, JSON.stringify(subAgents));
    localStorage.setItem(`${STORAGE_PREFIX}transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${STORAGE_PREFIX}audit_logs`, JSON.stringify(auditLogs));
    localStorage.setItem(`${STORAGE_PREFIX}whatsapp`, JSON.stringify(whatsappMessages));
  }, [
    currentUserRole,
    selectedBatchId,
    sarExchangeRate,
    useMockData,
    pilgrims,
    bookings,
    packages,
    roomAllocations,
    transports,
    flights,
    leads,
    subAgents,
    transactions,
    auditLogs,
    whatsappMessages,
  ]);

  // Set mock data on/off
  const setUseMockData = (enabled: boolean) => {
    setUseMockDataState(enabled);
    if (enabled) {
      resetToSampleData();
    } else {
      clearToEmptyData();
    }
  };

  const toggleMockData = () => {
    setUseMockData(!useMockData);
  };

  // Reset to full sample mock data
  const resetToSampleData = () => {
    setPilgrims(INITIAL_PILGRIMS);
    setBookings(INITIAL_BOOKINGS);
    setPackages(INITIAL_PACKAGES);
    setRoomAllocations(INITIAL_ROOM_ALLOCATIONS);
    setTransports(INITIAL_TRANSPORTS);
    setFlights(INITIAL_FLIGHTS);
    setLeads(INITIAL_LEADS);
    setSubAgents(INITIAL_SUB_AGENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setWhatsappMessages(INITIAL_WHATSAPP_MESSAGES as WhatsAppMessage[]);
    setUseMockDataState(true);
  };

  // Clear to clean blank production state
  const clearToEmptyData = () => {
    setPilgrims([]);
    setBookings([]);
    setRoomAllocations([]);
    setTransports([]);
    setFlights([]);
    setLeads([]);
    setSubAgents([]);
    setTransactions([]);
    setWhatsappMessages([]);
    setAuditLogs([]);
    setUseMockDataState(false);
  };

  // Logging Helper
  const addAuditLog = (action: string, module: AuditLog['module'], details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userRole: currentUserRole,
      userName: currentUserRole === 'super_admin' ? 'Farooq Merchant (MD)' : 'System Operator',
      action,
      module,
      details,
      ipAddress: '103.241.144.22 (Mumbai HQ)',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Pilgrim Actions
  const addPilgrim = (pilgrimData: Omit<Pilgrim, 'id' | 'createdAt'>): Pilgrim => {
    const newId = `plg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newPilgrim: Pilgrim = {
      ...pilgrimData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPilgrims(prev => [newPilgrim, ...prev]);
    addAuditLog('PILGRIM_CREATED', 'Pilgrims', `Enrolled Pilgrim: ${newPilgrim.firstName} ${newPilgrim.lastName} (${newPilgrim.passportNumber})`);
    return newPilgrim;
  };

  const updatePilgrim = (id: string, updates: Partial<Pilgrim>) => {
    setPilgrims(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addAuditLog('PILGRIM_UPDATED', 'Pilgrims', `Updated profile for Pilgrim ID ${id}`);
  };

  const deletePilgrim = (id: string) => {
    setPilgrims(prev => prev.filter(p => p.id !== id));
    // Remove from room allocations too
    setRoomAllocations(prev => prev.map(r => ({
      ...r,
      pilgrimIds: r.pilgrimIds.filter(pid => pid !== id),
      isFullyOccupied: false,
    })));
    addAuditLog('PILGRIM_DELETED', 'Pilgrims', `Removed Pilgrim ID ${id} from database`);
  };

  // Booking Actions
  const addBooking = (bookingData: Omit<Booking, 'id' | 'bookedAt'>): Booking => {
    const newId = `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      bookedAt: new Date().toISOString().split('T')[0],
    };
    setBookings(prev => [newBooking, ...prev]);
    addAuditLog('BOOKING_CREATED', 'CRM', `Created Booking ${newBooking.bookingNumber} for ${newBooking.primaryContactName}`);
    return newBooking;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    addAuditLog('BOOKING_UPDATED', 'CRM', `Updated Booking ID ${id}`);
  };

  // Package Actions
  const addPackage = (pkgData: Omit<PackageBatch, 'id'>): PackageBatch => {
    const newId = `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newPkg: PackageBatch = { ...pkgData, id: newId };
    setPackages(prev => [newPkg, ...prev]);
    addAuditLog('PACKAGE_CREATED', 'Settings', `Created Package ${newPkg.title} (${newPkg.code})`);
    return newPkg;
  };

  const updatePackage = (id: string, updates: Partial<PackageBatch>) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addAuditLog('PACKAGE_UPDATED', 'Settings', `Updated costing & pricing for Package ID ${id}`);
  };

  // Room & Ground Ops Actions
  const assignPilgrimToRoom = (pilgrimId: string, roomId: string, hotelCity: 'Makkah' | 'Madinah'): { success: boolean; message: string } => {
    const targetRoom = roomAllocations.find(r => r.id === roomId);
    const targetPilgrim = pilgrims.find(p => p.id === pilgrimId);

    if (!targetRoom || !targetPilgrim) {
      return { success: false, message: 'Target room or pilgrim not found.' };
    }

    if (targetRoom.pilgrimIds.length >= targetRoom.capacity) {
      return { success: false, message: `Room ${targetRoom.roomNumber} is already fully occupied (${targetRoom.capacity}/${targetRoom.capacity} beds).` };
    }

    // Strict Mahram & Gender Compliance check
    if (targetRoom.genderType === 'male' && targetPilgrim.gender !== 'male') {
      return { success: false, message: 'Compliance Alert: Cannot assign female pilgrim to a designated Male Room.' };
    }
    if (targetRoom.genderType === 'female' && targetPilgrim.gender !== 'female') {
      return { success: false, message: 'Compliance Alert: Cannot assign male pilgrim to a designated Female Room.' };
    }

    // Update Room
    setRoomAllocations(prev => prev.map(r => {
      if (r.id === roomId) {
        const nextPilgrims = [...r.pilgrimIds.filter(pid => pid !== pilgrimId), pilgrimId];
        return {
          ...r,
          pilgrimIds: nextPilgrims,
          isFullyOccupied: nextPilgrims.length >= r.capacity,
        };
      }
      // Remove pilgrim from any other room in the same city
      if (r.hotelCity === hotelCity && r.id !== roomId && r.pilgrimIds.includes(pilgrimId)) {
        const nextPilgrims = r.pilgrimIds.filter(pid => pid !== pilgrimId);
        return {
          ...r,
          pilgrimIds: nextPilgrims,
          isFullyOccupied: false,
        };
      }
      return r;
    }));

    // Update Pilgrim's room assignment field
    updatePilgrim(pilgrimId, {
      ...(hotelCity === 'Makkah' ? { makkahRoomId: roomId } : { madinahRoomId: roomId }),
    });

    addAuditLog('ROOM_ASSIGNED', 'GroundOps', `Assigned ${targetPilgrim.firstName} ${targetPilgrim.lastName} to ${hotelCity} Room ${targetRoom.roomNumber}`);
    return { success: true, message: `Successfully assigned ${targetPilgrim.firstName} to Room ${targetRoom.roomNumber} (${hotelCity}).` };
  };

  const removePilgrimFromRoom = (pilgrimId: string, roomId: string, hotelCity: 'Makkah' | 'Madinah') => {
    setRoomAllocations(prev => prev.map(r => {
      if (r.id === roomId) {
        const nextPilgrims = r.pilgrimIds.filter(pid => pid !== pilgrimId);
        return {
          ...r,
          pilgrimIds: nextPilgrims,
          isFullyOccupied: false,
        };
      }
      return r;
    }));

    updatePilgrim(pilgrimId, {
      ...(hotelCity === 'Makkah' ? { makkahRoomId: undefined } : { madinahRoomId: undefined }),
    });

    addAuditLog('ROOM_UNASSIGNED', 'GroundOps', `Unassigned Pilgrim ${pilgrimId} from Room ${roomId}`);
  };

  const createRoom = (roomData: Omit<RoomAllocation, 'id'>): RoomAllocation => {
    const newId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRoom: RoomAllocation = { ...roomData, id: newId };
    setRoomAllocations(prev => [...prev, newRoom]);
    addAuditLog('ROOM_CREATED', 'GroundOps', `Created ${newRoom.hotelCity} Room ${newRoom.roomNumber} (${newRoom.roomType.toUpperCase()})`);
    return newRoom;
  };

  const assignPilgrimToTransport = (pilgrimId: string, transportId: string) => {
    setTransports(prev => prev.map(t => {
      if (t.id === transportId) {
        const nextP = t.pilgrimIds.includes(pilgrimId) ? t.pilgrimIds : [...t.pilgrimIds, pilgrimId];
        return { ...t, pilgrimIds: nextP };
      }
      return t;
    }));
    updatePilgrim(pilgrimId, { busAllocationId: transportId });
    addAuditLog('TRANSPORT_ASSIGNED', 'GroundOps', `Allocated Pilgrim ${pilgrimId} to Vehicle ${transportId}`);
  };

  const updateFlightManifest = (flightId: string, updates: Partial<FlightManifest>) => {
    setFlights(prev => prev.map(f => f.id === flightId ? { ...f, ...updates } : f));
    addAuditLog('FLIGHT_MANIFEST_UPDATED', 'GroundOps', `Updated flight manifest ${flightId}`);
  };

  // CRM Leads Actions
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>): Lead => {
    const newId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newLead: Lead = {
      ...leadData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads(prev => [newLead, ...prev]);
    addAuditLog('LEAD_CREATED', 'CRM', `New Lead: ${newLead.name} (${newLead.interestType}, ${newLead.paxCount} Pax)`);
    return newLead;
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status, lastContactedAt: new Date().toISOString().split('T')[0] } : l));
    addAuditLog('LEAD_STATUS_CHANGED', 'CRM', `Lead ${leadId} status changed to ${status}`);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  // B2B Actions
  const updateSubAgentWallet = (agentId: string, amount: number, type: 'credit' | 'debit') => {
    setSubAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const nextBalance = type === 'credit' ? a.walletBalanceInr + amount : a.walletBalanceInr - amount;
        return { ...a, walletBalanceInr: nextBalance };
      }
      return a;
    }));
    addAuditLog('WALLET_UPDATED', 'B2B', `${type.toUpperCase()} of ₹${amount} for Sub-Agent ${agentId}`);
  };

  // Finance Actions
  const addTransaction = (txnData: Omit<FinancialTransaction, 'id' | 'createdAt'>): FinancialTransaction => {
    const newId = `txn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTxn: FinancialTransaction = {
      ...txnData,
      id: newId,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setTransactions(prev => [newTxn, ...prev]);
    addAuditLog('TRANSACTION_RECORDED', 'Finance', `Recorded ${newTxn.transactionType}: ${newTxn.currency} ${newTxn.amount}`);
    return newTxn;
  };

  // WhatsApp Actions
  const sendWhatsAppNotification = (msgData: Omit<WhatsAppMessage, 'id' | 'timestamp'>) => {
    const newMsg: WhatsAppMessage = {
      ...msgData,
      id: `wa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setWhatsappMessages(prev => [newMsg, ...prev]);
    addAuditLog('WHATSAPP_DISPATCHED', 'WhatsApp', `Dispatched ${newMsg.templateType} to ${newMsg.recipientPhone}`);
  };

  return (
    <ErpContext.Provider
      value={{
        currentUserRole,
        setCurrentUserRole,
        selectedBatchId,
        setSelectedBatchId,
        sarExchangeRate,
        setSarExchangeRate,
        useMockData,
        setUseMockData,
        toggleMockData,
        pilgrims,
        bookings,
        packages,
        hotels,
        roomAllocations,
        transports,
        flights,
        leads,
        subAgents,
        transactions,
        auditLogs,
        whatsappMessages,
        addPilgrim,
        updatePilgrim,
        deletePilgrim,
        addBooking,
        updateBooking,
        addPackage,
        updatePackage,
        assignPilgrimToRoom,
        removePilgrimFromRoom,
        createRoom,
        assignPilgrimToTransport,
        updateFlightManifest,
        addLead,
        updateLeadStatus,
        updateLead,
        deleteLead,
        updateSubAgentWallet,
        addTransaction,
        sendWhatsAppNotification,
        addAuditLog,
        resetToSampleData,
        clearToEmptyData,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
