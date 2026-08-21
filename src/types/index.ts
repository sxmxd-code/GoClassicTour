export type UserRole = 
  | 'super_admin'
  | 'ops_manager'
  | 'sales_exec'
  | 'saudi_ameer'
  | 'visa_officer'
  | 'accountant'
  | 'b2b_agent';

export type Language = 'en' | 'ar';

export type Gender = 'male' | 'female';

export type RelationshipType = 
  | 'self'
  | 'spouse'
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'brother'
  | 'sister'
  | 'mahram'
  | 'group_member';

export type RoomSharingType = 'single' | 'double' | 'triple' | 'quad' | 'quint';

export type RoomGenderType = 'male' | 'female' | 'family';

export type VehicleType = 'bus_45' | 'coaster_25' | 'hiace_14' | 'gmc_yukon' | 'sedan';

export type LeadStatus = 'new_inquiry' | 'quotation_sent' | 'doc_followup' | 'deposit_paid' | 'confirmed' | 'lost';

export type VisaMilestone = 
  | 'passport_submitted'
  | 'mofa_generated'
  | 'insurance_attached'
  | 'visa_issued'
  | 'nusuk_rawdah_booked'
  | 'completed';

export type TransactionType = 'customer_receipt' | 'supplier_payment' | 'agent_commission' | 'refund';

export type Currency = 'INR' | 'SAR' | 'USD';

export interface Pilgrim {
  id: string;
  bookingId: string;
  packageBatchId: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  passportExpiry: string; // YYYY-MM-DD
  nationality: string;
  gender: Gender;
  dob: string; // YYYY-MM-DD
  age: number;
  contactNumber: string;
  email?: string;
  bloodGroup: string;
  isMahramHead: boolean;
  mahramId?: string; // id of head pilgrim
  relationship?: RelationshipType;
  passportFrontUrl?: string;
  passportBackUrl?: string;
  photoUrl?: string;
  
  // Visa & Nusuk details
  visaStatus: VisaMilestone;
  visaNumber?: string;
  mofaNumber?: string;
  visaPdfUrl?: string;
  nusukRawdahSlot?: string; // e.g. "2026-09-15 03:00 AM"
  nusukUmrahSlot?: string;

  // Ground Allocations
  makkahRoomId?: string;
  madinahRoomId?: string;
  busAllocationId?: string;
  flightSeatNumber?: string;
  emergencyBadgeGenerated?: boolean;
  
  // Sub-agent attribution
  subAgentId?: string;
  specialNeeds?: string;
  notes?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. "CTT-2026-089"
  leadId?: string;
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
  city: string;
  packageBatchId: string;
  pilgrimCount: number;
  pilgrimIds: string[];
  totalAmountInr: number;
  paidAmountInr: number;
  balanceAmountInr: number;
  status: 'draft' | 'deposit_paid' | 'confirmed' | 'completed' | 'cancelled';
  subAgentId?: string;
  agentCommissionInr?: number;
  bookedAt: string;
  departureDate: string;
  returnDate: string;
  gstNumber?: string;
  specialRequests?: string;
}

export interface PackageBatch {
  id: string;
  code: string; // e.g. "HAJJ-2026-VIP", "UMRAH-SEP-DELUXE"
  title: string;
  titleAr: string;
  type: 'fixed_departure' | 'custom_fit';
  durationDays: number;
  departureCity: string;
  departureDate: string;
  returnDate: string;
  totalSeats: number;
  availableSeats: number;
  
  // Costing Matrix per Sharing Tier (INR)
  pricing: {
    quadSharingInr: number;
    tripleSharingInr: number;
    doubleSharingInr: number;
    singleSharingInr: number;
  };

  // Base Cost Components (for Costing & P&L calculation)
  costBreakdown: {
    flightFareInr: number;
    makkahHotelSarPerNight: number;
    madinahHotelSarPerNight: number;
    makkahNights: number;
    madinahNights: number;
    visaInsuranceInr: number;
    transportSarPerPerson: number;
    cateringSarPerDay: number;
    ziyaratSar: number;
    maktabMutawwifSar?: number;
    targetMarginInr: number;
    gstPercentage: number;
  };
  
  makkahHotelName: string;
  makkahHotelDistance: string; // e.g. "0m (Clock Tower)" or "250m"
  madinahHotelName: string;
  madinahHotelDistance: string; // e.g. "100m from Haram"
  airlineName: string;
  flightRoute: string; // e.g. "BOM ➔ JED / MED ➔ BOM"
  status: 'open' | 'filling_fast' | 'sold_out' | 'in_progress' | 'completed';
}

export interface Hotel {
  id: string;
  city: 'Makkah' | 'Madinah';
  name: string;
  nameAr: string;
  rating: number; // 3, 4, 5 star
  distanceToHaram: string;
  address: string;
  addressAr: string;
  googleMapUrl: string;
  receptionPhone: string;
  managerName: string;
  totalRooms: number;
  image: string;
}

export interface RoomAllocation {
  id: string;
  packageBatchId: string;
  hotelId: string;
  hotelCity: 'Makkah' | 'Madinah';
  roomNumber: string;
  floor: number;
  roomType: RoomSharingType;
  capacity: number;
  genderType: RoomGenderType;
  pilgrimIds: string[];
  isFullyOccupied: boolean;
  notes?: string;
}

export interface TransportAllocation {
  id: string;
  packageBatchId: string;
  vehicleType: VehicleType;
  vehicleNumber: string; // e.g. "KSA-7821-B"
  capacity: number;
  driverName: string;
  driverPhone: string;
  ameerLeaderName: string;
  ameerLeaderPhone: string;
  routeName: string; // e.g. "JED Airport ➔ Makkah Hotel (Al Safwah)"
  routeDate: string;
  pilgrimIds: string[];
  luggageCount: number;
  status: 'scheduled' | 'boarding' | 'in_transit' | 'arrived';
}

export interface FlightManifest {
  id: string;
  packageBatchId: string;
  airline: string;
  flightNumber: string; // e.g. "SV 741"
  pnr: string; // e.g. "W9X7KP"
  departureAirport: string; // "BOM - Mumbai"
  arrivalAirport: string; // "JED - Jeddah"
  departureTime: string;
  arrivalTime: string;
  totalSeatsBlocked: number;
  seatsAllocated: number;
  pilgrimSeatMap: { pilgrimId: string; seatNumber: string; bagTagNumber: string; checkedIn: boolean }[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  source: 'website_form' | 'whatsapp' | 'facebook_ad' | 'walk_in' | 'b2b_referral';
  interestType: 'Hajj 2026' | 'Umrah Group' | 'VIP Custom FIT' | 'Ramadan Special';
  paxCount: number;
  budgetInr?: number;
  assignedTo: string;
  status: LeadStatus;
  leadScore: number; // 1 to 100
  lastContactedAt: string;
  followUpDate: string;
  notes: string;
  createdAt: string;
}

export interface SubAgent {
  id: string;
  agencyName: string;
  contactPerson: string;
  city: string;
  phone: string;
  email: string;
  walletBalanceInr: number;
  creditLimitInr: number;
  commissionPercentage: number;
  totalBookings: number;
  totalPilgrims: number;
  status: 'active' | 'pending_kyc' | 'suspended';
  whiteLabelSettings: {
    brandName: string;
    logoUrl?: string;
    contactPhone: string;
    supportEmail: string;
  };
}

export interface FinancialTransaction {
  id: string;
  bookingId?: string;
  packageBatchId?: string;
  supplierId?: string;
  subAgentId?: string;
  transactionType: TransactionType;
  description: string;
  descriptionAr?: string;
  currency: Currency;
  amount: number;
  exchangeRate: number; // 1 SAR = X INR (e.g. 22.35)
  amountInr: number;
  paymentMode: 'Bank Transfer' | 'UPI' | 'Saudi Bank SNB' | 'Cash' | 'Card' | 'Wallet';
  referenceNumber: string;
  receiptNumber: string;
  createdAt: string;
  status: 'verified' | 'pending' | 'rejected';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  action: string;
  module: 'CRM' | 'Pilgrims' | 'GroundOps' | 'VisaNusuk' | 'Finance' | 'B2B' | 'WhatsApp' | 'Settings';
  details: string;
  ipAddress: string;
}

export interface WhatsAppMessage {
  id: string;
  recipientPhone: string;
  recipientName: string;
  templateType: 
    | 'booking_confirmation'
    | 'payment_receipt'
    | 'visa_issued'
    | 'flight_schedule'
    | 'hotel_room_assigned'
    | 'nusuk_rawdah_slot'
    | 'daily_itinerary'
    | 'emergency_broadcast';
  messageText: string;
  messageTextAr?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  attachmentUrl?: string;
}
