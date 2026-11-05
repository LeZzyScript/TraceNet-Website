"use client";

import { useState } from "react";
import AdminShell from "@/components/AdminShell";

// Exact 7 rows from Figure 28 (p. 91) of TraceNet Capstone II Manuscript FINAL.pdf
const initialUsers = [
  { id: 1, initials: "JD", name: "Juan dela Cruz", email: "juan@email.com", role: "Citizen", status: "Active", joined: "Jun 15" },
  { id: 2, initials: "MR", name: "Ofcr. Maria Reyes", email: "m.reyes@ccpo.gov", role: "CCPO", status: "Active", joined: "Jun 10" },
  { id: 3, initials: "JS", name: "Bgy. Jose Santos", email: "jose@labangon.gov", role: "Barangay", status: "Active", joined: "May 28" },
  { id: 4, initials: "AC", name: "Ana Cruz", email: "ana@email.com", role: "Citizen", status: "Suspended", joined: "Jun 20" },
  { id: 5, initials: "PT", name: "Pedro Tan", email: "pedro@email.com", role: "Citizen", status: "Active", joined: "Jun 22" },
  { id: 6, initials: "RF", name: "Adm. Rosa Flores", email: "rosa@admin.gov", role: "Admin", status: "Active", joined: "Jun 5" },
  { id: 7, initials: "UU", name: "Unverified User", email: "new@email.com", role: "Citizen", status: "Pending", joined: "Jun 29" },
];

// Pending Official Approvals from Figure 33.3 (p. 98)
const initialApprovals = [
  {
    id: "APP-01",
    name: "Capt. Roberto Gomez",
    email: "r.gomez@talamban.gov.ph",
    role: "Barangay Official",
    jurisdiction: "Brgy. Talamban",
    submitted: "Jun 29, 2025",
    status: "Pending",
  },
  {
    id: "APP-02",
    name: "PO3 Mark Villanueva",
    email: "m.villanueva@ccpo.gov.ph",
    role: "CCPO Investigator",
    jurisdiction: "CCPO Station 4 (Mabolo)",
    submitted: "Jun 29, 2025",
    status: "Pending",
  },
  {
    id: "APP-03",
    name: "Sec. Lorna Bautista",
    email: "l.bautista@pardo.gov.ph",
    role: "Barangay Official",
    jurisdiction: "Brgy. Pardo",
    submitted: "Jun 28, 2025",
    status: "Pending",
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("users");
  const [selectedUser, setSelectedUser] = useState(initialUsers[0]);
  const [suspendReason, setSuspendReason] = useState("Repeated false / duplicate report submissions");
  const [settings, setSettings] = useState({
    notificationAlerts: true,
    aiMatchAutoReview: true,
    mandatoryAccountApproval: true,
  });
  const [toast, setToast] = useState("");

  function showNotification(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  function handleOpenEdit(user) {
    setSelectedUser(user);
    setActiveView("edit-account");
  }

  function handleToggleBlock(user) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === user.id) {
          const next = u.status === "Suspended" ? "Active" : "Suspended";
          showNotification(`Account ${u.name} status updated to ${next}.`);
          return { ...u, status: next };
        }
        return u;
      })
    );
  }

  function handleApproveOfficial(id, decision) {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: decision } : a))
    );
    showNotification(`Official application ${id} marked as ${decision}.`);
  }

  return (
    <AdminShell
      title={
        activeView === "users"
          ? "Admin Panel — User Management"
          : activeView === "dashboard"
          ? "Admin Command Dashboard"
          : activeView === "approvals"
          ? "Account Approvals"
          : activeView === "edit-account"
          ? `Manage Account — ${selectedUser.name}`
          : activeView === "settings"
          ? "Reports, Analytics & System Settings"
          : "Admin Profile Management"
      }
      activeTab={activeView === "edit-account" ? "users" : activeView}
      onSelectTab={(tabId) => setActiveView(tabId)}
    >
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0B2240] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-[#1967D2]">
          ✓ {toast}
        </div>
      )}

      {/* Storyboard Screen Selector Bar (Figure 28 & Figure 33.1–33.6 p. 98) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 mb-6 flex flex-wrap items-center gap-1.5 shadow-xs">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
          Storyboard View:
        </span>
        {[
          { id: "users", label: "1. User Management (Fig 28)" },
          { id: "dashboard", label: "2. Command Dashboard (Fig 33.2)" },
          { id: "approvals", label: "3. Approvals (Fig 33.3)" },
          { id: "edit-account", label: "4. Edit / Suspend (Fig 33.6)" },
          { id: "settings", label: "5. Analytics & Settings (Fig 33.5)" },
          { id: "profile", label: "6. My Profile (Fig 33.4)" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeView === item.id
                ? "bg-[#0B2240] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: FIGURE 28 (p. 91) — ADMIN PANEL — USER MANAGEMENT */}
      {activeView === "users" && (
        <>
          {/* 4 Tinted Metric Cards matching Figure 28 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Total Users</span>
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#1967D2] flex items-center justify-center text-sm">
                  👥
                </span>
              </div>
              <div className="text-3xl font-head font-extrabold text-[#1967D2]">1,247</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Registered citizens &amp; officials
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Active</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
                  ✓
                </span>
              </div>
              <div className="text-3xl font-head font-extrabold text-emerald-600">1,185</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                95.0% platform compliance
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Suspended</span>
                <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-sm">
                  🚫
                </span>
              </div>
              <div className="text-3xl font-head font-extrabold text-rose-600">62</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Policy &amp; false-report blocks
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Pending</span>
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm">
                  ⏳
                </span>
              </div>
              <div className="text-3xl font-head font-extrabold text-amber-600">8</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Awaiting credential check
              </div>
            </div>
          </div>

          {/* Filter Bar matching Figure 28 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none focus:border-[#1967D2]"
              >
                <option value="All">Role: All ▾</option>
                <option value="Citizen">Role: Citizen</option>
                <option value="CCPO">Role: CCPO</option>
                <option value="Barangay">Role: Barangay</option>
                <option value="Admin">Role: Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none focus:border-[#1967D2]"
              >
                <option value="All">Status: All ▾</option>
                <option value="Active">Status: Active</option>
                <option value="Suspended">Status: Suspended</option>
                <option value="Pending">Status: Pending</option>
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name / email..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1967D2]"
              />
            </div>
          </div>

          {/* User Table matching Figure 28 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B2240] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-5">Name</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Joined</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {filtered.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={`${
                        idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                      } hover:bg-blue-50/40 transition-colors`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-[11px] text-[#0B2240] shrink-0">
                            {u.initials}
                          </div>
                          <span className="font-bold text-[#0B2240]">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-500">{u.email}</td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {u.status === "Active" && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            ● Active
                          </span>
                        )}
                        {u.status === "Suspended" && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            ● Suspended
                          </span>
                        )}
                        {u.status === "Pending" && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            ● Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-medium">{u.joined}</td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="text-xs font-bold text-[#1967D2] hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300 mx-2">|</span>
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`text-xs font-bold hover:underline cursor-pointer ${
                            u.status === "Suspended" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {u.status === "Suspended" ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: FIGURE 33.2 (p. 98) — ADMIN COMMAND DASHBOARD */}
      {activeView === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Total Registered Users</div>
              <div className="text-3xl font-head font-extrabold text-[#1967D2] mt-2">1,247</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">▲ +34 this week</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Pending Approvals</div>
              <div className="text-3xl font-head font-extrabold text-amber-600 mt-2">8</div>
              <div className="text-[11px] text-amber-600 font-bold mt-2">Barangay &amp; CCPO</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Active Missing Cases</div>
              <div className="text-3xl font-head font-extrabold text-rose-600 mt-2">48</div>
              <div className="text-[11px] text-slate-500 font-bold mt-2">Across 23 Barangays</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">System Uptime</div>
              <div className="text-3xl font-head font-extrabold text-emerald-600 mt-2">99.8%</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">AI &amp; GIS Online</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#0B2240] mb-4">
              Recent Audit Log Entries (RA 10173 Compliance)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-800">
                  Adm. Rosa Flores approved Brgy. Labangon Official Jose Santos
                </span>
                <span className="text-slate-400 font-mono">10 mins ago</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-800">
                  Ofcr. Maria Reyes confirmed AI Match (87%) on Case #2038
                </span>
                <span className="text-slate-400 font-mono">1 hr ago</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-800">
                  Account Ana Cruz suspended (Reason: False report violation)
                </span>
                <span className="text-slate-400 font-mono">Yesterday</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FIGURE 33.3 (p. 98) — ACCOUNT APPROVALS */}
      {activeView === "approvals" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-head font-extrabold text-[#0B2240]">
                Pending Official Account Registrations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify Barangay &amp; CCPO credentials before granting portal access
              </p>
            </div>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3.5 py-1 rounded-full w-fit">
              {approvals.filter((a) => a.status === "Pending").length} Pending Review
            </span>
          </div>

          <div className="space-y-3">
            {approvals.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70"
              >
                <div>
                  <div className="font-bold text-sm text-[#0B2240]">
                    {app.name}{" "}
                    <span className="text-slate-400 font-mono text-xs font-normal">
                      ({app.email})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Role: <span className="font-bold text-slate-700">{app.role}</span> · Jurisdiction:{" "}
                    <span className="font-bold text-slate-700">{app.jurisdiction}</span> · Submitted:{" "}
                    {app.submitted}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {app.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => handleApproveOfficial(app.id, "Approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleApproveOfficial(app.id, "Rejected")}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                      >
                        ✕ Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {app.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: FIGURE 33.6 (p. 98) — EDIT / SUSPEND ACCOUNT */}
      {activeView === "edit-account" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 max-w-xl space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-head font-extrabold text-[#0B2240]">
                Manage Account — {selectedUser.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedUser.email}</p>
            </div>
            <span className="bg-blue-50 text-[#1967D2] border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
              {selectedUser.role}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1967D2]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Assigned Role</label>
              <select
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1967D2]"
              >
                <option value="Citizen">Citizen</option>
                <option value="Barangay">Barangay</option>
                <option value="CCPO">CCPO</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Suspension / Action Reason (Logged in Audit Trail)
            </label>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1967D2]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setUsers((prev) =>
                  prev.map((u) => (u.id === selectedUser.id ? selectedUser : u))
                );
                setActiveView("users");
                showNotification(`Account changes saved for ${selectedUser.name}.`);
              }}
              className="bg-[#1967D2] hover:bg-[#1557B0] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                handleToggleBlock(selectedUser);
                setActiveView("users");
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
            >
              Suspend Account
            </button>
            <button
              onClick={() => setActiveView("users")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* VIEW 5: FIGURE 33.5 (p. 98) — REPORTS, ANALYTICS & SYSTEM SETTINGS */}
      {activeView === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-head font-extrabold text-[#0B2240]">
              System Configuration Toggles
            </h3>
            {[
              {
                key: "notificationAlerts",
                label: "Notification Alerts (FCM & SMS)",
                desc: "Broadcast real-time geo-targeted missing person alerts",
              },
              {
                key: "aiMatchAutoReview",
                label: "AI Match Confidence Auto-Review (80/20 Pipeline)",
                desc: "Flag matches >= 70% similarity for immediate official verification",
              },
              {
                key: "mandatoryAccountApproval",
                label: "Mandatory Official Account Approval",
                desc: "Require admin verification before Barangay/CCPO portal access",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                </div>
                <button
                  onClick={() =>
                    setSettings((s) => ({ ...s, [item.key]: !s[item.key] }))
                  }
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold cursor-pointer shrink-0 transition-colors ${
                    settings[item.key]
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {settings[item.key] ? "ENABLED" : "DISABLED"}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-head font-extrabold text-[#0B2240]">
              Platform Analytics Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center pt-2">
              <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl p-4">
                <div className="text-2xl font-head font-extrabold text-[#1967D2]">142</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Monthly Report Volume</div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4">
                <div className="text-2xl font-head font-extrabold text-emerald-600">84.2%</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Case Resolution Rate</div>
              </div>
              <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4">
                <div className="text-2xl font-head font-extrabold text-amber-600">18m</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Avg. Verification Time</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: FIGURE 33.4 (p. 98) — ADMIN PROFILE MANAGEMENT */}
      {activeView === "profile" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 max-w-md space-y-5 shadow-xs">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-[#0B2240] text-white flex items-center justify-center font-extrabold text-base">
              RF
            </div>
            <div>
              <div className="font-head font-extrabold text-base text-[#0B2240]">
                Adm. Rosa Flores
              </div>
              <div className="text-xs text-slate-400">rosa@admin.gov · System Administrator</div>
            </div>
          </div>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Admin Email</label>
              <input
                type="text"
                defaultValue="rosa@admin.gov"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <button
              onClick={() => showNotification("Admin profile and password updated.")}
              className="w-full bg-[#1967D2] hover:bg-[#1557B0] text-white font-bold py-3 rounded-xl shadow-xs cursor-pointer"
            >
              Update Admin Profile
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
