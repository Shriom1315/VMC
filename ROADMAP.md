# Vikramaditya Metrology Center — Application Roadmap
### ISO 17025 / NABL Calibration Lab Management System

> Sources: NABL India ([nabl-india.org](https://nabl-india.org)), ISO/IEC 17025:2017, 
> Reckon7Lab LIMS ([reckon7lab.com](https://reckon7lab.com)), 
> Calibration Awareness ([calibrationawareness.com](https://calibrationawareness.com/how-to-properly-use-and-interpret-an-iso-17025-calibration-certificate))
> Content was paraphrased for compliance with licensing restrictions.

---

## What This System Is

Vikramaditya Metrology Center is an **ISO 17025 / NABL-accredited dimensional calibration laboratory** in Kolhapur, Maharashtra. NABL accreditation (under Quality Council of India) means every step of the lab's workflow is governed by ISO/IEC 17025:2017 — the international standard for testing and calibration laboratory competence.

This software is the lab's **LIMS (Laboratory Information Management System)** — replacing paper at every step from client enquiry to payment receipt.

---

## The Full Business Pipeline

Based on industry research of NABL-accredited calibration lab workflows, the complete flow is:

```
CLIENT ENQUIRY
      ↓
  QUOTATION  ──→  Purchase Order (from client)
      ↓
  MATERIAL INWARD  (Job registration + challan)
      ↓
  CALIBRATION / REPAIR  (Job card + standard equipment + measurements)
      ↓
  CERTIFICATE GENERATION  (ISO 17025 compliant: results + uncertainty + traceability)
      ↓
  DISPATCH  (Instruments returned to client with certificates)
      ↓
  SALES INVOICE  (GST billing)
      ↓
  RECEIPT  (Payment collection)
      ↓
  REPORTS  (Outstanding, Ledger, GST, Certificate History)
```

---

## Data Flow — Detailed Stage by Stage

### Stage 0 — Master Data Setup (One-time, maintained ongoing)

These tables are set up once and referenced throughout every transaction. They are the foundation that makes ISO 17025 compliance possible.

```
parties          → Client registry (name, address, GST, billing firm, compliance preferences)
gauges           → Gauge/instrument type master (IS standard nos., cert formats, calib methods)
equipments       → Lab's own standard equipment (code, serial, MGF date, periodicity)
equipment_history→ Each standard equipment's calibration history (cert no., due dates, ranges)
uncertainty_records → Uncertainty budget per equipment (accuracy, k-factor, resolution, repeatability)
scopes           → Lab's accredited scope (which gauge types at what range/least count it can calibrate)
app_users        → Staff accounts with role-based access (admin / manager / staff)
```

**Why this matters for ISO 17025:**
- `scopes` defines what the lab is accredited to calibrate — jobs outside scope should not be accepted
- `uncertainty_records` feeds directly into the uncertainty budget on every calibration certificate (ISO 17025 §7.6 requires expanded uncertainty at 95% confidence level, k=2)
- `equipment_history` proves traceability of standard equipment to national standards (NPL India / BIPM chain)
- `equipments` tracks calibration due dates — equipment past due cannot be used for calibration

---

### Stage 1 — Quotation

**Route:** `/admin/transactions/quotation`  
**Table:** `quotations`  
**Status:** ✅ Done

A client requests calibration of their instruments. The lab raises a quotation listing each instrument, calibration type, and rate.

```
quotations
  quotation_no   (unique, auto-generated)
  client_name    ──→ parties.name
  client_gstin
  items[]        (JSON: instrument name, identification no, qty, rate, discount)
  net_total, rounded_total
  po_no          (client's purchase order reference)
```

**What's missing / needs improvement:**
- Rates should come from the `Rate Register` master (placeholder) instead of being typed manually each time
- No link back to `scopes` — system should warn if a quoted instrument type is outside accredited scope

---

### Stage 2 — Purchase Order

**Route:** `/admin/transactions/purchase-order`  
**Table:** `purchase_orders`  
**Status:** ✅ Done

Client sends a formal PO approving the quotation. This authorises the work.

```
purchase_orders
  po_number      (unique)
  customer_name  ──→ parties.name
  items[]        (JSON: description, qty, amount)
  total_amount
```

**What's missing:**
- No FK linking PO → quotation (manual cross-reference today)

---

### Stage 3 — Material Inward (Job Registration)

**Route:** `/admin/transactions/inward`  
**Tables:** `inward_bills`, `inward_items`  
**Status:** ✅ Done (including print challan)

The client delivers instruments to the lab. An **Inward Challan** is generated — this is the legal document confirming receipt of instruments. Under ISO 17025 §7.4, labs must document the condition of items when received.

```
inward_bills  (Challan Header)
  id            → becomes Doc No. on the printed challan
  client_name   ──→ parties.name
  billing_to, delivery_to
  client_dc_no, client_dc_date   (Client's delivery challan reference)
  inward_date, receive_date, commit_date
  calib_method  (Lab Method / Customer Method)
  mode_of_collection, mode_of_dispatch
  compliance, decision_rule      (ISO 17025 §7.8.6 conformity statement)
  lab_authorized_person
  billing_firm

inward_items  (One row per instrument)
  inward_bill_id  ──→ inward_bills.id
  gauge_name      ──→ gauges.gauge_name
  identification_no  (client's ID number on the instrument)
  lab_id          (lab's internal tracking ID — should be auto-generated)
  process         (Calibration / Repair / Repair & Calibration)
  gauge_condition (Visually Ok, Damaged, etc.)  ← ISO 17025 §7.4 requirement
  calib_under     (NABL / Non-NABL / ILC)
  calib_location  (Permanent Facility / On-Site / Mobile)
  parameters[]    (JSON: Go/NoGo basicSize, specLimitMax, specLimitMin, wearLimit)
  calibFrequency  (how often client calibrates this instrument)
```

**Print output:** Inward Challan (matches the physical format — firm name, consignee, doc no., item list with sub-particulars and frequency)

**What's missing:**
- `lab_id` is manually typed — should auto-generate (e.g. VMC-2026-0001, sequential per year)
- No link from `inward_items` → `calib_jobs` (staff must re-enter instrument data when creating the job card)

---

### Stage 4 — Calibration Status (Job Card)

**Route:** `/admin/transactions/calib-status`  
**Table:** `calib_jobs`  
**Status:** ✅ Done

The actual calibration work is recorded here. ISO 17025 §7.3 requires that all method information, environmental conditions, standard equipment used, and measurement results be documented.

```
calib_jobs
  lab_id          ──→ inward_items.lab_id  (manual link today — no FK)
  name            (gauge name)
  identification_no
  specification   (size range)
  dc_no, dc_date  (client DC reference from inward)
  calib_date, next_calib_date
  cert_no, cert_issue_date, ulr_no   ← NABL requires ULR No. on all NABL certificates
  make, sr_no, lc  (least count)
  standard_equipment[]  ──→ equipments (which lab equipment was used)
  calib_temp      (environmental conditions — ISO 17025 §5.3 requirement)
  uncertainty     ──→ uncertainty_records (expanded uncertainty, k=2, 95% confidence)
  calib_location  (Permanent Facility / On-Site)
  calibrated_by, approved_by  (signatures for the certificate)
  parameters[]    (Go/No-Go limits from inward)
  results[]       (x1, x2, x3 readings + average per measurement row)
  remark
  status          (pending → generated)
  client_name     ──→ parties.name
```

**ISO 17025 certificate requirements captured here:**
- Instrument identification (name, serial, identification no.)
- Calibration method used
- Environmental conditions (temperature, humidity)
- Standard equipment used (traceability chain)
- Measurement uncertainty (at 95.45% confidence, k=2)
- Calibrated by + Approved by (authorised signatures)
- Calibration date + next due date

---

### Stage 5 — Certificate Generation

**Route:** Part of Calibration Status page  
**Components:** `CalibCertificate.tsx`, `CalibDatasheet.tsx`  
**Status:** ✅ Done

When a job is complete, the lab generates two print documents:

1. **Calibration Certificate** — the customer-facing document with letterhead, NABL logo, measurement results, uncertainty statement, traceability, and authorised signatures. This is what the client uses as proof of calibration.

2. **Calibration Datasheet** — the internal technical record with raw x1/x2/x3 readings, averages, and standard deviation.

**ISO 17025 §7.8.2 mandatory certificate fields — all present in the system:**

| Requirement | Where in system |
|---|---|
| Title "Calibration Certificate" | Hard-coded in component |
| Lab name & address | NABL letterhead |
| Unique cert number | `calib_jobs.cert_no` |
| Client name & address | `calib_jobs.client_name` |
| Instrument description & ID | `calib_jobs.name`, `identification_no` |
| Date of calibration | `calib_jobs.calib_date` |
| Calibration method | `calib_jobs.calib_method_use` |
| Environmental conditions | `calib_jobs.calib_temp` |
| Standard equipment used | `calib_jobs.standard_equipment[]` |
| Measurement results | `calib_jobs.parameters[]` + `results[]` |
| Measurement uncertainty | `calib_jobs.uncertainty` |
| Traceability statement | Hard-coded |
| Authorised signatures | `calib_jobs.calibrated_by`, `approved_by` |
| ULR No. | `calib_jobs.ulr_no` (NABL specific) |

**After certificate generation:** `calib_jobs.status` flips to `"generated"`. Certificate history report reads all records with `status = 'generated'`.

---

### Stage 6 — Dispatch

**Route:** `/admin/transactions/dispatch`  
**Table:** `dispatches`  
**Status:** ✅ Done

After certificates are ready, instruments are dispatched back to the client along with the calibration certificates.

```
dispatches
  job_id       ──→ calib_jobs.lab_id  (text field today — should be FK)
  party        ──→ parties.name
  instruments  (text description of what's being dispatched)
  dc_no        (outward delivery challan number)
  dispatch_date
  courier      (By Hand / Courier / Email)
  tracking_no
  received_by
  status       (pending → dispatched → delivered)
```

---

### Stage 7 — Sales Invoice

**Route:** `/admin/transactions/sales-invoice`  
**Table:** `invoices`  
**Status:** ✅ Done

After dispatch, the lab raises a GST invoice to the client.

```
invoices
  invoice_no    (unique, e.g. VMC/2026/001)
  party         ──→ parties.name
  dc_ref        ──→ dispatches.dc_no  (text link — no FK)
  invoice_date
  amount, gst_amount, total
  status        (draft → issued → paid / overdue)
```

**GST calculation** uses the party's `gst_type` (CGST+SGST for Maharashtra clients, IGST for out-of-state).

---

### Stage 8 — Receipt

**Route:** `/admin/transactions/receipt`  
**Table:** `receipts`  
**Status:** ✅ Done

Payment against the invoice is recorded.

```
receipts
  receipt_no    (unique)
  party         ──→ parties.name
  invoice_ref   ──→ invoices.invoice_no  (text link — no FK)
  receipt_date
  amount
  mode          (cash / cheque / upi / neft / rtgs)
  reference     (cheque no., transaction ID, etc.)
```

---

### Stage 9 — Reports

| Report | Route | Status | What it reads |
|---|---|---|---|
| Certificate History | `/admin/reports/cert-history` | ✅ | `calib_jobs` where status=generated |
| Outstanding | `/admin/reports/outstanding` | ✅ | `invoices` - `receipts` = balance |
| Ledger | `/admin/reports/ledger` | ✅ | `invoices` + `receipts` per party |
| Sales GST Report | `/admin/reports/sales-gst` | ✅ | `invoices` CGST/SGST/IGST breakdown |
| Total Quotations | `/admin/reports/total-quotations` | 🔲 | `quotations` |
| Total POs | `/admin/reports/total-pos` | 🔲 | `purchase_orders` |

---

## Page Status Summary

### ✅ Built & Working

| Module | Page | Table(s) |
|---|---|---|
| Basic Reg | Party Registration | `parties` |
| Basic Reg | Gauge Info | `gauges` |
| Basic Reg | New Equipment | `equipments` |
| Basic Reg | Equipment History | `equipment_history` |
| Basic Reg | Uncertainty Registration | `uncertainty_records` |
| Basic Reg | Scope Registration | `scopes` |
| Transactions | Quotation | `quotations` |
| Transactions | Purchase Order | `purchase_orders` |
| Transactions | Material Inward | `inward_bills`, `inward_items` |
| Transactions | Calibration Status | `calib_jobs` |
| Transactions | Dispatch | `dispatches` |
| Transactions | Sales Invoice | `invoices` |
| Transactions | Receipt | `receipts` |
| Reports | Certificate History | `calib_jobs` |
| Reports | Outstanding | `invoices`, `receipts` |
| Reports | Ledger | `invoices`, `receipts` |
| Reports | Sales GST Report | `invoices` |
| System | Dashboard | all tables (counts) |
| System | User Management | `app_users` |
| System | Login | Supabase Auth |

### 🔲 Placeholder (Not Yet Built)

| Module | Page | What it needs | New Table needed |
|---|---|---|---|
| Basic Reg | Thread/Ring/Plug Spec | Register IS standard thread spec templates | `thread_specs` |
| Basic Reg | Taper Thread Reading | Taper gauge reading templates | `taper_readings` |
| Basic Reg | Reading Masters | Calibration reading templates per gauge type | `reading_masters` |
| Basic Reg | Instrument Repair Master | Log repairs to lab's own equipment | `instrument_repairs` |
| Basic Reg | Dial Table Master | Dial gauge range lookup table | `dial_table` |
| Basic Reg | Rate Register | Per-gauge calibration rates | `rates` |
| Basic Reg | Custom PO Rate Master | Client-specific rate overrides | `custom_po_rates` |
| Basic Reg | Firm Creation | Multiple billing firm profiles | `firms` |
| Reports | Total Quotations | Aggregate quotation report | uses `quotations` |
| Reports | Total POs | Aggregate PO report | uses `purchase_orders` |

---

## Critical Gaps to Fix (Priority Order)

### 🔴 Priority 1 — Data integrity (affects compliance)

**1. Auto-generate Lab ID on inward**
- Currently `inward_items.lab_id` is typed manually
- Should auto-generate: `VMC-{YEAR}-{SEQUENCE}` (e.g. VMC-2026-0047)
- Ensures unique, traceable ID per instrument — ISO 17025 §7.4 traceability requirement

**2. Link Inward → Calib Job**
- Staff currently re-enters instrument data when creating a `calib_job`
- Fix: Add a "Create Job Card" button in the inward items view that pre-fills the job from the inward item
- Would eliminate duplicate entry of: gauge name, identification no., lab ID, client name, DC no., parameters

**3. Fix text FK fields to proper references**
- `dispatches.job_id` → should be FK to `calib_jobs.id`
- `invoices.dc_ref` → should be FK to `dispatches.dc_no`
- `receipts.invoice_ref` → should be FK to `invoices.invoice_no`

### 🟡 Priority 2 — Workflow automation

**4. Auto-update invoice status when paid**
- When a receipt is added matching an invoice's full amount, `invoices.status` should flip to `'paid'`
- Currently manual

**5. Link Quotation → PO → Inward**
- A quotation's `quotation_no` should be referenceable from the inward bill (client often mentions their PO/quotation number)
- No FK exists today — all cross-references are manual text

**6. Equipment due-date alerts on Dashboard**
- `equipment_history.calibration_due_dt` should surface on the dashboard when equipment is overdue
- ISO 17025 requires that equipment past calibration due date must NOT be used
- The system has the data but no alert

### 🟠 Priority 3 — Missing pages (secondary masters)

**7. Rate Register**
- Calibration rates per gauge type per client type (NABL / Non-NABL)
- Would make quotation creation faster and more accurate

**8. Thread/Ring/Plug Spec Master**
- Templates for thread gauge specifications (IS standards)
- Feeds into the inward item parameter setup

**9. Firm Creation**
- Support multiple billing entities (Vikramaditya Calibration, Vikramaditya Enterprises, Central Calibration Lab)
- Currently hard-coded in dropdowns

---

## ISO 17025 Compliance Checklist vs System

| ISO 17025 Requirement | Where in system | Status |
|---|---|---|
| Unique sample identification | `inward_items.lab_id` | ⚠️ Manual — needs auto-gen |
| Condition of item at receipt | `inward_items.gauge_condition` | ✅ |
| Calibration method documented | `calib_jobs.calib_method_use` | ✅ |
| Environmental conditions recorded | `calib_jobs.calib_temp` | ✅ |
| Standard equipment identified | `calib_jobs.standard_equipment[]` | ✅ |
| Traceability of standards | `equipment_history` → `uncertainty_records` | ✅ data exists, ⚠️ not linked |
| Measurement uncertainty on cert | `calib_jobs.uncertainty` | ✅ |
| ULR No. on NABL certificates | `calib_jobs.ulr_no` | ✅ |
| Authorised signatures on cert | `calib_jobs.calibrated_by`, `approved_by` | ✅ |
| Certificate not reproducible except in full | Hard-coded footer text | ✅ |
| Conformity statement (pass/fail) | `calib_jobs.conformityStatement` | ✅ |
| Scope of calibration scope register | `scopes` table | ✅ |
| Calibration due date tracking | `equipment_history.calibration_due_dt` | ✅ data, ⚠️ no alerts |
| Non-conforming work handling | Not implemented | 🔲 |
| Internal audit trail | No dedicated audit log | 🔲 |
| Proficiency testing records | Not implemented | 🔲 (Reckon7Lab has this on roadmap) |

---

## Role Access vs ISO 17025 Responsibilities

ISO 17025 requires separation of duties between technical operations and management review:

| Action | Staff | Manager | Admin |
|---|---|---|---|
| Register inward / calibrate / dispatch | ✅ | ✅ | ✅ |
| Approve / sign certificates | ✅ (calibrated_by) | ✅ (approved_by) | ✅ |
| View scope & rates | ❌ | ✅ | ✅ |
| Create quotations & invoices | ❌ | ✅ | ✅ |
| View financial reports & GST | ❌ | ✅ | ✅ |
| Manage users & firm settings | ❌ | ❌ | ✅ |
