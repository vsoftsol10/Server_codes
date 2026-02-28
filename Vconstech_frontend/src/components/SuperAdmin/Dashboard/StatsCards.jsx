import React, { useState } from "react";
import { UserCheck, UserX, Users, Package, ChevronDown, ChevronUp } from "lucide-react";

// ─── StatCard (unchanged) ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, subtitle, value, accentColor, bgAccent }) => (
  <div
    className="relative bg-white rounded-2xl p-6 flex flex-col min-w-0 flex-1 overflow-hidden group cursor-pointer"
    style={{
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.07)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.07)";
    }}
  >
    <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: accentColor }} />
    <div className="pl-3 flex flex-col gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bgAccent }}>
        <Icon size={18} style={{ color: accentColor }} strokeWidth={2.2} />
      </div>
      <div>
        <span className="text-3xl font-extrabold leading-none tabular-nums" style={{ color: accentColor }}>
          {value}
        </span>
        <div className="mt-2">
          <p className="text-gray-700 text-sm font-semibold leading-tight">{title}</p>
          <p className="text-xs mt-0.5 font-medium uppercase tracking-widest" style={{ color: accentColor + "99" }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ─── Package Breakdown Table ──────────────────────────────────────────────────
const PACKAGE_CONFIG = [
  {
    key:        "Basic",
    label:      "Basic",
    members:    "5 members",
    accentColor: "#2563eb",
    bgAccent:   "#eff6ff",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    key:        "Premium",
    label:      "Premium",
    members:    "10 members",
    accentColor: "#7c3aed",
    bgAccent:   "#f5f3ff",
    badgeClass: "bg-purple-100 text-purple-700",
  },
  {
    key:        "Advanced",
    label:      "Advanced",
    members:    "Custom members",
    accentColor: "#059669",
    bgAccent:   "#ecfdf5",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
];

const PackageBreakdownTable = ({ users = [] }) => {
  const [isOpen, setIsOpen] = useState(true);

  const packageStats = PACKAGE_CONFIG.map((pkg) => {
    const pkgUsers = users.filter((u) => u.package === pkg.key);
    const active   = pkgUsers.filter((u) => u.isActive === true).length;
    return { ...pkg, total: pkgUsers.length, active, inactive: pkgUsers.length - active };
  });

  const grandTotal    = users.length;
  const grandActive   = users.filter((u) => u.isActive === true).length;
  const grandInactive = grandTotal - grandActive;

  return (
    <div
      className="w-[80%] bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.07)" }}
    >
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ffbe2a]/20 flex items-center justify-center">
            <Package size={17} className="text-[#b88a00]" strokeWidth={2.2} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-800 leading-tight">Users by Package</p>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-0.5">
              Breakdown across all plans
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
            {grandTotal} total
          </span>
          {isOpen
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />
          }
        </div>
      </button>

      {/* Collapsible Table */}
      {isOpen && (
        <div className="px-6 pb-5">
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Package</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Capacity</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Active</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Inactive</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {packageStats.map((pkg, i) => {
                  const pct = grandTotal > 0 ? Math.round((pkg.total / grandTotal) * 100) : 0;
                  return (
                    <tr
                      key={pkg.key}
                      className={`transition-colors hover:bg-gray-50/70 ${i < packageStats.length - 1 ? "border-b border-gray-50" : ""}`}
                    >
                      {/* Package */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pkg.accentColor }} />
                          <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold ${pkg.badgeClass}`}>
                            {pkg.label}
                          </span>
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500 font-medium">{pkg.members}</span>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-base font-extrabold tabular-nums" style={{ color: pkg.accentColor }}>
                          {pkg.total}
                        </span>
                      </td>

                      {/* Active */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          {pkg.active}
                        </span>
                      </td>

                      {/* Inactive */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                          {pkg.inactive}
                        </span>
                      </td>

                      {/* Distribution bar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: pkg.accentColor }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-500 w-8 text-right tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals row */}
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-3 font-bold text-gray-700 text-xs uppercase tracking-wider" colSpan={2}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-base font-extrabold text-gray-800 tabular-nums">{grandTotal}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      {grandActive}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      {grandInactive}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-gray-400">100%</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── StatsCards (unchanged) ───────────────────────────────────────────────────
const StatsCards = ({ users = [] }) => {
  const totalUsers    = users.length;
  const activeUsers   = users.filter((u) => u.isActive === true).length;
  const inactiveUsers = totalUsers - activeUsers;

  const cards = [
    {
      icon:        UserCheck,
      value:       activeUsers,
      title:       "Active Users",
      subtitle:    "Currently Active",
      accentColor: "#16a34a",
      bgAccent:    "#f0fdf4",
    },
    {
      icon:        UserX,
      value:       inactiveUsers,
      title:       "Inactive Users",
      subtitle:    "Currently Inactive",
      accentColor: "#dc2626",
      bgAccent:    "#fef2f2",
    },
    {
      icon:        Users,
      value:       totalUsers,
      title:       "Total Users",
      subtitle:    "All Registered",
      accentColor: "#2563eb",
      bgAccent:    "#eff6ff",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Original 3 stat cards — completely untouched */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-[80%]">
        {cards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* NEW: Package breakdown table rendered below */}
      <PackageBreakdownTable users={users} />
    </div>
  );
};

export default StatsCards;