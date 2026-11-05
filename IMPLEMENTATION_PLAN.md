# TraceNet Implementation Plan (FINAL Manuscript Aligned)
**Project:** TraceNet: An Artificial Intelligence-Based Missing Person Detection, Community Report Matching, and Police Coordination System for Cebu City  
**Document Version:** 2.0 (Aligned with *TraceNet Capstone II Manuscript FINAL.pdf*, November 2026)  
**Target Architecture:** React Native (Expo + MapLibre) Mobile App + Next.js (React.js + MapLibre GL JS) Web Dashboards + Python FastAPI AI Service (DeepFace + spaCy) + PostgreSQL (PostGIS + pgvector on Supabase) & Firebase (Auth + FCM + Realtime Sync)

---

## 1. Key Updates in `TraceNet Capstone II Manuscript FINAL.pdf`

| Manuscript Section | Key Requirement / Update in Final Manuscript | Status & Action Needed |
| :--- | :--- | :--- |
| **Abstract & Tech Stack (p. 2, Table 19 p. 117, Fig 37 p. 141)** | Uses **MapLibre API (OpenStreetMap)** on both Mobile (`@maplibre/maplibre-react-native`) and Web (`MapLibre GL JS`) + **PostgreSQL (PostGIS + pgvector)** on Supabase + **Firebase (Auth & FCM)** + **Python FastAPI (DeepFace + spaCy)**. | Mobile already uses MapLibre; Web needs interactive MapLibre maps on Report Missing/Found, Sightings Map, and CCPO Heatmap. |
| **Objective 2 & Findings #2–3 (p. 13, p. 38, p. 165)** | AI matching produces **two separate similarity scores** (Facial Similarity % + Text Description Similarity %) combined using an **80% Facial / 20% Description weight** ($\text{Overall} = 0.80 \times S_{\text{face}} + 0.20 \times S_{\text{text}}$). | Implement 80/20 weighted formula in AI matching service and display Facial %, Text %, and 80/20 Overall Confidence % on both Web & Mobile. |
| **RRL & Testing `AI-PU-002` / `IT-P4` (p. 23, p. 128, p. 133)** | **FISWG Morphological Evaluation Rubric** (5-tier forensic confidence scale + anatomical feature checklist) displayed to Barangay/CCPO officers when reviewing candidate matches, plus **Data Privacy Act (RA 10173)** auto-purging of unmatched candidate images upon case resolution (`IT-P6`). | Add interactive FISWG rubric & RA 10173 consent/purge workflow to Match Alert & CCPO/Barangay review screens. |
| **Objective 3 & Integration Tests `IT-C6`, `IT-C7`, `IT-P2` (pp. 130, 132, 165)** | Location-based coordination: (1) **Pin exact last-seen/found location on MapLibre map** (Mobile & Web), (2) **Show nearby cases** with adjustable search radius, and (3) **Identify areas with frequent reports (Hotspot clusters)** + Export Heatmap Report. | Add interactive MapLibre pin-drop modal to Mobile (`report.js`) and Web (`report-missing` / `report-found`), plus Nearby Cases radius filter. |
| **Mobile UI Screens (Figs 10–22 & Fig 29, pp. 72–85, 92)** | Added **Forgot Password Screen** (Fig 13), **Enter Reset Code Screen** (Fig 14), **Cases Screen** (Fig 19), **Sightings Map Screen** (Fig 20), **Alerts Screen** (Fig 21), **Profile Screen** (Fig 22), plus Citizen Workflow (Fig 3.1–3.2): **Edit/Cancel Report with reason** and **Safety Tips & Hotlines**. | Verify/add Forgot Password + Enter Reset Code screens, Edit/Cancel Report, Dual Score display, and Map Pinning in `tracenet-mobile`. |
| **Web Storyboards & Workflows (Figs 23–28, Figs 30–33, pp. 86–98)** | Added **Barangay Official Login** (Fig 30.1), **Confirm AI Match** (Fig 30.4), **Digital Blotter Generator** (Fig 5.1), **Barangay Community Announcements** (Fig 4.1), and **Admin Storyboard (Fig 33)**: Admin Login, Account Approvals, Edit/Suspend Account with reason, System Settings Toggles & Analytics, and Audit Logs. | Add `/barangay/login`, `/admin/login`, Admin sub-tabs/modals (Approvals, Suspend with reason, Settings & Analytics, Audit Logs), Digital Blotter modal, and Announcements. |
| **Cross-Platform Real-Time Sync (`IT-C9`, `IT-B2`, `IT-P5`, pp. 130–133)** | Report submitted via Mobile App (`tracenet-cebu` Firebase / Supabase) must appear **immediately** on the Citizen Web Portal, Barangay Dashboard, and CCPO Command Center (`IT-C9`, `IT-B2`, Acceptance Criterion #17). | Bridge Firebase (`tracenet-cebu`) and PostgreSQL/Supabase in `lib/db.js` so Mobile and Web share live reports, matches, and notifications in real time! |

---

## 2. Detailed Action Plan Across Web & Mobile

### Phase 1: Unified Cross-Platform Database Bridge (`IT-C9`, `IT-B2`, Criterion #17)
- Connect the Next.js Web app (`lib/db.js`) to **both** PostgreSQL (`schema.sql` / Supabase) **and** your teammate's live Firebase Firestore project (`tracenet-cebu`) + Cloudinary (`px9joql3`).
- Any report submitted on the Android app (`reports` collection in `tracenet-cebu`) will immediately appear in the Web Barangay Dashboard, CCPO Command Center, Sightings Map, and Citizen Web Portal.
- Conversely, when a Barangay Official verifies/rejects a report or a CCPO Officer updates a status/confirms a match on the Web Dashboard, it updates both PostgreSQL and Firestore (`reports`, `matches`), immediately updating the mobile app's 5-stage tracker and notifications.

### Phase 2: AI Matching Engine with 80/20 Weighting & FISWG Rubric (Objective 2)
- **Python FastAPI Microservice (`ai-service/main.py`) + Built-in Next.js AI Endpoint (`/api/ai-match`):**
  - **Facial Image Score (80% weight):** Extracts facial embeddings (via DeepFace/FaceNet in Python, plus deterministic visual feature comparison fallback).
  - **Text Description Score (20% weight):** Compares age proximity, gender, barangay/location proximity, clothing keywords, and physical characteristics (supporting English, Filipino, and Cebuano terms).
  - **Combined Confidence Score:** `Overall = 0.80 * FacialScore + 0.20 * TextScore`
  - **FISWG 5-Tier Morphological Rubric (`AI-PU-002` / `IT-P4`):** Displays the 5-tier forensic scale and anatomical comparison checklist when reviewing matches.

### Phase 3: MapLibre Interactive Pinning, Nearby Cases & Heatmaps (Objective 3)
- **Web Interactive MapLibre Component (`components/CebuMap.js`):**
  - Uses free OpenStreetMap tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) with zero API keys required.
  - **Pin Picker Mode (`IT-C7`):** Used in Web `/report-missing` and `/report-found` so users can click/drag a pin on Cebu City or select any of the 80 Barangays to auto-fill exact coordinates.
  - **Sightings & Nearby Cases Mode:** Used in Web `/map` with adjustable radius filter (1 km, 3 km, 5 km, 10 km) showing distance to nearby cases.
  - **Hotspot Cluster Mode (`IT-P2`, Fig 26):** Used in CCPO `/ccpo/heatmap` with color-coded numbered cluster pins + **Export Heatmap Report** button.
- **Mobile Map Pinning & Nearby Cases (`tracenet-mobile`):**
  - Enhance `report.js` with `"Choose Location on Map"` modal (`IT-C6`) and Cebu City Barangay selector.
  - Enhance `map.js` with Nearby Cases distance filtering and hotspot indicators.

### Phase 4: Complete All Final Manuscript UI Screens & Workflows (Figs 10–33 & Table 22)
- **Web Portals:**
  - `/barangay/login` (Fig 30.1: Barangay Official Portal Login)
  - `/barangay/dashboard` (Fig 27 & 30: Verify/Reject with remarks, Forward to CCPO, Trigger AI Match, Confirm/Dismiss AI Match, Community Announcements, Barangay Statistics)
  - `/ccpo/dashboard` & `/ccpo/cases` (Figs 24–25 & 31: Assign Officer, Investigation Notes, **Generate Digital Blotter**, Trigger Face Search `"Find Match"`, Broadcast Inter-Agency Alert, RA 10173 candidate purge on Resolved)
  - `/admin/login` & `/admin` (Figs 28 & 33: Admin Login, User Management, Account Approvals for Barangay/CCPO, Edit/Suspend Account with reason, System Settings Toggles & Analytics, Database Backup/Export, and Audit Logs)
- **Mobile App (`tracenet-mobile`):**
  - Verify/complete Forgot Password (Fig 13) & Enter Reset Code (Fig 14) screens.
  - Update `match-alert.js` (Fig 17) to display the **80/20 Dual Similarity Scores** + *"Report as Possible Match"* / *"Not a Match"*.
  - Update `case-status.js` (Fig 18 & Fig 3.1) with **Edit Report**, **Cancel Report (with reason)**, and **Escalate to CCPO directly**.
