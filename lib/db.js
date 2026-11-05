import { supabase, isSupabaseConfigured } from "./supabase";

// -----------------------------------------------------------------------------
// LOCAL FALLBACK DATA (For local demo mode when Supabase is not connected)
// -----------------------------------------------------------------------------
const FALLBACK_BARANGAYS = [
  { brgy_id: 1, brgy_name: "Labangon", brgy_district: "South District", latitude: 10.3080, longitude: 123.8750 },
  { brgy_id: 2, brgy_name: "Mabolo", brgy_district: "North District", latitude: 10.3210, longitude: 123.9210 },
  { brgy_id: 3, brgy_name: "Guadalupe", brgy_district: "South District", latitude: 10.3235, longitude: 123.8789 },
  { brgy_id: 4, brgy_name: "Lahug", brgy_district: "North District", latitude: 10.3340, longitude: 123.8980 },
  { brgy_id: 5, brgy_name: "Talamban", brgy_district: "North District", latitude: 10.3680, longitude: 123.9180 },
  { brgy_id: 6, brgy_name: "Basak San Nicolas", brgy_district: "South District", latitude: 10.2995, longitude: 123.8724 },
  { brgy_id: 7, brgy_name: "Pardo (Poblacion)", brgy_district: "South District", latitude: 10.2890, longitude: 123.8560 },
  { brgy_id: 8, brgy_name: "Apas", brgy_district: "North District", latitude: 10.3370, longitude: 123.9060 },
];

const FALLBACK_CASES = [
  {
    missing_id: 2038,
    case_number: "CASE-2038",
    first_name: "Maria",
    last_name: "Santos",
    full_name: "Maria Santos, 34",
    age: 34,
    gender: "Female",
    brgy_name: "Labangon",
    date_missing: "2026-06-28",
    last_seen_location: "Brgy. Labangon public market, Cebu City",
    clothing_description: "White blouse, blue jeans, wearing eyeglasses",
    status: "ai_matching_in_progress",
    status_label: "Active",
    ai_score: 87,
    timeline: [
      { title: "Report submitted", meta: "June 28, 9:14 AM", state: "done" },
      { title: "Verified by barangay", meta: "Brgy. Labangon — June 28, 11:02 AM", state: "done" },
      { title: "AI matching in progress", meta: "Scanning against 48 found reports", state: "active" },
      { title: "Forwarded to CCPO", meta: "Pending", state: "pending" },
      { title: "Case resolved", meta: "Pending", state: "pending" },
    ],
  },
  {
    missing_id: 2035,
    case_number: "CASE-2035",
    first_name: "Bert",
    last_name: "Navarro",
    full_name: "Bert Navarro, 44",
    age: 44,
    gender: "Male",
    brgy_name: "Guadalupe",
    date_missing: "2026-06-20",
    last_seen_location: "Guadalupe church vicinity",
    clothing_description: "Striped polo, khaki shorts",
    status: "resolved",
    status_label: "Resolved",
    ai_score: 91,
    timeline: [
      { title: "Report submitted", meta: "June 20, 2:30 PM", state: "done" },
      { title: "Verified by barangay", meta: "Brgy. Guadalupe", state: "done" },
      { title: "AI matching in progress", meta: "Completed", state: "done" },
      { title: "Forwarded to CCPO", meta: "Station 9", state: "done" },
      { title: "Case resolved", meta: "Reunited July 3", state: "done" },
    ],
  },
];

const FALLBACK_MATCH = {
  match_id: 101,
  missing_id: 2038,
  found_id: 5012,
  missing_name: "Maria Santos",
  missing_brgy: "Brgy. Labangon",
  found_name: "Unidentified F.",
  found_brgy: "Brgy. Mabolo",
  facial_similarity_score: 88.5,
  text_similarity_score: 85.2,
  overall_confidence_score: 87.0,
  checklist: [
    { label: "Age match", matched: true },
    { label: "Gender match", matched: true },
    { label: "Location proximity", matched: true },
    { label: "Clothing overlap (blue jeans, eyeglasses)", matched: true },
  ],
};

// -----------------------------------------------------------------------------
// DATABASE ACCESS METHODS
// -----------------------------------------------------------------------------

/**
 * Fetch list of Cebu City Barangays
 */
export async function getBarangays() {
  if (!isSupabaseConfigured) return FALLBACK_BARANGAYS;

  try {
    const { data, error } = await supabase
      .from("barangays")
      .select("brgy_id, brgy_name, brgy_district, latitude, longitude")
      .order("brgy_name");

    if (error) throw error;
    return data && data.length > 0 ? data : FALLBACK_BARANGAYS;
  } catch (err) {
    console.warn("Using fallback barangays:", err.message);
    return FALLBACK_BARANGAYS;
  }
}

/**
 * Fetch all missing person reports (or filtered by status)
 */
export async function getMissingReports(statusFilter = null) {
  if (!isSupabaseConfigured) {
    if (!statusFilter || statusFilter === "all") return FALLBACK_CASES;
    return FALLBACK_CASES.filter((c) =>
      statusFilter === "active" ? c.status !== "resolved" : c.status === "resolved"
    );
  }

  try {
    let query = supabase
      .from("missing_person_reports")
      .select(`
        missing_id,
        case_number,
        first_name,
        last_name,
        age,
        gender,
        date_missing,
        last_seen_location,
        clothing_description,
        status,
        created_at,
        barangays ( brgy_name, brgy_district )
      `)
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "active") {
        query = query.neq("status", "resolved");
      } else {
        query = query.eq("status", statusFilter);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Using fallback cases:", err.message);
    return FALLBACK_CASES;
  }
}

/**
 * Fetch single report by Case Number or ID with timeline
 */
export async function getReportDetails(caseIdOrNumber) {
  if (!isSupabaseConfigured) {
    return FALLBACK_CASES.find(
      (c) => c.case_number === caseIdOrNumber || c.missing_id === Number(caseIdOrNumber)
    ) || FALLBACK_CASES[0];
  }

  try {
    const isNum = !isNaN(Number(caseIdOrNumber));
    const column = isNum ? "missing_id" : "case_number";

    const { data, error } = await supabase
      .from("missing_person_reports")
      .select(`
        *,
        barangays ( brgy_name, brgy_district ),
        case_status_history ( stage_name, status, notes, created_at )
      `)
      .eq(column, caseIdOrNumber)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Error fetching report details, falling back:", err.message);
    return FALLBACK_CASES[0];
  }
}

/**
 * Fetch AI Match by Missing Report ID (Fulfills Objective 2)
 */
export async function getAIMatchForCase(missingId) {
  if (!isSupabaseConfigured) return FALLBACK_MATCH;

  try {
    const { data, error } = await supabase
      .from("ai_matches")
      .select(`
        match_id,
        facial_similarity_score,
        text_similarity_score,
        overall_confidence_score,
        matched_features,
        match_status,
        missing_person_reports ( first_name, last_name, barangays(brgy_name) ),
        found_person_reports ( estimated_age, gender, found_location, barangays(brgy_name) )
      `)
      .eq("missing_id", missingId)
      .single();

    if (error) throw error;
    return data || FALLBACK_MATCH;
  } catch (err) {
    console.warn("Using fallback AI match:", err.message);
    return FALLBACK_MATCH;
  }
}

/**
 * Submit a new missing person report
 */
export async function submitMissingReport(formData) {
  const caseNumber = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;

  if (!isSupabaseConfigured) {
    console.log("Mock submission success:", { caseNumber, ...formData });
    return { success: true, caseNumber };
  }

  try {
    const { data, error } = await supabase
      .from("missing_person_reports")
      .insert([
        {
          case_number: caseNumber,
          reporter_id: formData.reporterId || "a1b2c3d4-0001-4000-8000-000000000001",
          brgy_id: formData.brgyId || 1,
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: Number(formData.age),
          gender: formData.gender,
          date_missing: formData.dateMissing || new Date().toISOString().split("T")[0],
          relationship_to_reporter: formData.relationship || "Relative",
          last_seen_location: formData.lastSeenLocation,
          latitude: formData.latitude,
          longitude: formData.longitude,
          clothing_description: formData.clothingDescription,
          physical_description: formData.physicalDescription,
          status: "submitted",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Insert initial timeline event
    await supabase.from("case_status_history").insert([
      {
        missing_id: data.missing_id,
        stage_name: "Report submitted",
        status: "submitted",
        notes: `Report filed by ${formData.reporterName || "Family member"}`,
        updated_by_role: "Citizen",
      },
    ]);

    return { success: true, caseNumber, data };
  } catch (err) {
    console.error("Submission error:", err);
    return { success: false, error: err.message };
  }
}

