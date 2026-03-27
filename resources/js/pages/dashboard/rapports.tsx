import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
    total_enquetes: number;
    enquetes_actives: number;
    total_reponses: number;
    reponses_recentes: number;
    periode: string;
}
interface ChartLine  { labels: string[]; data: number[] }
interface ChartDonut { label: string; color: string; value: number }
interface ChartBar   { labels: string[]; data: number[] }
interface TopEnquete {
    id: number; title: string; color: string; statut: string;
    total_reponses: number; reponses_recentes: number;
}
interface Props {
    stats: Stats;
    chart_reponses:   ChartLine;
    chart_formes:     ChartDonut[];
    chart_heure:      ChartBar;
    chart_completion: { title: string; color: string; value: number }[];
    top_enquetes:     TopEnquete[];
    periode:          string;
}

const PERIODES = [
    { value: '7',   label: '7 jours' },
    { value: '30',  label: '30 jours' },
    { value: '90',  label: '90 jours' },
    { value: '365', label: '1 an' },
];

const STATUT_CONFIG: Record<string, { label: string; cls: string }> = {
    Active:    { label: 'Active',    cls: 'bg-green-100 text-green-700 border border-green-200' },
    Fermée:    { label: 'Fermée',    cls: 'bg-slate-100 text-slate-500 border border-slate-200' },
    Brouillon: { label: 'Brouillon', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
};

// ─── Tooltip personnalisé ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-sm font-bold" style={{ color: p.color ?? '#2563eb' }}>
                    {p.value} réponse{p.value > 1 ? 's' : ''}
                </p>
            ))}
        </div>
    );
}

// ─── Composant carte stat ─────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon }: { label: string; value: number; sub?: string; color: string; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 truncate">{label}</p>
                <p className="text-2xl font-extrabold tracking-tight text-[#0f172a] mt-0.5">{value.toLocaleString()}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Rapports({
    stats, chart_reponses, chart_formes, chart_heure, chart_completion, top_enquetes, periode
}: Props) {

    const [periodeActive, setPeriodeActive] = useState(periode);

    const handlePeriode = (p: string) => {
        setPeriodeActive(p);
        router.get('/rapports', { periode: p }, { preserveState: true });
    };

    // Transformer les données pour Recharts
    const dataArea = chart_reponses.labels.map((l, i) => ({ date: l, reponses: chart_reponses.data[i] }));
    const dataBar  = chart_heure.labels.map((l, i) => ({ heure: l, reponses: chart_heure.data[i] }));
    const dataComp = chart_completion.map(c => ({ name: c.title, value: c.value, color: c.color }));

    const maxComp = Math.max(...chart_completion.map(c => c.value), 1);

    return (
        <DashboardLayout title="Rapports" subtitle="Analysez les performances de vos enquêtes">
            <Head title="Rapports — STAT ENQUETE" />

            {/* Sélecteur de période */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Période :</span>
                {PERIODES.map(p => (
                    <button key={p.value} onClick={() => handlePeriode(p.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            periodeActive === p.value
                                ? 'bg-[#2563eb] text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-500 hover:border-[#2563eb] hover:text-[#2563eb]'
                        }`}>
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Total enquêtes"
                    value={stats.total_enquetes}
                    color="bg-blue-50"
                    icon={<svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
                />
                <StatCard
                    label="Enquêtes actives"
                    value={stats.enquetes_actives}
                    color="bg-green-50"
                    icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                />
                <StatCard
                    label="Total réponses"
                    value={stats.total_reponses}
                    color="bg-purple-50"
                    icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>}
                />
                <StatCard
                    label={`Réponses (${PERIODES.find(p => p.value === periodeActive)?.label})`}
                    value={stats.reponses_recentes}
                    color="bg-amber-50"
                    icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
                />
            </div>

            {/* Graphe principal — Réponses dans le temps */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-sm font-bold text-[#0f172a]">Évolution des réponses</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Nombre de réponses reçues par jour</p>
                    </div>
                </div>
                {dataArea.every(d => d.reponses === 0) ? (
                    <EmptyChart message="Aucune réponse sur cette période" />
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={dataArea} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                interval={Math.floor(dataArea.length / 7)} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="reponses" stroke="#2563eb" strokeWidth={2.5}
                                fill="url(#gradBlue)" dot={false} activeDot={{ r: 5, fill: '#2563eb' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* 2 colonnes — Donut + Heures */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                {/* Répartition par enquête */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                    <h3 className="text-sm font-bold text-[#0f172a] mb-1">Répartition par enquête</h3>
                    <p className="text-xs text-slate-400 mb-5">Part des réponses par formulaire</p>
                    {chart_formes.length === 0 ? (
                        <EmptyChart message="Aucune donnée disponible" />
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <ResponsiveContainer width={180} height={180}>
                                <PieChart>
                                    <Pie data={chart_formes} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                                        dataKey="value" paddingAngle={3}>
                                        {chart_formes.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => [`${v} réponses`, '']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2 min-w-0">
                                {chart_formes.map((f, i) => {
                                    const total = chart_formes.reduce((s, x) => s + x.value, 0);
                                    const pct   = total > 0 ? Math.round((f.value / total) * 100) : 0;
                                    return (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }}></div>
                                            <span className="text-xs text-slate-500 truncate flex-1">{f.label}</span>
                                            <span className="text-xs font-bold text-[#0f172a]">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Réponses par heure */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                    <h3 className="text-sm font-bold text-[#0f172a] mb-1">Activité par heure</h3>
                    <p className="text-xs text-slate-400 mb-5">À quelle heure les contacts répondent</p>
                    {dataBar.every(d => d.reponses === 0) ? (
                        <EmptyChart message="Aucune activité sur cette période" />
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={dataBar} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                                barSize={6}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="heure" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                    interval={3} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="reponses" fill="#2563eb" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* 2 colonnes — Top enquêtes + Barres completion */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Top enquêtes */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                    <h3 className="text-sm font-bold text-[#0f172a] mb-1">Top enquêtes</h3>
                    <p className="text-xs text-slate-400 mb-5">Les plus actives sur la période</p>
                    {top_enquetes.length === 0 ? (
                        <EmptyChart message="Aucune enquête trouvée" />
                    ) : (
                        <div className="space-y-3">
                            {top_enquetes.map((e, i) => {
                                const cfg = STATUT_CONFIG[e.statut] ?? STATUT_CONFIG['Brouillon'];
                                return (
                                    <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                            style={{ backgroundColor: e.color }}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-[#0f172a] truncate">{e.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                <span className="font-semibold text-[#2563eb]">{e.reponses_recentes}</span> récentes
                                                <span className="mx-1.5">·</span>
                                                {e.total_reponses} au total
                                            </p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.cls}`}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Réponses par enquête — barres horizontales */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                    <h3 className="text-sm font-bold text-[#0f172a] mb-1">Volume de réponses</h3>
                    <p className="text-xs text-slate-400 mb-5">Total par enquête publiée</p>
                    {chart_completion.length === 0 ? (
                        <EmptyChart message="Aucune enquête publiée" />
                    ) : (
                        <div className="space-y-4">
                            {chart_completion.map((c, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]">{c.title}</span>
                                        <span className="text-xs font-bold text-[#0f172a] ml-2 flex-shrink-0">{c.value}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${Math.round((c.value / maxComp) * 100)}%`,
                                                backgroundColor: c.color,
                                            }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function EmptyChart({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
            </div>
            <p className="text-xs text-slate-400">{message}</p>
        </div>
    );
}