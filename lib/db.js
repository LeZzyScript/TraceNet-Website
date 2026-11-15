import { supabase, isSupabaseConfigured } from "./supabase";

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

export async function getMissingReports(statusFilter = null) {
  if (!isSupabaseConfigured) {
    return [];
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
    return data || [];
  } catch (err) {
    console.warn("Error fetching missing reports:", err.message);
    return [];
  }
}

export async function getReportDetails(caseIdOrNumber) {
  if (!isSupabaseConfigured) {
    return null;
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
    console.warn("Error fetching report details:", err.message);
    return null;
  }
}

export async function getAIMatchForCase(missingId) {
  if (!isSupabaseConfigured) return null;

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
    return data || null;
  } catch (err) {
    console.warn("Error fetching AI match:", err.message);
    return null;
  }
}

export async function submitMissingReport(formData) {
  const caseNumber = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;

  if (!isSupabaseConfigured) {
    return { success: false, error: "Database is not configured." };
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

