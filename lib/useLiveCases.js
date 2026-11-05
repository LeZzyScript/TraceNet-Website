"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { subscribeMatches, subscribeReports } from "@/lib/liveData";
import { bestMatchByReport } from "@/lib/reportMapper";

/**
 * Live Firestore data for a portal.
 *
 * `live` is true only when Firebase is configured AND a signed-in account has
 * one of `allowedRoles`. Otherwise the page keeps using its built-in demo data
 * (so the manuscript screens always render). Never fabricates live data.
 */
const DEFAULT_ROLES = ["citizen", "barangay", "ccpo", "admin"];

export function useLiveCases(allowedRoles = DEFAULT_ROLES) {
  const { configured, loading: authLoading, user, role } = useAuth();
  const [reports, setReports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [dataReady, setDataReady] = useState({ reports: false, matches: false });
  const [error, setError] = useState(null);

  const roles = Array.isArray(allowedRoles) && allowedRoles.length ? allowedRoles : DEFAULT_ROLES;
  const roleKey = roles.join("|");
  const live = Boolean(configured && user && (!role || roles.includes(role)));

  useEffect(() => {
    if (!live) {
      setReports([]);
      setMatches([]);
      setDataReady({ reports: false, matches: false });
      setError(null);
      return undefined;
    }

    const onError = (e) =>
      setError(
        e?.code === "permission-denied"
          ? "Firestore denied access. Check the security rules for this account."
          : "Could not load live data."
      );

    const unsubReports = subscribeReports((rows) => {
      setReports(rows);
      setDataReady((s) => ({ ...s, reports: true }));
      setError(null);
    }, onError);
    const unsubMatches = subscribeMatches((rows) => {
      setMatches(rows);
      setDataReady((s) => ({ ...s, matches: true }));
    }, onError);

    return () => {
      unsubReports();
      unsubMatches();
    };
    // roleKey instead of the array identity so callers can pass literals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, user?.uid, roleKey]);

  const matchByReport = useMemo(() => bestMatchByReport(matches), [matches]);
  const missingReports = useMemo(
    () => reports.filter((r) => r.type === "missing"),
    [reports]
  );

  return {
    configured,
    authLoading,
    live,
    loading: live && !(dataReady.reports && dataReady.matches) && !error,
    error,
    user,
    role,
    reports: missingReports,
    allReports: reports,
    matches,
    matchByReport,
    bestByReport: matchByReport,
  };
}

