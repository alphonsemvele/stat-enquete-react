import { Head, Link } from '@inertiajs/react';
import AdminLayout from './layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    stats: {
        total_users: number; users_actifs: number; admins: number; nouveaux_users: number;
        total_enquetes: number; enquetes_actives: number;
        total_reponses: number; reponses_today: number;
        total_contacts: number; total_invitations: number;
    };
    chart: { labels: string[]; reponses: number[]; users: number[] };
    top_users: Array<{ id: number; name: string; email: string; role: string; forms_count: number; created_at: string; is_blocked: boolean }>;
    activite: Array<{ type: string; label: string; user: string; date: string; color: string; icon: string }>;
}

function StatCard({ label, value, sub, color, icon }: any) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-400">{label}</p>
                    <p className="text-2xl font-extrabold tracking-tight text-[#0f172a] mt-1">{value.toLocaleString()}</p>
                    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard({ stats, chart, top_users, activite }: Props) {
    const chartData = chart.labels.map((l, i) => ({
        date: l, reponses: chart.reponses[i], users: chart.users[i]
    }));

    return (
        <AdminLayout title="Dashboard" subtitle="Vue globale de la plateforme">
            <Head title="Admin — Dashboard" />

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Utilisateurs" value={stats.total_users}
                    sub={`+${stats.nouveaux_users} ce mois`} color="bg-blue-50"
                    icon={<svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
                />
                <StatCard label="Enquêtes" value={stats.total_enquetes}
                    sub={`${stats.enquetes_actives} actives`} color="bg-purple-50"
                    icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
                />
                <StatCard label="Réponses" value={stats.total_reponses}
                    sub={`${stats.reponses_today} aujourd'hui`} color="bg-green-50"
                    icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>}
                />
                <StatCard label="Invitations" value={stats.total_invitations}
                    sub={`${stats.total_contacts} contacts`} color="bg-amber-50"
                    icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>}
                />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 mb-5">
                <h3 className="text-sm font-bold text-[#0f172a] mb-5">Activité — 30 derniers jours</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4}/>
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}/>
                        <Area type="monotone" dataKey="reponses" name="Réponses" stroke="#2563eb" strokeWidth={2} fill="url(#gBlue)" dot={false}/>
                        <Area type="monotone" dataKey="users" name="Inscriptions" stroke="#16a34a" strokeWidth={2} fill="url(#gGreen)" dot={false}/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Top users */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-[#0f172a]">Top utilisateurs</h3>
                        <Link href="/admin/users" className="text-xs text-[#2563eb] font-semibold hover:underline">Voir tous →</Link>
                    </div>
                    <div className="space-y-2">
                        {top_users.map((u, i) => (
                            <Link key={u.id} href={`/admin/users/${u.id}`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="w-8 h-8 rounded-xl bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {u.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#0f172a] truncate">{u.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-bold text-[#2563eb]">{u.forms_count} enquête{u.forms_count > 1 ? 's' : ''}</p>
                                    {u.is_blocked && <span className="text-xs text-red-500 font-semibold">Bloqué</span>}
                                    {u.role === 'admin' && <span className="text-xs text-amber-600 font-semibold">Admin</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Activité récente */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <h3 className="text-sm font-bold text-[#0f172a] mb-4">Activité récente</h3>
                    <div className="space-y-3">
                        {activite.map((a, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${a.color}`}>
                                    {a.icon === 'chat' ? (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-[#0f172a] truncate">{a.label}</p>
                                    <p className="text-xs text-slate-400">{a.user} · {a.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}