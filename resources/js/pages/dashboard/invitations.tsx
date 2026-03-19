import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvitationItem {
    id: number;
    nom: string;
    email: string;
    initials: string;
    form_title: string;
    form_color: string;
    statut: 'en_attente' | 'envoyee' | 'ouverte' | 'repondue';
    envoye_le: string | null;
    ouvert_le: string | null;
    repondu_le: string | null;
    created_at: string;
}

interface FormOption   { id: number; title: string; color: string }
interface ContactOption { id: number; nom: string; email: string; initials: string }

interface PaginatedData {
    data: InvitationItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Stats {
    total: number;
    envoyees: number;
    ouvertes: number;
    repondues: number;
}

interface Props {
    invitations: PaginatedData;
    stats:       Stats;
    forms:       FormOption[];
    contacts?:   ContactOption[];
    filters?:    { form_id?: string; statut?: string; search?: string };
    success?:    string;
}

// ─── Statut badge ─────────────────────────────────────────────────────────────

const STATUT_CONFIG = {
    en_attente: { label: 'En attente',  cls: 'bg-slate-100 text-slate-500 border border-slate-200',  dot: 'bg-slate-400'  },
    envoyee:    { label: 'Envoyée',     cls: 'bg-blue-100 text-blue-700 border border-blue-200',     dot: 'bg-blue-500'   },
    ouverte:    { label: 'Ouverte',     cls: 'bg-amber-100 text-amber-700 border border-amber-200',  dot: 'bg-amber-500'  },
    repondue:   { label: 'Répondue',    cls: 'bg-green-100 text-green-700 border border-green-200',  dot: 'bg-green-500'  },
};

function StatutBadge({ statut }: { statut: string }) {
    const cfg = STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG] ?? STATUT_CONFIG.en_attente;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
            {cfg.label}
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Invitations({ invitations, stats, forms, contacts = [], filters = {}, success }: Props) {
    const [showSend,    setShowSend]    = useState(false);
    const [previewInv,  setPreviewInv]  = useState<InvitationItem | null>(null);
    const [formFilter,  setFormFilter]  = useState(filters?.form_id ?? '');
    const [statutFilter,setStatutFilter]= useState(filters?.statut  ?? '');
    const [search,      setSearch]      = useState(filters?.search  ?? '');

    const safeStats = {
        total:     stats?.total     ?? 0,
        envoyees:  stats?.envoyees  ?? 0,
        ouvertes:  stats?.ouvertes  ?? 0,
        repondues: stats?.repondues ?? 0,
    };

    // Auto-ouvrir le modal si form_id passé dans l'URL
    useEffect(() => {
        if (filters?.form_id && forms.some(f => String(f.id) === String(filters.form_id))) {
            setShowSend(true);
        }
    }, []);

    const taux = safeStats.total > 0
        ? Math.round((safeStats.repondues / safeStats.total) * 100)
        : 0;

    const applyFilters = (overrides: object = {}) => {
        router.get('/invitations', {
            form_id: formFilter, statut: statutFilter, search, ...overrides
        }, { preserveState: true });
    };

    const handleRelance = (id: number) => {
        router.post(`/invitations/${id}/relancer`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer cette invitation ?')) return;
        router.delete(`/invitations/${id}`, { preserveScroll: true });
    };

    return (
        <DashboardLayout title="Invitations" subtitle="Invitez vos contacts à répondre à vos enquêtes">
            <Head title="Invitations — STAT ENQUETE" />

            {/* Flash */}
            {success && (
                <div className="mb-5 flex items-center gap-3 px-5 py-3.5 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-medium">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    {success}
                </div>
            )}

            {/* ── Stats ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total envoyées',  value: safeStats.total,     color: 'text-[#0f172a]',  bg: 'bg-slate-100'   },
                    { label: 'Envoyées',         value: safeStats.envoyees,  color: 'text-[#2563eb]',  bg: 'bg-blue-50'     },
                    { label: 'Ouvertes',         value: safeStats.ouvertes,  color: 'text-amber-600',  bg: 'bg-amber-50'    },
                    { label: 'Répondues',        value: safeStats.repondues, color: 'text-green-600',  bg: 'bg-green-50'    },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5">
                        <p className="text-xs font-medium text-slate-400">{s.label}</p>
                        <p className={`text-2xl font-extrabold tracking-tight mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Taux de réponse */}
            {safeStats.total > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-[#0f172a]">Taux de réponse global</p>
                        <span className="text-2xl font-extrabold text-[#2563eb]">{taux}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                            style={{ width: `${taux}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-400">
                        <span>{safeStats.repondues} réponses</span>
                        <span>{safeStats.total} invitations</span>
                    </div>
                </div>
            )}

            {/* ── Header actions ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <input type="text" value={search}
                        onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value }); }}
                        placeholder="Rechercher par nom ou email…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder-slate-300 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                    </svg>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select value={formFilter}
                        onChange={e => { setFormFilter(e.target.value); applyFilters({ form_id: e.target.value }); }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#2563eb] focus:outline-none transition-all">
                        <option value="">Toutes les enquêtes</option>
                        {forms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                    </select>
                    <select value={statutFilter}
                        onChange={e => { setStatutFilter(e.target.value); applyFilters({ statut: e.target.value }); }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#2563eb] focus:outline-none transition-all">
                        <option value="">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="envoyee">Envoyée</option>
                        <option value="ouverte">Ouverte</option>
                        <option value="repondue">Répondue</option>
                    </select>
                    <button onClick={() => setShowSend(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                        Envoyer des invitations
                    </button>
                </div>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {['Contact', 'Enquête', 'Statut', 'Envoyé le', 'Ouvert le', 'Répondu le', 'Actions'].map(h => (
                                    <th key={h} className={`px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invitations.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                                                </svg>
                                            </div>
                                            <p className="text-sm text-slate-400">Aucune invitation trouvée</p>
                                            <button onClick={() => setShowSend(true)} className="text-sm font-semibold text-[#2563eb] hover:underline">
                                                Envoyer vos premières invitations →
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : invitations.data.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                                    {/* Contact */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {inv.initials}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[#0f172a]">{inv.nom}</p>
                                                <p className="text-xs text-slate-400 font-mono">{inv.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Enquête */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: inv.form_color }}></div>
                                            <span className="text-sm text-[#0f172a] truncate max-w-[160px]">{inv.form_title}</span>
                                        </div>
                                    </td>
                                    {/* Statut */}
                                    <td className="px-5 py-4"><StatutBadge statut={inv.statut} /></td>
                                    {/* Dates */}
                                    <td className="px-5 py-4 text-xs text-slate-400">{inv.envoye_le  ?? '—'}</td>
                                    <td className="px-5 py-4 text-xs text-slate-400">{inv.ouvert_le  ?? '—'}</td>
                                    <td className="px-5 py-4 text-xs text-slate-400">{inv.repondu_le ?? '—'}</td>
                                    {/* Actions */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Prévisualiser */}
                                            <button onClick={() => setPreviewInv(inv)}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#0f172a] transition-colors" title="Prévisualiser l'email">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </button>
                                            {/* Relancer — seulement si pas encore répondu */}
                                            {inv.statut !== 'repondue' && (
                                                <button onClick={() => handleRelance(inv.id)}
                                                    className="p-2 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-[#2563eb] transition-colors" title="Relancer">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                                    </svg>
                                                </button>
                                            )}
                                            {/* Supprimer */}
                                            <button onClick={() => handleDelete(inv.id)}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Supprimer">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {invitations.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                        <p className="text-sm text-slate-400">
                            <span className="font-semibold text-[#0f172a]">{invitations.total.toLocaleString()}</span> invitation{invitations.total > 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-1.5">
                            {invitations.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'} preserveState
                                    className={`rounded-xl px-3 py-2 text-sm transition-colors ${
                                        link.active ? 'bg-[#2563eb] font-semibold text-white'
                                        : link.url  ? 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                                                    : 'cursor-not-allowed border border-slate-100 text-slate-300'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── MODAL ENVOI ─────────────────────────────────────────────── */}
            {showSend && (
                <SendModal
                    forms={forms}
                    preselectedFormId={filters?.form_id ?? ''}
                    onClose={() => setShowSend(false)}
                />
            )}
            {/* ── MODAL PRÉVISUALISATION ──────────────────────────────────── */}
            {previewInv && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setPreviewInv(null)}>
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#0f172a]">Aperçu de l'email</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Envoyé à <span className="font-semibold text-[#0f172a]">{previewInv.email}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewInv(null)}
                                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Infos envoi */}
                        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-4 text-xs">
                            <div><span className="text-slate-400">De : </span><span className="font-semibold text-[#0f172a]">STAT ENQUETE</span></div>
                            <div><span className="text-slate-400">À : </span><span className="font-semibold text-[#0f172a]">{previewInv.nom} &lt;{previewInv.email}&gt;</span></div>
                            <StatutBadge statut={previewInv.statut} />
                        </div>

                        {/* Email preview */}
                        <div className="p-5">
                            <EmailPreview
                                formTitle={previewInv.form_title}
                                formColor={previewInv.form_color}
                                message=""
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                            <p className="text-xs text-slate-400">
                                {previewInv.envoye_le ? `Envoyé le ${previewInv.envoye_le}` : 'Pas encore envoyé'}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setPreviewInv(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                    Fermer
                                </button>
                                {previewInv.statut !== 'repondue' && (
                                    <button onClick={() => { handleRelance(previewInv.id); setPreviewInv(null); }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                        </svg>
                                        Relancer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// ─── Modal Envoi ──────────────────────────────────────────────────────────────

function SendModal({ forms, preselectedFormId = '', onClose }: {
    forms: FormOption[];
    preselectedFormId?: string;
    onClose: () => void;
}) {
    const [contacts,        setContacts]        = useState<ContactOption[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [selectedIds,     setSelectedIds]     = useState<number[]>([]);
    const [contactSearch,   setContactSearch]   = useState('');
    const [step,            setStep]            = useState<1 | 2>(1);

    const form = useForm({
        form_id:     preselectedFormId,
        contact_ids: [] as number[],
        message:     '',
    });

    // Charger les contacts si un formulaire est pré-sélectionné
    useEffect(() => {
        if (preselectedFormId) {
            handleFormSelect(preselectedFormId);
        }
    }, []);

    // Charger les contacts quand l'enquête est sélectionnée
    const handleFormSelect = async (formId: string) => {
        form.setData('form_id', formId);
        if (!formId) { setContacts([]); return; }
        setLoadingContacts(true);
        try {
            const res = await fetch(`/contacts/list?form_id=${formId}`);
            const data = await res.json();
            setContacts(data.contacts ?? []);
        } catch {
            // fallback : liste vide
        } finally {
            setLoadingContacts(false);
        }
    };

    const toggleContact = (id: number) => {
        const next = selectedIds.includes(id)
            ? selectedIds.filter(x => x !== id)
            : [...selectedIds, id];
        setSelectedIds(next);
        form.setData('contact_ids', next);
    };

    const toggleAll = () => {
        const filtered = contacts.filter(c =>
            !contactSearch || c.nom.toLowerCase().includes(contactSearch.toLowerCase()) || c.email.toLowerCase().includes(contactSearch.toLowerCase())
        );
        const allSelected = filtered.every(c => selectedIds.includes(c.id));
        const next = allSelected
            ? selectedIds.filter(id => !filtered.find(c => c.id === id))
            : [...new Set([...selectedIds, ...filtered.map(c => c.id)])];
        setSelectedIds(next);
        form.setData('contact_ids', next);
    };

    const filteredContacts = contacts.filter(c =>
        !contactSearch ||
        c.nom.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(contactSearch.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/invitations', {
            onSuccess: () => { form.reset(); onClose(); },
        });
    };

    const allFiltered = filteredContacts.length > 0 && filteredContacts.every(c => selectedIds.includes(c.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-[#0f172a]">Envoyer des invitations</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {step === 1 ? 'Étape 1 : Choisissez une enquête et vos contacts' : 'Étape 2 : Personnalisez votre message'}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border-b border-slate-100 flex-shrink-0">
                    {[1, 2].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                step === s ? 'bg-[#2563eb] text-white' :
                                step > s   ? 'bg-green-500 text-white' :
                                             'bg-slate-200 text-slate-500'
                            }`}>
                                {step > s ? '✓' : s}
                            </div>
                            <span className={`text-xs font-medium ${step === s ? 'text-[#2563eb]' : 'text-slate-400'}`}>
                                {s === 1 ? 'Sélection' : 'Message'}
                            </span>
                            {s < 2 && <div className="w-8 h-px bg-slate-200"></div>}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" noValidate>
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">

                        {step === 1 ? (
                            <>
                                {/* Choix de l'enquête */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        Enquête à partager <span className="text-red-500">*</span>
                                    </label>
                                    {forms.length === 0 ? (
                                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                                            Aucune enquête publiée. <a href="/enquetes" className="font-semibold underline">Publiez une enquête</a> d'abord.
                                        </div>
                                    ) : (
                                        <div className="grid gap-2">
                                            {forms.map(f => (
                                                <label key={f.id} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                                    form.data.form_id === String(f.id)
                                                        ? 'border-[#2563eb] bg-blue-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}>
                                                    <input type="radio" name="form_id" value={f.id}
                                                        checked={form.data.form_id === String(f.id)}
                                                        onChange={() => handleFormSelect(String(f.id))}
                                                        className="sr-only" />
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                        style={{ backgroundColor: f.color }}>
                                                        {f.title.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className={`text-sm font-medium ${form.data.form_id === String(f.id) ? 'text-[#2563eb]' : 'text-[#0f172a]'}`}>
                                                        {f.title}
                                                    </span>
                                                    {form.data.form_id === String(f.id) && (
                                                        <svg className="w-4 h-4 text-[#2563eb] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                                                        </svg>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {form.errors.form_id && <p className="mt-1 text-xs text-red-500">{form.errors.form_id}</p>}
                                </div>

                                {/* Sélection des contacts */}
                                {form.data.form_id && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Contacts <span className="text-red-500">*</span>
                                            </label>
                                            {selectedIds.length > 0 && (
                                                <span className="text-xs font-semibold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full">
                                                    {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>

                                        {/* Recherche dans les contacts */}
                                        <div className="relative mb-3">
                                            <input type="text" value={contactSearch}
                                                onChange={e => setContactSearch(e.target.value)}
                                                placeholder="Filtrer les contacts…"
                                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                                            />
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                                            </svg>
                                        </div>

                                        {loadingContacts ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Spin /> <span className="ml-2 text-sm text-slate-400">Chargement…</span>
                                            </div>
                                        ) : contacts.length === 0 ? (
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500 text-center">
                                                Aucun contact. <a href="/contacts" className="text-[#2563eb] font-semibold hover:underline">Ajoutez des contacts</a> d'abord.
                                            </div>
                                        ) : (
                                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                                {/* Tout sélectionner */}
                                                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                                                    <input type="checkbox" checked={allFiltered} onChange={toggleAll}
                                                        className="w-4 h-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer" />
                                                    <span className="text-xs font-semibold text-slate-500">
                                                        Tout sélectionner ({filteredContacts.length})
                                                    </span>
                                                </div>
                                                {/* Liste */}
                                                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                                                    {filteredContacts.map(c => (
                                                        <label key={c.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                                                            selectedIds.includes(c.id) ? 'bg-blue-50/50' : ''
                                                        }`}>
                                                            <input type="checkbox"
                                                                checked={selectedIds.includes(c.id)}
                                                                onChange={() => toggleContact(c.id)}
                                                                className="w-4 h-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer" />
                                                            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                                {c.initials}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-[#0f172a] truncate">{c.nom}</p>
                                                                <p className="text-xs text-slate-400 truncate font-mono">{c.email}</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {form.errors.contact_ids && <p className="mt-1 text-xs text-red-500">{form.errors.contact_ids}</p>}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Étape 2 : Message + Prévisualisation */
                            <div className="grid grid-cols-2 gap-6">

                                {/* Colonne gauche : formulaire message + résumé */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                            Message personnalisé <span className="text-slate-300 font-normal normal-case">(optionnel)</span>
                                        </label>
                                        <textarea rows={6} value={form.data.message}
                                            onChange={e => form.setData('message', e.target.value)}
                                            placeholder="Ajoutez un message personnel qui sera inclus dans l'email…"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0f172a] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 resize-none transition-all"
                                        />
                                        <p className="mt-1.5 text-xs text-slate-400">Ce message apparaît dans le corps de l'email.</p>
                                    </div>

                                    {/* Résumé */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Résumé envoi</p>
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-500">Enquête</span>
                                                <span className="text-xs font-semibold text-[#0f172a] truncate max-w-[140px]">
                                                    {forms.find(f => String(f.id) === form.data.form_id)?.title ?? '—'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-500">Destinataires</span>
                                                <span className="text-xs font-semibold text-[#2563eb]">
                                                    {selectedIds.length} contact{selectedIds.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-500">Expéditeur</span>
                                                <span className="text-xs font-semibold text-[#0f172a]">STAT ENQUETE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne droite : aperçu email */}
                                <div className="flex flex-col">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                        Aperçu de l'email
                                    </p>
                                    <EmailPreview
                                        formTitle={forms.find(f => String(f.id) === form.data.form_id)?.title ?? "Titre de l'enquête"}
                                        formColor={forms.find(f => String(f.id) === form.data.form_id)?.color ?? '#2563eb'}
                                        message={form.data.message}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
                        <button type="button" onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                            Annuler
                        </button>
                        <div className="flex gap-2">
                            {step === 2 && (
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStep(1); }}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                    ← Retour
                                </button>
                            )}
                            {step === 1 ? (
                                <button type="button"
                                    disabled={!form.data.form_id || selectedIds.length === 0}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStep(2); }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-40 transition-colors">
                                    Suivant →
                                </button>
                            ) : (
                                <button type="submit" disabled={form.processing}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors">
                                    {form.processing ? <><Spin /> Envoi en cours…</> : (
                                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg> Envoyer {selectedIds.length} invitation{selectedIds.length > 1 ? 's' : ''}</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Email Preview ───────────────────────────────────────────────────────────

function EmailPreview({ formTitle, formColor, message }: {
    formTitle: string;
    formColor: string;
    message: string;
}) {
    return (
        <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden bg-[#f8fafc] text-[11px] shadow-inner">
            {/* Barre navigateur factice */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border-b border-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                <div className="flex-1 mx-2 bg-white rounded px-2 py-0.5 text-[10px] text-slate-400 border border-slate-200">
                    Aperçu email
                </div>
            </div>

            {/* Contenu email simulé */}
            <div className="overflow-y-auto max-h-72 p-3">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100 max-w-sm mx-auto">
                    {/* Header coloré */}
                    <div className="p-4" style={{ backgroundColor: formColor }}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                </svg>
                            </div>
                            <span className="text-white font-bold text-[10px]">STAT ENQUETE</span>
                        </div>
                        <p className="text-white font-bold text-xs leading-tight">{formTitle}</p>
                        <p className="text-white/75 text-[10px] mt-1">Vous avez été invité(e) à répondre à cette enquête</p>
                    </div>

                    {/* Corps */}
                    <div className="p-4 space-y-2.5">
                        <p className="font-semibold text-[#0f172a]" style={{ fontSize: '11px' }}>Bonjour,</p>
                        <p className="text-slate-500 leading-relaxed" style={{ fontSize: '10px' }}>
                            Vous avez été invité(e) à participer à l'enquête <strong className="text-[#0f172a]">« {formTitle} »</strong>.
                        </p>

                        {/* Message personnalisé */}
                        {message ? (
                            <div className="border-l-2 rounded-r-lg px-3 py-2 bg-slate-50" style={{ borderColor: formColor }}>
                                <p className="text-slate-500 italic leading-relaxed" style={{ fontSize: '10px' }}>{message}</p>
                            </div>
                        ) : (
                            <div className="border-l-2 rounded-r-lg px-3 py-2 bg-slate-50 border-dashed border-slate-300">
                                <p className="text-slate-300 italic" style={{ fontSize: '10px' }}>Votre message personnalisé apparaîtra ici…</p>
                            </div>
                        )}

                        <p className="text-slate-500" style={{ fontSize: '10px' }}>
                            Cliquez sur le bouton ci-dessous pour accéder au formulaire.
                        </p>

                        {/* Bouton CTA */}
                        <div className="text-center py-2">
                            <div className="inline-block rounded-lg px-5 py-2 text-white font-semibold text-[10px] cursor-default"
                                style={{ backgroundColor: formColor }}>
                                Répondre à l'enquête →
                            </div>
                        </div>

                        {/* Lien fallback */}
                        <div className="border-t border-slate-100 pt-2">
                            <p className="text-slate-300 text-center" style={{ fontSize: '9px' }}>
                                Lien de réponse : https://stat-enquete.com/f/FORM-2026-XXXXXX
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 text-center">
                        <p className="text-slate-400" style={{ fontSize: '9px' }}>Envoyé via <strong>STAT ENQUETE</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spin() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
    );
}