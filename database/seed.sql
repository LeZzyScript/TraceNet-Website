-- =============================================================================
-- TRACENET SEED DATA
-- Includes:
--   1. 80 Barangays of Cebu City (North & South District with coordinates)
--   2. Demo user accounts (Citizen, Barangay Official, CCPO Officer, Admin)
--   3. Demo Missing & Found Reports (Maria Santos Case #2038, Bert Navarro #2035)
--   4. AI Match Record with Dual Scores (Objective 2 demonstration)
--   5. Case Timeline Stages (Objective 1 & 3 demonstration)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. INSERT CEBU CITY BARANGAYS (80 Total)
-- -----------------------------------------------------------------------------
INSERT INTO barangays (brgy_name, brgy_district, latitude, longitude) VALUES
-- South District (46 Barangays)
('Babag', 'South District', 10.3167, 123.8333),
('Basak Pardo', 'South District', 10.2931, 123.8647),
('Basak San Nicolas', 'South District', 10.2995, 123.8724),
('Bocana', 'South District', 10.2833, 123.8500),
('Bonbon', 'South District', 10.3333, 123.8167),
('Buot-Taup', 'South District', 10.2667, 123.8167),
('Calamba', 'South District', 10.3090, 123.8820),
('Cogon Pardo', 'South District', 10.2882, 123.8580),
('Duljo Fatima', 'South District', 10.2990, 123.8850),
('Guadalupe', 'South District', 10.3235, 123.8789),
('Inayawan', 'South District', 10.2785, 123.8570),
('Kalunasan', 'South District', 10.3260, 123.8710),
('Kinasang-an', 'South District', 10.2850, 123.8610),
('Labangon', 'South District', 10.3080, 123.8750),
('Mambaling', 'South District', 10.2925, 123.8760),
('Pahina San Nicolas', 'South District', 10.3015, 123.8885),
('Pamutan', 'South District', 10.3000, 123.7833),
('Pardo (Poblacion)', 'South District', 10.2890, 123.8560),
('Pasil', 'South District', 10.2950, 123.8920),
('Punta Princesa', 'South District', 10.3010, 123.8680),
('Quiot', 'South District', 10.2940, 123.8590),
('San Nicolas Proper', 'South District', 10.2980, 123.8900),
('Sapangdaku', 'South District', 10.3300, 123.8500),
('Sawang Calero', 'South District', 10.2960, 123.8890),
('Sinsin', 'South District', 10.2833, 123.7667),
('Suba', 'South District', 10.2940, 123.8940),
('Sudlon I', 'South District', 10.3500, 123.7833),
('Sudlon II', 'South District', 10.3667, 123.7667),
('Tabunan', 'South District', 10.3833, 123.7833),
('Tagbao', 'South District', 10.3500, 123.8167),
('Tisa', 'South District', 10.3030, 123.8640),
('Toong', 'South District', 10.2833, 123.8333),

-- North District (34 Barangays)
('Adlaon', 'North District', 10.4333, 123.8833),
('Agsungot', 'North District', 10.4167, 123.9000),
('Apas', 'North District', 10.3370, 123.9060),
('Bacayan', 'North District', 10.3750, 123.9160),
('Banilad', 'North District', 10.3410, 123.9120),
('Binaliw', 'North District', 10.4000, 123.9167),
('Budlaan', 'North District', 10.3833, 123.9000),
('Busay', 'North District', 10.3580, 123.8750),
('Cambinocot', 'North District', 10.4500, 123.9167),
('Capitol Site', 'North District', 10.3175, 123.8910),
('Carreta', 'North District', 10.3130, 123.9100),
('Cogon Ramos', 'North District', 10.3120, 123.8960),
('Day-as', 'North District', 10.3050, 123.9020),
('Ermita', 'North District', 10.2930, 123.9000),
('Guba', 'North District', 10.4333, 123.9000),
('Hipodromo', 'North District', 10.3180, 123.9110),
('Kamagayan', 'North District', 10.3020, 123.8990),
('Kamputhaw (Camputhaw)', 'North District', 10.3200, 123.8970),
('Kasambagan', 'North District', 10.3270, 123.9150),
('Lahug', 'North District', 10.3340, 123.8980),
('Lorega San Miguel', 'North District', 10.3080, 123.9040),
('Lusaran', 'North District', 10.4667, 123.8667),
('Luz', 'North District', 10.3220, 123.9090),
('Mabini', 'North District', 10.4167, 123.8667),
('Mabolo', 'North District', 10.3210, 123.9210),
('Malubog', 'North District', 10.3833, 123.8500),
('Pahina Central', 'North District', 10.3000, 123.8950),
('Parian', 'North District', 10.3010, 123.9030),
('Paril', 'North District', 10.4500, 123.8833),
('Pit-os', 'North District', 10.3950, 123.9200),
('Pulangbato', 'North District', 10.3850, 123.9250),
('Sambag I', 'North District', 10.3090, 123.8900),
('Sambag II', 'North District', 10.3120, 123.8870),
('San Antonio', 'North District', 10.3030, 123.8970),
('San Jose', 'North District', 10.3600, 123.9100),
('San Roque', 'North District', 10.2970, 123.9050),
('Santa Cruz', 'North District', 10.3080, 123.8980),
('Santo Niño', 'North District', 10.2950, 123.9020),
('Sirao', 'North District', 10.4167, 123.8333),
('T. Padilla', 'North District', 10.3040, 123.9060),
('Talamban', 'North District', 10.3680, 123.9180),
('Taptap', 'North District', 10.4000, 123.8167),
('Tejero', 'North District', 10.3030, 123.9110),
('Tinago', 'North District', 10.3000, 123.9080),
('Zapatera', 'North District', 10.3100, 123.9020)
ON CONFLICT (brgy_name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. INSERT DEMO PROFILES (4 Main Roles)
-- -----------------------------------------------------------------------------
-- Demo Citizen: Juan dela Cruz
INSERT INTO profiles (user_id, email, first_name, last_name, phone_number, role, account_status, brgy_id)
VALUES (
    'a1b2c3d4-0001-4000-8000-000000000001',
    'juan@example.com',
    'Juan',
    'dela Cruz',
    '0917-123-4567',
    'citizen',
    'active',
    (SELECT brgy_id FROM barangays WHERE brgy_name = 'Labangon' LIMIT 1)
) ON CONFLICT (email) DO NOTHING;

-- Demo Barangay Official: Brgy. Labangon Desk
INSERT INTO profiles (user_id, email, first_name, last_name, phone_number, role, account_status, brgy_id, position)
VALUES (
    'a1b2c3d4-0002-4000-8000-000000000002',
    'official@labangon.cebu.gov.ph',
    'Roberto',
    'Alcantara',
    '0918-987-6543',
    'barangay_official',
    'active',
    (SELECT brgy_id FROM barangays WHERE brgy_name = 'Labangon' LIMIT 1),
    'Chief Tanod / Intake Officer'
) ON CONFLICT (email) DO NOTHING;

-- Demo CCPO Officer: Station 10 / CCPO Command
INSERT INTO profiles (user_id, email, first_name, last_name, phone_number, role, account_status, ccpo_rank, ccpo_station, badge_number)
VALUES (
    'a1b2c3d4-0003-4000-8000-000000000003',
    'ccpo@cebu.gov.ph',
    'Alexander',
    'Reyes',
    '0920-555-1234',
    'ccpo_officer',
    'active',
    'Police Captain',
    'CCPO Station 10 (Punta Princesa / Labangon)',
    'CCPO-2024-884'
) ON CONFLICT (email) DO NOTHING;

-- Demo System Admin
INSERT INTO profiles (user_id, email, first_name, last_name, phone_number, role, account_status)
VALUES (
    'a1b2c3d4-0004-4000-8000-000000000004',
    'admin@tracenet.ph',
    'TraceNet',
    'Administrator',
    '0999-000-1111',
    'admin',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. INSERT DEMO MISSING & FOUND PERSON REPORTS
-- -----------------------------------------------------------------------------
-- Case #2038: Maria Santos
INSERT INTO missing_person_reports (
    missing_id,
    case_number,
    reporter_id,
    brgy_id,
    first_name,
    last_name,
    age,
    gender,
    date_missing,
    relationship_to_reporter,
    last_seen_location,
    latitude,
    longitude,
    clothing_description,
    physical_description,
    circumstances,
    status,
    verified_by_official_id,
    verified_at
) VALUES (
    2038,
    'CASE-2038',
    'a1b2c3d4-0001-4000-8000-000000000001',
    (SELECT brgy_id FROM barangays WHERE brgy_name = 'Labangon' LIMIT 1),
    'Maria',
    'Santos',
    34,
    'Female',
    CURRENT_DATE - INTERVAL '2 days',
    'Son / Family Member',
    'Brgy. Labangon public market, Cebu City',
    10.3080,
    123.8750,
    'White blouse, blue denim jeans, wearing black-frame eyeglasses',
    '5 ft 2 in, medium build, straight black shoulder-length hair',
    'Went to the Labangon public market in the morning and did not return home.',
    'ai_matching_in_progress',
    'a1b2c3d4-0002-4000-8000-000000000002',
    NOW() - INTERVAL '4 hours'
) ON CONFLICT (case_number) DO NOTHING;

-- Case #2035: Bert Navarro (Resolved)
INSERT INTO missing_person_reports (
    missing_id,
    case_number,
    reporter_id,
    brgy_id,
    first_name,
    last_name,
    age,
    gender,
    date_missing,
    relationship_to_reporter,
    last_seen_location,
    latitude,
    longitude,
    clothing_description,
    status
) VALUES (
    2035,
    'CASE-2035',
    'a1b2c3d4-0001-4000-8000-000000000001',
    (SELECT brgy_id FROM barangays WHERE brgy_name = 'Guadalupe' LIMIT 1),
    'Bert',
    'Navarro',
    44,
    'Male',
    CURRENT_DATE - INTERVAL '10 days',
    'Brother',
    'Guadalupe church vicinity',
    10.3235,
    123.8789,
    'Striped polo, khaki shorts',
    'resolved'
) ON CONFLICT (case_number) DO NOTHING;

-- Found Person Report: Unidentified F. in Mabolo
INSERT INTO found_person_reports (
    found_id,
    found_case_number,
    reporter_id,
    brgy_id,
    estimated_age,
    gender,
    description,
    clothing_description,
    condition_notes,
    current_shelter_location,
    found_location,
    latitude,
    longitude,
    status
) VALUES (
    5012,
    'FOUND-5012',
    'a1b2c3d4-0002-4000-8000-000000000002',
    (SELECT brgy_id FROM barangays WHERE brgy_name = 'Mabolo' LIMIT 1),
    'Appears mid-30s',
    'Female',
    'Female individual found resting near Mabolo plaza, mildly disoriented.',
    'Wearing light colored top and dark jeans with eyeglasses',
    'Mildly disoriented, speaks softly, unable to recall full residential address.',
    'Brgy. Mabolo hall evacuation center',
    'Near Mabolo Barangay Hall, Juan Luna Ave',
    10.3210,
    123.9210,
    'potential_match'
) ON CONFLICT (found_case_number) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. INSERT AI DUAL-SCORE MATCH (Demonstrates Objective 2)
-- -----------------------------------------------------------------------------
INSERT INTO ai_matches (
    match_id,
    missing_id,
    found_id,
    facial_similarity_score,
    text_similarity_score,
    overall_confidence_score,
    matched_features,
    match_status
) VALUES (
    101,
    2038,
    5012,
    88.50,  -- Facial similarity score
    85.20,  -- Text description similarity score
    87.00,  -- Combined weighted score
    '{
        "age_match": true,
        "gender_match": true,
        "location_proximity": true,
        "clothing_overlap": ["eyeglasses", "blue jeans", "light top"],
        "distance_km": 5.4
    }'::jsonb,
    'pending_review'
) ON CONFLICT (match_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. INSERT CASE STATUS TIMELINE (Demonstrates 5-stage tracking)
-- -----------------------------------------------------------------------------
INSERT INTO case_status_history (missing_id, stage_name, status, notes, updated_by_role)
VALUES
(2038, 'Report Submitted', 'submitted', 'Report filed online by family member Juan dela Cruz', 'Citizen'),
(2038, 'Verified by Barangay', 'verified_by_barangay', 'Details and reporter identity verified by Brgy. Labangon Tanod Desk', 'Barangay Official'),
(2038, 'AI Matching In Progress', 'ai_matching_in_progress', 'Scanning against 48 active found person reports across Cebu City', 'AI System');

-- -----------------------------------------------------------------------------
-- 6. INSERT DEMO NOTIFICATIONS
-- -----------------------------------------------------------------------------
INSERT INTO notifications (recipient_id, recipient_role, missing_id, match_id, title, message, notif_type)
VALUES
(
    'a1b2c3d4-0001-4000-8000-000000000001',
    'citizen',
    2038,
    101,
    '1 potential match found',
    'Case #2038 (Maria Santos) matched with a found person report in Brgy. Mabolo with 87% confidence.',
    'match_alert'
),
(
    'a1b2c3d4-0001-4000-8000-000000000001',
    'citizen',
    2038,
    NULL,
    'Your report has been verified',
    'Brgy. Labangon has reviewed and verified your missing person report.',
    'verification_update'
);

