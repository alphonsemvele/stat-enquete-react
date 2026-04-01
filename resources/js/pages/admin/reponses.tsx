import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from './layout';

interface ReponseItem {
    id: number;
    form_title: string; form_color: string; form_ref: string;
    user_name: string; user_email: string;
    ip_address: string; submitted_at: string; nb_reponses: number;
    apercu: Array<{ label: string; value: string }>;
}
interface FormOption { id: number; title: string; color: string; responses_count: number; }
interface PaginatedData {
    data: ReponseItem[]; total: number; last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
interface Stats { total: number; aujourd_hui: number; cette_semaine: number; ce_mois: number; }
interface Props {
    reponses: PaginatedData; forms: FormOption[];
    filters?: { form_id?: string; search?: string; date_from?: string; date_to?: string };
    stats: Stats;
}

const [previewOpen, setPreviewOpen] = [null as ReponseItem | null, () => {}];

export default function AdminReponses({ reponses, forms, filters = {}, stats }: Props) {
    const [search,    setSearch]    = useState(filters.search    ?? '');
    const [formId,    setFormId]    = useState(filters.form_id   ?? '');
    const [dateFrom,  setDateFrom]  = useState(filters.date_from ?? '');
    const [dateTo,    setDateTo]    = useState(filters.date_to   ?? '');
    const [preview,   setPreview]   = useState<ReponseItem | null>(null);

    const apply = (o: object = {}) =>
        router.get('/admin/reponses', { search, form_id: formId, date_from: dateFrom, date_to: dateTo, ...o }, { preserveState: true });

    const destroy = (id: number) => {
        if (!confirm('Supprimer cette réponse définitivement ?')) return;
        router.delete(`/admin/reponses/${id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Réponses" subtitle={`${reponses.total.toLocaleString()} réponse(s) sur la plateforme`}>
            <Head title="Admin — Réponses" />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                    { label: 'Total',         value: stats.total,         color: 'text-[#0f172a]' },
                    { label: "Aujourd'hui",   value: stats.aujourd_hui,   color: 'text-green-600' },
                    { label: 'Cette semaine', value: stats.cette_semaine, color: 'text-[#2563eb]' },
                    { label: 'Ce mois',       value: stats.ce_mois,       color: 'text-purple-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4">
                        <p className="text-xs text-slate-400">{s.label}</p>
                        <p className={`text-xl font-extrabold tracking-tight mt-1 ${s.color}`}>{s.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5 flex flex-wrap gap-3">
                {/* Recherche */}
                <div className="relative flex-1 min-w-[180px]">
                    <input type="text" value={search}
                        onChange={e => { setSearch(e.target.value); apply({ search: e.target.value }); }}
                        placeholder="Enquête, utilisateur…"
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-[#2563eb] focus:outline-none"/>
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
                </div>

                {/* Enquête */}
                <select value={formId} onChange={e => { setFormId(e.target.value); apply({ form_id: e.target.value }); }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none max-w-[200px]">
                    <option value="">Toutes les enquêtes</option>
                    {forms.map(f => (
                        <option key={f.id} value={f.id}>{f.title} ({f.responses_count})</option>
                    ))}
                </select>

                {/* Dates */}
                <input type="date" value={dateFrom}
                    onChange={e => { setDateFrom(e.target.value); apply({ date_from: e.target.value }); }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none"
                    title="Date de début"/>
                <input type="date" value={dateTo}
                    onChange={e => { setDateTo(e.target.value); apply({ date_to: e.target.value }); }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none"
                    title="Date de fin"/>

                {/* Reset */}
                {(search || formId || dateFrom || dateTo) && (
                    <button onClick={() => {
                        setSearch(''); setFormId(''); setDateFrom(''); setDateTo('');
                        router.get('/admin/reponses', {}, { preserveState: true });
                    }} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50">
                        Réinitialiser
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Enquête</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden sm:table-cell">Propriétaire</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden md:table-cell">Aperçu</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden lg:table-cell">IP</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Soumis le</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reponses.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                                            </div>
                                            <p className="text-sm text-slate-400">Aucune réponse trouvée</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : reponses.data.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                    {/* Enquête */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                style={{ backgroundColor: r.form_color }}>
                                                {r.form_title.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#0f172a] truncate max-w-[140px]">{r.form_title}</p>
                                                <code className="text-xs text-slate-400">{r.form_ref}</code>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Propriétaire */}
                                    <td className="px-5 py-4 hidden sm:table-cell">
                                        <p className="text-sm text-[#0f172a]">{r.user_name}</p>
                                        <p className="text-xs text-slate-400 font-mono truncate max-w-[160px]">{r.user_email}</p>
                                    </td>

                                    {/* Aperçu réponses */}
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <div className="space-y-0.5">
                                            {r.apercu.map((a, i) => (
                                                <p key={i} className="text-xs text-slate-500 truncate max-w-[180px]">
                                                    <span className="text-slate-400">{a.label} :</span> {a.value || '—'}
                                                </p>
                                            ))}
                                            {r.nb_reponses > 2 && (
                                                <p className="text-xs text-[#2563eb] font-semibold">+{r.nb_reponses - 2} autres</p>
                                            )}
                                        </div>
                                    </td>

                                    {/* IP */}
                                    <td className="px-5 py-4 hidden lg:table-cell">
                                        <code className="text-xs text-slate-400">{r.ip_address}</code>
                                    </td>

                                    {/* Date */}
                                    <td className="px-5 py-4">
                                        <p className="text-xs font-medium text-[#0f172a]">{r.submitted_at}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{r.nb_reponses} champ{r.nb_reponses > 1 ? 's' : ''}</p>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setPreview(r)}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#0f172a] transition-colors" title="Aperçu">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </button>
                                            <button onClick={() => destroy(r.id)}
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

                {/* Pagination */}
                {reponses.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                        <p className="text-sm text-slate-400">
                            <span className="font-semibold text-[#0f172a]">{reponses.total.toLocaleString()}</span> réponse(s)
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {reponses.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'} preserveState
                                    className={`rounded-xl px-3 py-2 text-sm transition-colors ${link.active ? 'bg-[#2563eb] font-semibold text-white' : link.url ? 'border border-slate-200 text-slate-500 hover:bg-slate-50' : 'cursor-not-allowed border border-slate-100 text-slate-300'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}/>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal aperçu */}
            {preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setPreview(null)}>
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: preview.form_color }}>
                                    {preview.form_title.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#0f172a]">{preview.form_title}</h3>
                                    <p className="text-xs text-slate-400">{preview.submitted_at} · {preview.user_name}</p>
                                </div>
                            </div>
                            <button onClick={() => setPreview(null)}
                                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>

                        {/* Contenu */}
                        <div className="px-6 py-5 space-y-3 max-h-80 overflow-y-auto">
                            {preview.apercu.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">Aucune réponse enregistrée.</p>
                            ) : preview.apercu.map((a, i) => (
                                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{a.label}</p>
                                    <p className="text-sm text-[#0f172a]">{a.value || <span className="text-slate-300 italic">Non renseigné</span>}</p>
                                </div>
                            ))}
                            {preview.nb_reponses > 2 && (
                                <p className="text-xs text-center text-slate-400 pt-1">
                                    + {preview.nb_reponses - 2} autre(s) champ(s) non affichés dans cet aperçu
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <code>{preview.ip_address}</code>
                                <span>·</span>
                                <code>{preview.form_ref}</code>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setPreview(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                    Fermer
                                </button>
                                <button onClick={() => { destroy(preview.id); setPreview(null); }}
                                    className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}