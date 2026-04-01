// ══════════════════════════════════════════════════════
// resources/js/pages/admin/enquetes/index.tsx
// ══════════════════════════════════════════════════════
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from './layout';

interface EnqueteItem {
    id: number; title: string; color: string; reference: string; statut: string;
    total_reponses: number; user_name: string; user_email: string; created_at: string;
}
interface PaginatedData {
    data: EnqueteItem[]; total: number; last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export default function AdminEnquetes({ enquetes, filters = {}, stats }: {
    enquetes: PaginatedData;
    filters?: any;
    stats: { total: number; actives: number; fermees: number; brouillons: number };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statut, setStatut] = useState(filters.statut ?? '');

    const apply = (o: object = {}) =>
        router.get('/admin/enquetes', { search, statut, ...o }, { preserveState: true });

    const forceClose = (id: number) => {
        if (!confirm('Fermer cette enquête ?')) return;
        router.post(`/admin/enquetes/${id}/fermer`, {}, { preserveScroll: true });
    };
    const destroy = (id: number) => {
        if (!confirm('Supprimer définitivement cette enquête et toutes ses réponses ?')) return;
        router.delete(`/admin/enquetes/${id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Enquêtes" subtitle={`${enquetes.total} enquête(s) sur la plateforme`}>
            <Head title="Admin — Enquêtes" />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                    { label: 'Total',      value: stats.total,      color: 'text-[#0f172a]' },
                    { label: 'Actives',    value: stats.actives,    color: 'text-green-600' },
                    { label: 'Fermées',    value: stats.fermees,    color: 'text-slate-500' },
                    { label: 'Brouillons', value: stats.brouillons, color: 'text-amber-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4">
                        <p className="text-xs text-slate-400">{s.label}</p>
                        <p className={`text-xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <input type="text" value={search}
                        onChange={e => { setSearch(e.target.value); apply({ search: e.target.value }); }}
                        placeholder="Rechercher par titre ou référence…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#2563eb] focus:outline-none"/>
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
                </div>
                <select value={statut} onChange={e => { setStatut(e.target.value); apply({ statut: e.target.value }); }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none">
                    <option value="">Tous les statuts</option>
                    <option value="active">Active</option>
                    <option value="fermee">Fermée</option>
                    <option value="brouillon">Brouillon</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Enquête</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden sm:table-cell">Propriétaire</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Statut</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden md:table-cell">Réponses</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden lg:table-cell">Créée le</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {enquetes.data.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-400">Aucune enquête trouvée.</td></tr>
                            ) : enquetes.data.map(e => (
                                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                style={{ backgroundColor: e.color }}>
                                                {e.title.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#0f172a] truncate">{e.title}</p>
                                                <code className="text-xs text-slate-400">{e.reference}</code>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden sm:table-cell">
                                        <p className="text-sm text-[#0f172a]">{e.user_name}</p>
                                        <p className="text-xs text-slate-400 font-mono">{e.user_email}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${e.statut === 'Active' ? 'bg-green-100 text-green-700' : e.statut === 'Fermée' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                                            {e.statut}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-bold text-[#2563eb] hidden md:table-cell">{e.total_reponses}</td>
                                    <td className="px-5 py-4 text-xs text-slate-400 hidden lg:table-cell">{e.created_at}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            {e.statut === 'Active' && (
                                                <button onClick={() => forceClose(e.id)}
                                                    className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 transition-colors" title="Fermer">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                                                </button>
                                            )}
                                            <button onClick={() => destroy(e.id)}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Supprimer">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {enquetes.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                        <p className="text-sm text-slate-400"><span className="font-semibold text-[#0f172a]">{enquetes.total}</span> enquête(s)</p>
                        <div className="flex gap-1.5">
                            {enquetes.links.map((l, i) => (
                                <Link key={i} href={l.url || '#'} preserveState
                                    className={`rounded-xl px-3 py-2 text-sm ${l.active ? 'bg-[#2563eb] text-white font-semibold' : l.url ? 'border border-slate-200 text-slate-500 hover:bg-slate-50' : 'cursor-not-allowed border border-slate-100 text-slate-300'}`}
                                    dangerouslySetInnerHTML={{ __html: l.label }}/>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}