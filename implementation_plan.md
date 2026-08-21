# Hajj & Umrah Enterprise ERP & Operations Management System
**Client:** Classic Tour & Travels (Mumbai, India) — [goclassictour.com](https://goclassictour.com/)  
**Document:** System Architecture, Database Design & Technical Implementation Plan

---

## 1. Executive Overview & Business Objective

Classic Tour & Travels requires a specialized, full-lifecycle Enterprise ERP to unify and automate sales, pilgrim record management, complex ground operations across Makkah/Madinah, supplier settlements in SAR, B2B agent distributions, and multi-channel WhatsApp communications.

```
[Leads / B2B Agents] ➔ [Dynamic Quotation] ➔ [Booking & Passport OCR] 
        ➔ [Visa & Nusuk Milestones] ➔ [Room / Flight / Bus Allocation] 
        ➔ [Ground Ops & Badges] ➔ [Multi-Currency P&L / Accounts]
```

---

## 2. Core Modules Specification

### Module 1: CRM & Omnichannel Lead Management
- **Lead Capture:** Webhook integrations for `goclassictour.com`, WhatsApp Business, Facebook/Instagram Lead Ads, and walk-in lead forms.
- **Pipeline Stages:** `New Inquiry` ➔ `Quotation Sent` ➔ `Document Follow-up` ➔ `Deposit Paid` ➔ `Confirmed Booking` ➔ `Lost/Archived`.
- **Auto-Routing:** Round-robin lead assignment among sales executives with follow-up SLA alerts.

### Module 2: Pilgrim Hierarchy & Passport MRZ Vault
- **Family & Group Linking:** Group Primary Booker (Head) linked to pilgrims with defined relations (`Spouse`, `Mahram`, `Child`, `Infant`, `Group Member`).
- **AI OCR Passport Scanner:** Automatic parsing of standard ICAO Doc 9303 (2-line MRZ) extracting:
  - Full Name, Given Name, Surname
  - Passport Number, Nationality, Date of Birth, Gender
  - Issue Date, Expiry Date (with 6-month validity auto-check)
- **Document Repository:** Secure S3 storage with presigned URLs for Passports, Visas, Vaccination Cards, and Photos.

### Module 3: Dynamic Package & Quotation Engine
- **Package Types:**
  - **Fixed Departures:** Pre-blocked flight packages with set departure dates, hotel blocks, and seat limits.
  - **Custom FIT (Free Independent Traveler):** Dynamic build with live room rate calculation per sharing tier (Quad, Triple, Double, Single).
- **Costing Engine:**
  - Flight Fare (INR) + Hotel Cost (SAR converted to INR) + Visa Fee + Bus Transfer + Ziyarat + Maktab/Mutawwif + Margin + GST/TCS.
- **Quotation Generator:** Bilingual (English / Arabic) branded PDF generator with 1-click WhatsApp dispatch.

### Module 4: Ground Operations & Allocation Matrix (The Core)
- **Hotel Room Allocation:**
  - Visual matrix of blocked vs occupied rooms across Makkah & Madinah hotels.
  - Automatic gender segregation for shared Quad/Triple rooms.
  - Rooming list export directly in Saudi hotel submission formats.
- **Flight PNR & Airline Allocation:**
  - Airline block manifest management (e.g. Saudi Airlines, Air India, IndiGo).
  - Web check-in manifest export & baggage tag generator.
- **Bus & Transport Charters:**
  - 45-seater bus allocation and VIP GMC private transport assignments.
  - Route scheduling: *JED Airport ➔ Makkah Hotel ➔ Madinah Hotel ➔ MED Airport* + Makkah/Madinah Ziyarat.
- **Pilgrim ID Badge & Emergency QR System:**
  - Printable credit-card size badge with QR code linking to digital emergency profile (Pilgrim Photo, Blood Group, Hotel address in Arabic, Bus #, Emergency Ameer Phone).

### Module 5: Visa Processing & Saudi Nusuk Compliance
- **Milestone Tracking:** `Passport Submitted` ➔ `MoFA Generated` ➔ `Insurance Attached` ➔ `Visa Issued` ➔ `Rawdah / Umrah Permit Booked on Nusuk`.
- Bulk status updates and visa PDF batch generation.

### Module 6: B2B Sub-Agent Portal & Commission Engine
- **Sub-Agent Access:** Dedicated portal for partner travel agents across Maharashtra and India.
- **Credit & Commission Management:**
  - Real-time wallet balance, credit limits, and markup commission rules.
  - White-labeled vouchers and booking slips for agents.

### Module 7: Multi-Currency Finance & Batch Profitability
- **Dual Currency Ledger:** Customer receivables in **INR**, Saudi supplier payables in **SAR** (Saudi Riyal) with real-time or fixed conversion exchange rates.
- **Installment Milestones:** Booking Advance ➔ Visa Milestone ➔ Ticket Delivery ➔ Departure Clearance.
- **Automated Invoicing:** GST compliant invoices, payment receipts, and automated payment reminders via WhatsApp.
- **Batch P&L Statement:** Live financial health per departure batch (Total Revenue vs Airline + Hotel + Visa + Transport + Catering + Agent Commission = Net Profit).

### Module 8: WhatsApp Business API Native Integration
- Automated transactional messaging:
  - Booking confirmation & payment receipt PDFs
  - Visa dispatch with PDF attachment
  - Flight schedule reminder & hotel room assignment
  - Daily itinerary notification in Saudi Arabia
- Two-way Live Chat inbox for customer support agents.

### Module 9: Granular Role-Based Access Control (RBAC) & Audit Logs
- **Roles:** `Super Admin`, `Operations Manager`, `Sales Executive`, `Saudi Ground Ameer`, `Visa Desk Officer`, `Accountant`, `B2B Agent`.
- **Security:** Immutable audit logs tracking every modification (e.g., room change, price override, document download) with IP and timestamp.

---

## 3. Database Schema Blueprint (PostgreSQL)

```sql
-- Core Pilgrims & Booking Entities
CREATE TABLE pilgrims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    passport_number VARCHAR(20) UNIQUE NOT NULL,
    passport_expiry DATE NOT NULL,
    nationality VARCHAR(50) DEFAULT 'Indian',
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    dob DATE NOT NULL,
    is_mahram_head BOOLEAN DEFAULT FALSE,
    mahram_id UUID REFERENCES pilgrims(id),
    relationship VARCHAR(50),
    passport_front_url TEXT,
    passport_back_url TEXT,
    photo_url TEXT,
    visa_number VARCHAR(50),
    visa_pdf_url TEXT,
    nusuk_rawdah_slot TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotel Room Allocation
CREATE TABLE room_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id),
    package_batch_id UUID REFERENCES package_batches(id),
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(20) CHECK (room_type IN ('single', 'double', 'triple', 'quad', 'quint')),
    gender_type VARCHAR(10) CHECK (gender_type IN ('male', 'female', 'family')),
    pilgrim_ids UUID[] DEFAULT '{}',
    is_fully_occupied BOOLEAN DEFAULT FALSE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL
);

-- Transport / Bus Allocation
CREATE TABLE transport_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_batch_id UUID REFERENCES package_batches(id),
    vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('bus_45', 'coaster_25', 'hiace_14', 'gmc_yukon', 'sedan')),
    vehicle_number VARCHAR(50),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(50),
    leader_name VARCHAR(100),
    pilgrim_ids UUID[] DEFAULT '{}',
    route_name VARCHAR(100) -- e.g. "JED Airport to Makkah Hotel"
);

-- Dual Currency Financial Ledger
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    supplier_id UUID REFERENCES suppliers(id),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('customer_receipt', 'supplier_payment', 'agent_commission', 'refund')),
    currency VARCHAR(5) CHECK (currency IN ('INR', 'SAR', 'USD')),
    amount NUMERIC(14, 2) NOT NULL,
    exchange_rate NUMERIC(10, 4) DEFAULT 1.0000,
    amount_inr NUMERIC(14, 2) NOT NULL,
    payment_mode VARCHAR(50), -- UPI, NetBanking, Cash, Saudi Bank Transfer
    reference_number VARCHAR(100),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. UI/UX Design System & Layouts

- **Design Tone:** Modern, clean, enterprise-grade dark & light mode dashboard.
- **Palette:** 
  - Primary: Deep Oceanic Blue (`#03578F`)
  - Accent / Luxury: Warm Makkah Gold (`#D4AF37`)
  - Ground Status Success: Emerald Green (`#10B981`)
  - Neutral Backgrounds: Crisp Slate/Zinc (`#0F172A` & `#F8FAFC`)
- **Bilingual & RTL:** Native English & Arabic interface with instant toggle for Saudi ground team operators.

---

## 5. Phased Implementation Roadmap

| Phase | Deliverables | Target Timeline |
| :--- | :--- | :--- |
| **Phase 1: Foundations & CRM** | DB Setup, Auth/RBAC, Lead Management, Customer & Family Profiles, Passport MRZ OCR Scanner | Sprint 1–2 |
| **Phase 2: Packages & Quotation Engine** | Package Builder (Fixed & FIT), Costing Calculator, Bilingual PDF Generator, WhatsApp API Webhooks | Sprint 3–4 |
| **Phase 3: Operations & Allocations** | Hotel Room Sharing Matrix, Flight PNR Allocator, Bus Fleet Manifests, Pilgrim ID Badge/QR Generator | Sprint 5–6 |
| **Phase 4: Visa, Finance & B2B Portal** | Visa Desk Tracker, Dual Currency (INR/SAR) Ledger, Batch P&L Reports, Agent Portal & Wallet | Sprint 7–8 |
| **Phase 5: Ground Ops Testing & Handover** | End-to-end integration testing, Saudi field simulation, staff training & cloud deployment | Sprint 9 |

---

## 6. Verification & Quality Assurance

1. **OCR Accuracy:** Test passport MRZ parser across 50+ real passport variations with 99%+ accuracy.
2. **Room Allocation Concurrency:** Test concurrent room allocation during peak booking with Redis atomic locks to ensure zero overbooking.
3. **Multi-Currency Reconciliation:** Validate ledger integrity so that SAR to INR transactions maintain perfect accounting balance.
4. **WhatsApp Delivery:** Verify automated triggers for booking receipts, visa PDFs, and batch broadcast notifications.
