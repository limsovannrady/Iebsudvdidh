import { useState, useEffect, useCallback } from "react";
import { Users, MessageSquare, Activity, Search, RefreshCw, Bot } from "lucide-react";

interface BotUser {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  message_count: number;
  first_seen: string;
  last_seen: string;
}

interface StatsData {
  users: BotUser[];
  total: number;
  total_messages: number;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("km-KH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(first: string, last: string) {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

function Avatar({ first, last, username }: { first: string; last: string; username: string }) {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500",
    "bg-amber-500", "bg-cyan-500", "bg-fuchsia-500", "bg-teal-500",
  ];
  const idx = (username || first || "").charCodeAt(0) % colors.length;
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${colors[idx]}`}>
      {getInitials(first, last)}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setError("មិនអាចភ្ជាប់ API server បានទេ។ សូមប្រាកដថា server.py កំពុងដំណើរការ។");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = (data?.users ?? []).filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      String(u.user_id).includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-sidebar text-sidebar-foreground px-6 py-4 flex items-center gap-3 shadow">
        <div className="w-9 h-9 bg-sidebar-primary rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Bot User Dashboard</h1>
          <p className="text-xs text-sidebar-foreground/60">ពិនិត្យមើលអ្នកប្រើប្រាស់ Telegram Bot</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="ml-auto flex items-center gap-2 bg-sidebar-accent text-sidebar-accent-foreground px-3 py-1.5 rounded-lg text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">កំពុងទាញទិន្នន័យ...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <button
              onClick={() => fetchData()}
              className="mt-3 text-sm text-primary underline"
            >
              ព្យាយាមម្ដងទៀត
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={Users} label="អ្នកប្រើប្រាស់សរុប" value={data?.total ?? 0} color="bg-blue-500" />
              <StatCard icon={MessageSquare} label="សារសរុប" value={data?.total_messages ?? 0} color="bg-emerald-500" />
              <StatCard icon={Activity} label="ផ្ទុកបានចុងក្រោយ" value={new Date().toLocaleTimeString("km-KH")} color="bg-violet-500" />
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ស្វែងរក username, ឈ្មោះ, ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  />
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {filtered.length} នាក់
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground text-sm">
                    {data?.total === 0
                      ? "មិនមានអ្នកប្រើប្រាស់នៅឡើយ។ ចាប់ផ្ដើម bot ហើយផ្ញើ /start!"
                      : "រកមិនឃើញអ្នកប្រើប្រាស់ដែលស្វែងរក"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">អ្នកប្រើប្រាស់</th>
                        <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Username</th>
                        <th className="text-left px-4 py-3 font-medium hidden md:table-cell">User ID</th>
                        <th className="text-center px-4 py-3 font-medium">សារ</th>
                        <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">ចូលចុងក្រោយ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((user) => (
                        <tr key={user.user_id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar first={user.first_name} last={user.last_name} username={user.username} />
                              <div>
                                <p className="font-medium text-foreground">
                                  {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                                </p>
                                <p className="text-xs text-muted-foreground sm:hidden">
                                  {user.username ? `@${user.username}` : "គ្មាន username"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                            {user.username ? (
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-mono">
                                @{user.username}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50 italic text-xs">គ្មាន</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="font-mono text-xs text-muted-foreground">{user.user_id}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              <MessageSquare className="w-3 h-3" />
                              {user.message_count}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                            {formatDate(user.last_seen)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
