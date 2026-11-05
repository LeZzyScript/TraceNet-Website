-- =============================================================================
-- TRACENET DATABASE SCHEMA (PostgreSQL / Supabase)
-- Aligned with Chapter III Data Dictionary (Tables 7-18)
-- Supports:
--   1. PostGIS spatial extensions for geolocation, proximity search & heatmaps
--   2. pgvector extension for 512-dimensional facial recognition embeddings
--   3. Multi-role access control (Citizen, Barangay Official, CCPO Officer, Admin)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- -----------------------------------------------------------------------------
-- 1. BARANGAYS (Table 8)
-- Reference list for all 80 barangays in Cebu City
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS barangays (
    brgy_id SERIAL PRIMARY KEY,
    brgy_name VARCHAR(100) NOT NULL UNIQUE,
    brgy_district VARCHAR(50) NOT NULL CHECK (brgy_district IN ('North District', 'South District')),
    brgy_city VARCHAR(100) DEFAULT 'Cebu City',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for spatial & text lookup
CREATE INDEX IF NOT EXISTS idx_barangays_name ON barangays(brgy_name);

-- -----------------------------------------------------------------------------
-- 2. USER PROFILES & ROLES (Tables 7, 9, 10 + Admin)
-- Unified identity table supporting multi-role access control
-- -----------------------------------------------------------------------------
CREATE TYPE user_role_type AS ENUM ('citizen', 'barangay_official', 'ccpo_officer', 'admin');
CREATE TYPE account_status_type AS ENUM ('active', 'pending_approval', 'suspended', 'inactive');

CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    phone_number VARCHAR(20),
    role user_role_type NOT NULL DEFAULT 'citizen',
    account_status account_status_type NOT NULL DEFAULT 'active',
    
    -- Role-specific attributes
    brgy_id INT REFERENCES barangays(brgy_id) ON DELETE SET NULL, -- for Citizens & Barangay Officials
    position VARCHAR(100),                                         -- e.g., 'Barangay Tanod', 'Desk Officer'
    ccpo_rank VARCHAR(100),                                        -- e.g., 'Police Corporal', 'Major'
    ccpo_station VARCHAR(100),                                     -- e.g., 'Station 10 - Labangon'
    badge_number VARCHAR(50),                                      -- for law enforcement
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_brgy ON profiles(brgy_id);

-- -----------------------------------------------------------------------------
-- 3. MISSING PERSON REPORTS (Table 11)
-- Submitted by Citizens or Barangay Officials
-- -----------------------------------------------------------------------------
CREATE TYPE case_status_enum AS ENUM (
    'submitted',
    'verified_by_barangay',
    'ai_matching_in_progress',
    'forwarded_to_ccpo',
    'matched',
    'resolved',
    'cancelled',
    'rejected'
);

CREATE TABLE IF NOT EXISTS missing_person_reports (
    missing_id SERIAL PRIMARY KEY,
    case_number VARCHAR(20) UNIQUE NOT NULL,                       -- e.g., 'CASE-2038'
    reporter_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    brgy_id INT NOT NULL REFERENCES barangays(brgy_id),
    
    -- Person Personal Info
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    nickname VARCHAR(50),
    age INT NOT NULL CHECK (age >= 0 AND age <= 130),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    date_missing DATE NOT NULL,
    time_missing TIME,
    relationship_to_reporter VARCHAR(100) NOT NULL,
    
    -- Description & Circumstances
    last_seen_location TEXT NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    geom GEOMETRY(Point, 4326),                                     -- Spatial point for PostGIS queries
    clothing_description TEXT,
    physical_description TEXT,
    medical_conditions TEXT,
    circumstances TEXT,
    
    -- Media & AI Embeddings (pgvector)
    photo_url TEXT,
    facial_embedding vector(512),                                  -- 512-d FaceNet / DeepFace embedding
    
    -- Status & Workflow
    status case_status_enum NOT NULL DEFAULT 'submitted',
    verified_by_official_id UUID REFERENCES profiles(user_id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial and status indexes
CREATE INDEX IF NOT EXISTS idx_missing_geom ON missing_person_reports USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_missing_status ON missing_person_reports(status);
CREATE INDEX IF NOT EXISTS idx_missing_brgy ON missing_person_reports(brgy_id);

-- -----------------------------------------------------------------------------
-- 4. FOUND PERSON REPORTS (Table 12)
-- Submitted by Citizens or Barangay Tanods/Officials
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS found_person_reports (
    found_id SERIAL PRIMARY KEY,
    found_case_number VARCHAR(20) UNIQUE NOT NULL,                  -- e.g., 'FOUND-5012'
    reporter_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    brgy_id INT NOT NULL REFERENCES barangays(brgy_id),
    
    -- Description
    estimated_age VARCHAR(50),                                      -- e.g., 'Mid 30s'
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Unknown')),
    description TEXT NOT NULL,
    clothing_description TEXT,
    condition_notes TEXT,
    current_shelter_location TEXT,
    
    -- Geolocation
    found_location TEXT NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    geom GEOMETRY(Point, 4326),
    
    -- Media & AI Embeddings
    photo_url TEXT,
    facial_embedding vector(512),                                  -- 512-d vector for matching
    
    -- Status
    status VARCHAR(30) DEFAULT 'unmatched' CHECK (status IN ('unmatched', 'potential_match', 'matched', 'resolved', 'archived')),
    date_found DATE DEFAULT CURRENT_DATE,
    contact_person TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_found_geom ON found_person_reports USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_found_status ON found_person_reports(status);

-- -----------------------------------------------------------------------------
-- 5. AI MATCHES (Table 13)
-- Stores dual scores: Facial Similarity Score + NLP Text Similarity Score
-- Explicitly fulfills Objective 2
-- -----------------------------------------------------------------------------
CREATE TYPE match_status_enum AS ENUM ('pending_review', 'confirmed', 'dismissed');

CREATE TABLE IF NOT EXISTS ai_matches (
    match_id SERIAL PRIMARY KEY,
    missing_id INT NOT NULL REFERENCES missing_person_reports(missing_id) ON DELETE CASCADE,
    found_id INT NOT NULL REFERENCES found_person_reports(found_id) ON DELETE CASCADE,
    
    -- Dual Score Attributes (Objective 2)
    facial_similarity_score DECIMAL(5, 2) NOT NULL CHECK (facial_similarity_score >= 0 AND facial_similarity_score <= 100),
    text_similarity_score DECIMAL(5, 2) NOT NULL CHECK (text_similarity_score >= 0 AND text_similarity_score <= 100),
    overall_confidence_score DECIMAL(5, 2) NOT NULL CHECK (overall_confidence_score >= 0 AND overall_confidence_score <= 100),
    
    -- Attribute Match Breakdown checklist
    matched_features JSONB DEFAULT '{}'::jsonb,                     -- e.g. {"age_match": true, "gender_match": true, "clothing_overlap": ["blue jeans"]}
    
    -- Verification & Human-in-the-loop
    match_status match_status_enum NOT NULL DEFAULT 'pending_review',
    reviewed_by_official_id UUID REFERENCES profiles(user_id),
    reviewed_at TIMESTAMPTZ,
    dismissal_reason TEXT,
    
    matched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_matches_missing ON ai_matches(missing_id);
CREATE INDEX IF NOT EXISTS idx_ai_matches_status ON ai_matches(match_status);

-- -----------------------------------------------------------------------------
-- 6. CASE STATUS AUDIT TIMELINE (Table 14)
-- Real-time 5-stage progress tracking for Citizens & Law Enforcement
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_status_history (
    history_id SERIAL PRIMARY KEY,
    missing_id INT NOT NULL REFERENCES missing_person_reports(missing_id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,                               -- e.g., 'Report Submitted', 'Verified by Barangay'
    status case_status_enum NOT NULL,
    notes TEXT,
    updated_by_user_id UUID REFERENCES profiles(user_id),
    updated_by_role VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_history_missing ON case_status_history(missing_id);

-- -----------------------------------------------------------------------------
-- 7. NOTIFICATIONS (Table 15)
-- Push alerts and in-dashboard notifications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    notif_id SERIAL PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    recipient_role user_role_type NOT NULL,
    missing_id INT REFERENCES missing_person_reports(missing_id) ON DELETE CASCADE,
    match_id INT REFERENCES ai_matches(match_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notif_type VARCHAR(50) NOT NULL CHECK (notif_type IN ('match_alert', 'verification_update', 'status_change', 'inter_agency_alert')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notifications(recipient_id, is_read);

-- -----------------------------------------------------------------------------
-- 8. INTER-AGENCY ALERTS (Table 16)
-- Cross-barangay and CCPO station coordination
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inter_agency_alerts (
    alert_id SERIAL PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES profiles(user_id),
    target_brgy_id INT REFERENCES barangays(brgy_id),
    target_station VARCHAR(100),
    missing_id INT REFERENCES missing_person_reports(missing_id) ON DELETE CASCADE,
    alert_type VARCHAR(50) DEFAULT 'urgent_search' CHECK (alert_type IN ('urgent_search', 'possible_sighting', 'cross_jurisdiction_assist')),
    alert_message TEXT NOT NULL,
    alert_status VARCHAR(20) DEFAULT 'sent' CHECK (alert_status IN ('sent', 'acknowledged', 'resolved')),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. AUDIT LOG (Table 18)
-- System accountability & RA 10173 compliance
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,                                   -- e.g., 'VERIFY_REPORT', 'CONFIRM_MATCH'
    table_affected VARCHAR(100) NOT NULL,
    record_id VARCHAR(50),
    ip_address VARCHAR(50),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- -----------------------------------------------------------------------------
-- HELPER STORED FUNCTIONS (PostGIS Geolocation Queries - Objective 3)
-- -----------------------------------------------------------------------------

-- Automatically sync PostGIS geom point whenever lat/long is updated
CREATE OR REPLACE FUNCTION update_geom_point()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geom = ST_SetSRID(ST_Point(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_missing_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON missing_person_reports
FOR EACH ROW EXECUTE FUNCTION update_geom_point();

CREATE TRIGGER trg_found_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON found_person_reports
FOR EACH ROW EXECUTE FUNCTION update_geom_point();

-- Function: Find nearby cases within X meters (Objective 3)
CREATE OR REPLACE FUNCTION get_nearby_missing_cases(
    target_lat DECIMAL,
    target_lon DECIMAL,
    radius_meters INT DEFAULT 5000
)
RETURNS TABLE (
    missing_id INT,
    case_number VARCHAR,
    full_name TEXT,
    age INT,
    gender VARCHAR,
    last_seen_location TEXT,
    distance_meters FLOAT,
    status case_status_enum,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.missing_id,
        m.case_number,
        (m.first_name || ' ' || m.last_name)::TEXT as full_name,
        m.age,
        m.gender,
        m.last_seen_location,
        ST_Distance(
            m.geom::geography, 
            ST_SetSRID(ST_Point(target_lon, target_lat), 4326)::geography
        ) AS distance_meters,
        m.status,
        m.created_at
    FROM missing_person_reports m
    WHERE m.geom IS NOT NULL
      AND ST_DWithin(
            m.geom::geography, 
            ST_SetSRID(ST_Point(target_lon, target_lat), 4326)::geography, 
            radius_meters
          )
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

