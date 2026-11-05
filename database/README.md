# TraceNet Database Architecture (Phase 1)

This database architecture is designed specifically for **TraceNet: An AI-Based Missing Person Detection, Community Report Matching, and Police Coordination System for Cebu City**.

It translates Chapter III's Data Dictionary (Tables 7 through 18) into a fully functional PostgreSQL database equipped with **PostGIS** (spatial) and **pgvector** (AI embeddings), optimized to run on **100% Free Cloud Infrastructure**.

---

## 1. Why This Solution Is 100% Free

| Service Component | Free Tier Provider | Limits on Free Tier | Cost |
| :--- | :--- | :--- | :--- |
| **Relational Database** | [Supabase](https://supabase.com) (PostgreSQL) | Up to 500 MB (enough for tens of thousands of case records & audit logs) | **$0 / month** |
| **Spatial Engine (PostGIS)** | Built into Supabase | Full PostGIS extension enabled by default | **$0 / month** |
| **AI Vector Storage (pgvector)** | Built into Supabase | Full pgvector extension enabled by default | **$0 / month** |
| **Media / Photo Storage** | Supabase Storage Bucket | 1 GB storage for missing/found person photos | **$0 / month** |
| **Authentication** | Supabase Auth (JWT) | Up to 50,000 monthly active users | **$0 / month** |
| **Hosting & API** | Next.js on Vercel | Unlimited deployments on hobby tier | **$0 / month** |

---

## 2. Cross-Platform Compatibility (Web + Mobile)

The database can be queried seamlessly from both platforms without building separate backends:
1. **Next.js Web Portal** (Barangay, CCPO, and Citizen Web):
   - Uses `@supabase/supabase-js` or Next.js server-side route handlers.
2. **React Native / Expo Mobile App** (Citizen Android App):
   - Uses the identical `@supabase/supabase-js` client library with automatic persistent storage via AsyncStorage.
3. **Python AI Microservice** (Dual facial + text scoring):
   - Uses `psycopg2` or `supabase-py` to fetch case photos, generate embeddings, and write back dual similarity scores directly.

---

## 3. How to Set Up in 2 Minutes

### Step 1: Create a Free Project
1. Go to [supabase.com](https://supabase.com) and sign in with GitHub or Google (completely free).
2. Click **New Project**, name it `tracenet-db`, and set a database password. Select `Singapore (ap-southeast-1)` as the region for the lowest latency in Cebu City.

### Step 2: Run the Schema & Seed Scripts
1. In your Supabase dashboard, click **SQL Editor** on the left navigation bar.
2. Click **New Query**.
3. Open `database/schema.sql` from this repository, copy its entire contents, paste it into the SQL editor, and click **Run**.
4. Create another new query, copy the contents of `database/seed.sql`, paste it, and click **Run**.

### Step 3: Connect to TraceNet Web
1. In your Supabase dashboard, go to **Project Settings** -> **API**.
2. Copy the **Project URL** and the **anon public API key**.
3. In this repository, create a `.env.local` file (or copy `.env.local.example`) and add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. Run `npm run dev`. The website will automatically connect to your live database!

---

## 4. Key Functions Included

- `get_nearby_missing_cases(target_lat, target_lon, radius_meters)`: PostGIS function fulfilling Objective 3 (finding nearby cases within a given radius).
- `ai_matches` table: Distinctly records `facial_similarity_score`, `text_similarity_score`, and `overall_confidence_score` fulfilling Objective 2.
- `case_status_history` table: Tracks the 5 sequential stages (*Submitted -> Verified -> AI Matching -> Forwarded -> Resolved*).

