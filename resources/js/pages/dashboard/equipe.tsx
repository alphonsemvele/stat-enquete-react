import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

interface Membre {
    id: number; name: string; email: string; role: 'membre' | 'admin';
    initials: string; created_at: string; is_me: boolean;
}
interface InvitationAttente {
    id: number; email: string; role: 'membre' | 'admin'; created_at: string; token: string;
}
interface Stats { total: number; admins: number; membres: number; en_attente: number; }
interface Props {
    membres: Membre[];
    invitations_en_attente: InvitationAttente[];
    stats: Stats;
    filters?: { search?: string; role?: string };
    me: number;
}

const ROLE_COLORS = {
    admin:  'bg-amber-100 text-amber-700 border border-amber-200',
    membre: 'bg-blue-100 text-[#2563eb] border border-blue-200',
};
const ROLE_LABELS = { admin: 'Administrateur', membre: 'Membre' };
const AVATAR_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#65a30d'];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

// ── Modal invitation ──────────────────────────────────────────────────────────
function InviterModal({ onClose }: { onClose: () => void }) {
    const form = useForm({ email: '', role: 'membre' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/equipe', { onSuccess: () => { form.reset(); onClose(); } });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-[#0f172a]">Inviter un membre</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Un email d'invitation lui sera envoyé</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} noValidate>
                    <div className="px-6 py-5 space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Adresse email <span className="text-red-500">*</span>
                            </label>
                            <input type="email" value={form.data.email}
                                onChange={e => form.setData('email', e.target.value)}
                                placeholder="collegue@exemple.com" autoFocus
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all ${
                                    form.errors.email ? 'border-red-300' : 'border-slate-200 focus:border-[#2563eb]'
                                }`}/>
                            {form.errors.email && <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>}
                        </div>

                        {/* Rôle */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Rôle dans l'équipe <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'membre', label: '👤 Membre',        desc: 'Accès en lecture', color: 'border-[#2563eb] bg-blue-50', labelColor: 'text-[#2563eb]' },
                                    { value: 'admin',  label: '👑 Administrateur', desc: 'Accès complet',   color: 'border-amber-400 bg-amber-50', labelColor: 'text-amber-700' },
                                ].map(r => (
                                    <label key={r.value} className={`flex flex-col gap-1 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                        form.data.role === r.value ? r.color : 'border-slate-200 hover:border-slate-300'
                                    }`}>
                                        <input type="radio" name="role" value={r.value}
                                            checked={form.data.role === r.value}
                                            onChange={() => form.setData('role', r.value)}
                                            className="sr-only"/>
                                        <span className={`text-sm font-bold ${form.data.role === r.value ? r.labelColor : 'text-[#0f172a]'}`}>
                                            {r.label}
                                        </span>
                                        <span className="text-xs text-slate-400">{r.desc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1.5">
                            <p className="font-semibold text-slate-600">Comment ça fonctionne :</p>
                            <p>✉️ <strong>Email existant</strong> — La personne reçoit une invitation avec un lien Accepter / Refuser.</p>
                            <p>🆕 <strong>Email inconnu</strong> — La personne reçoit un email pour créer son compte et rejoindre l'équipe.</p>
                        </div>

                    </div>

                    <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Annuler
                        </button>
                        <button type="submit" disabled={form.processing}
                            className="flex-1 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-bold hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2">
                            {form.processing
                                ? <><Spin /> Envoi…</>
                                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg> Envoyer l'invitation</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Equipe({ membres, invitations_en_attente, stats, filters = {}, me }: Props) {
    const [search,     setSearch]     = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role   ?? '');
    const [showInvite, setShowInvite] = useState(false);
    const [editId,     setEditId]     = useState<number | null>(null);

    const apply = (o: object = {}) =>
        router.get('/equipe', { search, role: roleFilter, ...o }, { preserveState: true });

    const annulerInvitation = (id: number) => {
        if (!confirm('Annuler cette invitation ?')) return;
        router.delete(`/equipe/invitation/${id}/annuler`, { preserveScroll: true });
    };

    const retirerMembre = (id: number) => {
        if (!confirm('Retirer ce membre de l\'équipe ?')) return;
        router.delete(`/equipe/${id}`, { preserveScroll: true });
    };

    const changerRole = (id: number, role: string) =>
        router.put(`/equipe/${id}`, { role }, { preserveScroll: true });

    const safeStats = stats ?? { total: 0, admins: 0, membres: 0, en_attente: 0 };

    return (
        <DashboardLayout title="Équipe" subtitle="Gérez les membres et leurs accès">
            <Head title="Équipe — STAT ENQUETE" />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Membres actifs', value: safeStats.total,      color: 'text-[#0f172a]',  bg: 'bg-slate-50'  },
                    { label: 'Admins',          value: safeStats.admins,     color: 'text-amber-600',  bg: 'bg-amber-50'  },
                    { label: 'Membres',         value: safeStats.membres,    color: 'text-[#2563eb]',  bg: 'bg-blue-50'   },
                    { label: 'En attente',      value: safeStats.en_attente, color: 'text-slate-500',  bg: 'bg-slate-50'  },
                ].map(s => (
                    <div key={s.label} className={`rounded-2xl border border-slate-100 p-4 sm:p-5 ${s.bg}`}>
                        <p className="text-xs font-medium text-slate-400">{s.label}</p>
                        <p className={`text-2xl font-extrabold tracking-tight mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Header actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <input type="text" value={search}
                        onChange={e => { setSearch(e.target.value); apply({ search: e.target.value }); }}
                        placeholder="Rechercher un membre…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all"/>
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
                </div>
                <div className="flex items-center gap-2">
                    <select value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); apply({ role: e.target.value }); }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none">
                        <option value="">Tous les rôles</option>
                        <option value="admin">Administrateur</option>
                        <option value="membre">Membre</option>
                    </select>
                    <button onClick={() => setShowInvite(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                        <span className="hidden sm:inline">Inviter un membre</span>
                        <span className="sm:hidden">Inviter</span>
                    </button>
                </div>
            </div>

            {/* Membres actifs */}
            <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Membres actifs ({membres.length})
                </h3>

                {membres.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">Aucun membre pour le moment</p>
                        <button onClick={() => setShowInvite(true)} className="text-sm font-semibold text-[#2563eb] hover:underline">
                            Envoyer une invitation →
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {membres.map(m => (
                            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                            style={{ backgroundColor: avatarColor(m.id) }}>
                                            {m.initials}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-bold text-[#0f172a] truncate">{m.name}</p>
                                                {m.is_me && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-[#2563eb] rounded-full flex-shrink-0">Moi</span>}
                                            </div>
                                            <p className="text-xs text-slate-400 truncate">{m.email}</p>
                                        </div>
                                    </div>
                                    {!m.is_me && (
                                        <button onClick={() => retirerMembre(m.id)}
                                            className="p-1.5 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    {m.is_me ? (
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[m.role]}`}>
                                            {ROLE_LABELS[m.role]}
                                        </span>
                                    ) : (
                                        <select value={m.role} onChange={e => changerRole(m.id, e.target.value)}
                                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${ROLE_COLORS[m.role]}`}>
                                            <option value="membre">Membre</option>
                                            <option value="admin">Administrateur</option>
                                        </select>
                                    )}
                                    <span className="text-xs text-slate-400">Depuis {m.created_at}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Invitations en attente */}
            {invitations_en_attente.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Invitations en attente ({invitations_en_attente.length})
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        {invitations_en_attente.map((inv, i) => (
                            <div key={inv.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-slate-50' : ''}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold flex-shrink-0">
                                        {inv.email.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-[#0f172a] truncate font-mono">{inv.email}</p>
                                        <p className="text-xs text-slate-400">Envoyée le {inv.created_at}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full hidden sm:inline-flex ${ROLE_COLORS[inv.role]}`}>
                                        {ROLE_LABELS[inv.role]}
                                    </span>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                                        En attente
                                    </span>
                                    <button onClick={() => annulerInvitation(inv.id)}
                                        className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Annuler">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showInvite && <InviterModal onClose={() => setShowInvite(false)} />}
        </DashboardLayout>
    );
}

function Spin() {
    return <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}