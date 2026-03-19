import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '../dashboard/layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormItem {
    id: number;
    title: string;
    description: string | null;
    reference: string;
    color: string;
    is_published: boolean;
    accepts_responses: boolean;
    questions_count: number;
    responses_count: number;
    closes_at: string | null;
    created_at: string;
    statut: 'Active' | 'Brouillon' | 'Fermée';
}

interface PaginatedData {
    data: FormItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Stats {
    total: number;
    actives: number;
    brouillons: number;
    total_reponses: number;
}

interface Filters {
    search?: string;
    statut?: string;
}

interface Props {
    forms: PaginatedData;
    stats: Stats;
    filters?: Filters;
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Active:    'bg-green-100 text-green-700 border border-green-200',
        Brouillon: 'bg-amber-100 text-amber-700 border border-amber-200',
        Fermée:    'bg-slate-100 text-slate-500 border border-slate-200',
    };
    const dots: Record<string, string> = {
        Active: 'bg-green-500', Brouillon: 'bg-amber-500', Fermée: 'bg-slate-400',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? styles.Brouillon}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ?? dots.Brouillon}`}></span>
            {status}
        </span>
    );
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="mt-1 text-sm font-medium text-[#0f172a]">{value || '—'}</p>
        </div>
    );
}

const inputCls    = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0f172a] placeholder-slate-300 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all";
const inputErrCls = "w-full rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm text-[#0f172a] focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-50 transition-all";
const labelCls    = "mb-1.5 block text-sm font-medium text-[#0f172a]";

// ─── Page principale ──────────────────────────────────────────────────────────

export default function FormsIndex({ forms, stats, filters = {} }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal,   setShowViewModal]   = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedForm,    setSelectedForm]    = useState<FormItem | null>(null);
    const [search,          setSearch]          = useState(filters?.search ?? '');
    const [statutFilter,    setStatutFilter]    = useState(filters?.statut ?? '');

    // ── Formulaire de création ────────────────────────────────────────────────
    const createForm = useForm({
        title:       '',
        description: '',
        color:       '#2563eb',
    });

    // ── Recherche ─────────────────────────────────────────────────────────────
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/enquetes', { search, statut: statutFilter }, { preserveState: true });
    };

    const handleStatutFilter = (value: string) => {
        setStatutFilter(value);
        router.get('/enquetes', { search, statut: value }, { preserveState: true });
    };

    // ── Création ──────────────────────────────────────────────────────────────
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/enquetes/save', {
            onSuccess: (page: any) => {
                const saved = page.props.saved;
                createForm.reset();
                setShowCreateModal(false);
                if (saved?.id) {
                    router.visit(`/enquetes/${saved.id}/edit`);
                }
            },
        });
    };

    // ── Modals ────────────────────────────────────────────────────────────────
    const openViewModal = (form: FormItem) => { setSelectedForm(form); setShowViewModal(true); };
    const openDeleteModal = (form: FormItem) => { setSelectedForm(form); setShowDeleteModal(true); };

    const handleDelete = () => {
        if (!selectedForm) return;
        router.delete(`/enquetes/${selectedForm.id}`, {
            onSuccess: () => { setShowDeleteModal(false); setSelectedForm(null); },
        });
    };

    const toggleClose = (form: FormItem) => {
        router.post(`/enquetes/${form.id}/fermer`, {}, { preserveScroll: true });
    };

    // ── Sécurité stats ────────────────────────────────────────────────────────
    const safeStats = {
        total:          stats?.total          ?? 0,
        actives:        stats?.actives        ?? 0,
        brouillons:     stats?.brouillons     ?? 0,
        total_reponses: stats?.total_reponses ?? 0,
    };

    return (
        <DashboardLayout title="Mes enquêtes" subtitle="Gérez et suivez toutes vos enquêtes">
            <Head title="Enquêtes — STATS ENQUETES" />

            {/* ── Header actions ─────────────────────────────────────────── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher une enquête…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0f172a] placeholder-slate-300 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                    </svg>
                </form>
                <div className="flex items-center gap-3">
                    <select value={statutFilter} onChange={e => handleStatutFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#2563eb] focus:outline-none transition-all">
                        <option value="">Tous les statuts</option>
                        <option value="Active">Active</option>
                        <option value="Brouillon">Brouillon</option>
                        <option value="Fermée">Fermée</option>
                    </select>
                    <button onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/>
                        </svg>
                        Nouvelle enquête
                    </button>
                </div>
            </div>

            {/* ── Stats ──────────────────────────────────────────────────── */}
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
                {[
                    { label: 'Total enquêtes', value: safeStats.total,                         color: 'text-[#0f172a]'  },
                    { label: 'Actives',        value: safeStats.actives,                       color: 'text-green-600'  },
                    { label: 'Brouillons',     value: safeStats.brouillons,                    color: 'text-amber-600'  },
                    { label: 'Total réponses', value: safeStats.total_reponses.toLocaleString(),color: 'text-[#2563eb]' },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5">
                        <p className="text-xs font-medium text-slate-400">{s.label}</p>
                        <p className={`mt-1 text-2xl font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Table ──────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {['Enquête', 'Référence', 'Questions', 'Réponses', 'Créée le', 'Statut', 'Actions'].map(h => (
                                    <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {forms.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                                </svg>
                                            </div>
                                            <p className="text-sm text-slate-400">Aucune enquête trouvée</p>
                                            <button onClick={() => setShowCreateModal(true)} className="text-sm font-semibold text-[#2563eb] hover:underline">
                                                Créer votre première enquête →
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : forms.data.map(form => (
                                <tr key={form.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                                                style={{ backgroundColor: form.color }}>
                                                {form.title.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#0f172a] group-hover:text-[#2563eb] transition-colors">{form.title}</p>
                                                <p className="text-xs text-slate-400 truncate max-w-[200px]">{form.description || 'Pas de description'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{form.reference}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#0f172a]">{form.questions_count}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-[#2563eb]">{form.responses_count}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{form.created_at}</td>
                                    <td className="px-6 py-4"><StatusBadge status={form.statut} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openViewModal(form)}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#0f172a] transition-colors" title="Détails">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </button>
                                            <Link href={`/enquetes/${form.id}/edit`}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#2563eb] transition-colors" title="Modifier">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </Link>
                                            <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/f/${form.reference}`)}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-green-600 transition-colors" title="Copier le lien">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                            </button>
                                            {form.is_published && (
                                                <button onClick={() => toggleClose(form)}
                                                    className={`p-2 rounded-xl transition-colors ${form.accepts_responses ? 'text-slate-400 hover:bg-slate-100 hover:text-amber-600' : 'text-green-500 hover:bg-green-50'}`}
                                                    title={form.accepts_responses ? 'Fermer les réponses' : 'Rouvrir les réponses'}>
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={form.accepts_responses ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}/>
                                                    </svg>
                                                </button>
                                            )}
                                            <button onClick={() => openDeleteModal(form)}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Supprimer">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {forms.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                        <p className="text-sm text-slate-400">
                            Affichage de <span className="font-semibold text-[#0f172a]">{(forms.current_page - 1) * forms.per_page + 1}</span> à{' '}
                            <span className="font-semibold text-[#0f172a]">{Math.min(forms.current_page * forms.per_page, forms.total)}</span> sur{' '}
                            <span className="font-semibold text-[#0f172a]">{forms.total.toLocaleString()}</span> enquêtes
                        </p>
                        <div className="flex items-center gap-1.5">
                            {forms.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'}
                                    className={`rounded-xl px-3 py-2 text-sm transition-colors ${
                                        link.active
                                            ? 'bg-[#2563eb] font-semibold text-white'
                                            : link.url
                                            ? 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                                            : 'cursor-not-allowed border border-slate-100 text-slate-300'
                                    }`}
                                    preserveState
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── MODAL CRÉER ───────────────────────────────────────────── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0f172a]">Nouvelle enquête</h2>
                                <p className="text-sm text-slate-400 mt-0.5">Donnez un nom à votre enquête pour commencer</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            <div>
                                <label className={labelCls}>Titre <span className="text-red-500">*</span></label>
                                <input type="text" value={createForm.data.title}
                                    onChange={e => createForm.setData('title', e.target.value)}
                                    placeholder="Ex: Satisfaction client 2025" autoFocus
                                    className={createForm.errors.title ? inputErrCls : inputCls}
                                />
                                {createForm.errors.title && <p className="mt-1 text-xs text-red-500">{createForm.errors.title}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Description <span className="text-slate-400 font-normal">(optionnel)</span></label>
                                <textarea rows={3} value={createForm.data.description}
                                    onChange={e => createForm.setData('description', e.target.value)}
                                    placeholder="Décrivez l'objectif de cette enquête…"
                                    className={`${inputCls} resize-none`}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Couleur</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={createForm.data.color}
                                        onChange={e => createForm.setData('color', e.target.value)}
                                        className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1"
                                    />
                                    <div className="flex gap-2">
                                        {['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'].map(c => (
                                            <button key={c} type="button" onClick={() => createForm.setData('color', c)}
                                                className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${createForm.data.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setShowCreateModal(false)}
                                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" disabled={createForm.processing}
                                    className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors">
                                    {createForm.processing ? <><Spin /> Création…</> : <><ArrowIcon /> Créer et éditer</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL VOIR ────────────────────────────────────────────── */}
            {showViewModal && selectedForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                                    style={{ backgroundColor: selectedForm.color }}>
                                    {selectedForm.title.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#0f172a]">{selectedForm.title}</h2>
                                    <p className="text-xs font-mono text-slate-400">{selectedForm.reference}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={selectedForm.statut} />
                                <button onClick={() => setShowViewModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            {selectedForm.description && <p className="text-sm text-slate-500">{selectedForm.description}</p>}
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem label="Questions" value={`${selectedForm.questions_count} champ${selectedForm.questions_count > 1 ? 's' : ''}`} />
                                <InfoItem label="Réponses" value={`${selectedForm.responses_count} réponse${selectedForm.responses_count > 1 ? 's' : ''}`} />
                                <InfoItem label="Créée le" value={selectedForm.created_at} />
                                <InfoItem label="Fermeture" value={selectedForm.closes_at ?? 'Pas de date limite'} />
                                <InfoItem label="Publication" value={selectedForm.is_published ? 'Publiée' : 'Brouillon'} />
                                <InfoItem label="Collecte" value={selectedForm.accepts_responses ? 'Ouverte' : 'Fermée'} />
                            </div>
                            {selectedForm.is_published && (
                                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Lien public</p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 text-xs text-blue-800 truncate">{`${window.location.origin}/f/${selectedForm.reference}`}</code>
                                        <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/f/${selectedForm.reference}`)}
                                            className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                            <button onClick={() => setShowViewModal(false)}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                Fermer
                            </button>
                            <Link href={`/enquetes/${selectedForm.id}/edit`} onClick={() => setShowViewModal(false)}
                                className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Modifier
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL SUPPRIMER ───────────────────────────────────────── */}
            {showDeleteModal && selectedForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </div>
                            <div>
                                <h2 className="font-bold text-[#0f172a]">Supprimer l'enquête</h2>
                                <p className="text-sm text-slate-400 mt-0.5">Cette action est irréversible</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-[#0f172a]">«&nbsp;{selectedForm.title}&nbsp;»</span> ainsi que toutes ses réponses ?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowDeleteModal(false); setSelectedForm(null); }}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                Annuler
                            </button>
                            <button onClick={handleDelete}
                                className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6"/></svg>
                                Supprimer définitivement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// ─── Icônes & Spinner ─────────────────────────────────────────────────────────

function Spin() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
        </svg>
    );
}