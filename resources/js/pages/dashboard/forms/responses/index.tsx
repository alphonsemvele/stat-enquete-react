import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '../../../dashboard/layout';

interface ResponseItem { id: number; form_id: number; form_title: string; form_color: string; form_reference: string; ip_address: string; submitted_at: string; answers_count: number; }
interface FormOption   { id: number; title: string; color: string; }
interface PaginatedData { data: ResponseItem[]; current_page: number; last_page: number; per_page: number; total: number; links: Array<{ url: string | null; label: string; active: boolean }>; }
interface Stats { total: number; aujourd_hui: number; cette_semaine: number; ce_mois: number; }
interface Props { responses: PaginatedData; forms: FormOption[]; stats: Stats; filters?: { search?: string; form_id?: string }; }

export default function ResponsesIndex({ responses, forms, stats, filters = {} }: Props) {
    const [search,   setSearch]   = useState(filters?.search  ?? '');
    const [formId,   setFormId]   = useState(filters?.form_id ?? '');
    const [deleting, setDeleting] = useState<number | null>(null);

    const safeStats = { total: stats?.total ?? 0, aujourd_hui: stats?.aujourd_hui ?? 0, cette_semaine: stats?.cette_semaine ?? 0, ce_mois: stats?.ce_mois ?? 0 };

    const applyFilters = (overrides: object = {}) => router.get('/reponses', { search, form_id: formId, ...overrides }, { preserveState: true });

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer cette réponse définitivement ?')) return;
        setDeleting(id);
        router.delete(`/reponses/${id}`, { preserveScroll: true, onFinish: () => setDeleting(null) });
    };

    return (
        <DashboardLayout title="Réponses" subtitle="Toutes les réponses collectées">
            <Head title="Réponses — STATS ENQUETES" />

            {/* Stats — 2 cols mobile → 4 cols sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total réponses',  value: safeStats.total,         color: 'text-[#0f172a]'  },
                    { label: "Aujourd'hui",     value: safeStats.aujourd_hui,   color: 'text-[#2563eb]'  },
                    { label: 'Cette semaine',   value: safeStats.cette_semaine, color: 'text-indigo-600' },
                    { label: 'Ce mois',         value: safeStats.ce_mois,       color: 'text-violet-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
                        <p className="text-xs font-medium text-slate-400">{s.label}</p>
                        <p className={`mt-1 text-xl sm:text-2xl font-extrabold tracking-tight ${s.color}`}>{s.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <input type="text" value={search} onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value }); }} placeholder="Rechercher par IP, enquête…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0f172a] placeholder-slate-300 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
                </div>
                <select value={formId} onChange={e => { setFormId(e.target.value); applyFilters({ form_id: e.target.value }); }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#2563eb] focus:outline-none transition-all">
                    <option value="">Toutes les enquêtes</option>
                    {forms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Enquête</th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden sm:table-cell">Adresse IP</th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden sm:table-cell">Réponses</th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden md:table-cell">Soumis le</th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {responses.data.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center"><svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg></div>
                                        <p className="text-sm text-slate-400">Aucune réponse trouvée</p>
                                    </div>
                                </td></tr>
                            ) : responses.data.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: r.form_color }}>{r.form_title.slice(0, 2).toUpperCase()}</div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#0f172a] group-hover:text-[#2563eb] transition-colors truncate">{r.form_title}</p>
                                                <span className="text-xs font-mono text-slate-400">{r.form_reference}</span>
                                                {/* IP + date inline sur mobile */}
                                                <div className="flex items-center gap-2 mt-0.5 sm:hidden flex-wrap">
                                                    <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{r.ip_address}</span>
                                                    <span className="text-xs text-slate-400">{r.submitted_at}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                        <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-500">{r.ip_address}</span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-full">{r.answers_count} champ{r.answers_count > 1 ? 's' : ''}</span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{r.submitted_at}</td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/reponses/${r.form_id}`} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#2563eb] transition-colors" title="Voir les détails">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </Link>
                                            <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50" title="Supprimer">
                                                {deleting === r.id
                                                    ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                }
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {responses.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 px-4 sm:px-6 py-4">
                        <p className="text-sm text-slate-400"><span className="font-semibold text-[#0f172a]">{responses.total.toLocaleString()}</span> réponse{responses.total > 1 ? 's' : ''}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {responses.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'} className={`rounded-xl px-3 py-2 text-sm transition-colors ${link.active ? 'bg-[#2563eb] font-semibold text-white' : link.url ? 'border border-slate-200 text-slate-500 hover:bg-slate-50' : 'cursor-not-allowed border border-slate-100 text-slate-300'}`} preserveState dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}