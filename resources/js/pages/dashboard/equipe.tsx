import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Membre {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    initials: string;
    created_at: string;
    is_me: boolean;
}

interface Stats {
    total: number;
    admins: number;
    users: number;
}

interface Props {
    membres:  Membre[];
    stats:    Stats;
    filters?: { search?: string; role?: string };
    me:       number;
    success?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-violet-100 text-violet-700 border border-violet-200',
    user:  'bg-slate-100 text-slate-600 border border-slate-200',
};

const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrateur',
    user:  'Utilisateur',
};

const AVATAR_COLORS = [
    '#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2',
    '#db2777','#65a30d','#ea580c','#4f46e5',
];

const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const inputCls = (err?: string) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-[#0f172a] transition-all focus:outline-none focus:ring-2 ${
        err ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
            : 'border-slate-200 focus:border-[#2563eb] focus:ring-blue-50'
    }`;

const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Equipe({ membres, stats, filters = {}, me, success }: Props) {
    const [search,      setSearch]      = useState(filters?.search ?? '');
    const [roleFilter,  setRoleFilter]  = useState(filters?.role   ?? '');
    const [showCreate,  setShowCreate]  = useState(false);
    const [editMembre,  setEditMembre]  = useState<Membre | null>(null);
    const [delMembre,   setDelMembre]   = useState<Membre | null>(null);

    const applyFilters = (overrides: object = {}) => {
        router.get('/equipe', { search, role: roleFilter, ...overrides }, { preserveState: true });
    };

    const safeStats = {
        total:  stats?.total  ?? 0,
        admins: stats?.admins ?? 0,
        users:  stats?.users  ?? 0,
    };

    return (
        <DashboardLayout title="Équipe" subtitle="Gérez les membres et leurs accès">
            <Head title="Équipe — STAT ENQUETE" />

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
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total membres', value: safeStats.total,  color: 'text-[#0f172a]', bg: 'bg-slate-100',   icon: 'users' },
                    { label: 'Administrateurs', value: safeStats.admins, color: 'text-violet-600', bg: 'bg-violet-50', icon: 'shield' },
                    { label: 'Utilisateurs',   value: safeStats.users,  color: 'text-[#2563eb]', bg: 'bg-blue-50',    icon: 'user' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                            <StatIcon name={s.icon} color={s.color} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400">{s.label}</p>
                            <p className={`text-2xl font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Header actions ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <input type="text" value={search}
                        onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value }); }}
                        placeholder="Rechercher un membre…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0f172a] placeholder-slate-300 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                    </svg>
                </div>
                <div className="flex items-center gap-3">
                    <select value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); applyFilters({ role: e.target.value }); }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#2563eb] focus:outline-none transition-all">
                        <option value="">Tous les rôles</option>
                        <option value="admin">Administrateur</option>
                        <option value="user">Utilisateur</option>
                    </select>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/>
                        </svg>
                        Ajouter un membre
                    </button>
                </div>
            </div>

            {/* ── Grille membres ──────────────────────────────────────────── */}
            {membres.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Aucun membre trouvé</p>
                    <p className="text-xs text-slate-400">Modifiez vos filtres ou ajoutez un nouveau membre</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {membres.map(m => (
                        <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:shadow-slate-100 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 shadow-sm"
                                        style={{ backgroundColor: avatarColor(m.id) }}>
                                        {m.initials}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-bold text-[#0f172a] truncate">{m.name}</p>
                                            {m.is_me && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-[#2563eb] rounded-full flex-shrink-0">Moi</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 truncate">{m.email}</p>
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditMembre(m)}
                                        className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#2563eb] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                    {!m.is_me && (
                                        <button onClick={() => setDelMembre(m)}
                                            className="p-1.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Infos bas */}
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[m.role]}`}>
                                    {ROLE_LABELS[m.role]}
                                </span>
                                <span className="text-xs text-slate-400">
                                    Depuis le {m.created_at}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── MODAL CRÉER ─────────────────────────────────────────────── */}
            {showCreate && (
                <MembreModal
                    title="Ajouter un membre"
                    subtitle="Créer un nouveau compte utilisateur"
                    onClose={() => setShowCreate(false)}
                />
            )}

            {/* ── MODAL ÉDITER ────────────────────────────────────────────── */}
            {editMembre && (
                <MembreModal
                    title="Modifier le membre"
                    subtitle={editMembre.name}
                    membre={editMembre}
                    onClose={() => setEditMembre(null)}
                />
            )}

            {/* ── MODAL SUPPRIMER ─────────────────────────────────────────── */}
            {delMembre && (
                <DeleteModal
                    membre={delMembre}
                    onClose={() => setDelMembre(null)}
                />
            )}
        </DashboardLayout>
    );
}

// ─── Modal Créer / Éditer ─────────────────────────────────────────────────────

function MembreModal({ title, subtitle, membre, onClose }: {
    title: string;
    subtitle: string;
    membre?: Membre;
    onClose: () => void;
}) {
    const form = useForm({
        name:                  membre?.name  ?? '',
        email:                 membre?.email ?? '',
        role:                  membre?.role  ?? 'user',
        password:              '',
        password_confirmation: '',
    });

    const [showPass, setShowPass] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (membre) {
            form.put(`/equipe/${membre.id}`, {
                onSuccess: () => { form.reset(); onClose(); },
            });
        } else {
            form.post('/equipe', {
                onSuccess: () => { form.reset(); onClose(); },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-[#0f172a]">{title}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={submit} className="p-6 space-y-4">
                    {/* Nom */}
                    <div>
                        <label className={labelCls}>Nom complet *</label>
                        <input type="text" value={form.data.name}
                            onChange={e => form.setData('name', e.target.value)}
                            className={inputCls(form.errors.name)} placeholder="aphonse loic" autoFocus />
                        {form.errors.name && <p className="mt-1 text-xs text-red-500">{form.errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className={labelCls}>Adresse email *</label>
                        <input type="email" value={form.data.email}
                            onChange={e => form.setData('email', e.target.value)}
                            className={inputCls(form.errors.email)} placeholder="alphonse@exemple.com" />
                        {form.errors.email && <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>}
                    </div>

                    {/* Rôle */}
                    <div>
                        <label className={labelCls}>Rôle *</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['user', 'admin'] as const).map(r => (
                                <button key={r} type="button"
                                    onClick={() => form.setData('role', r)}
                                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                                        form.data.role === r
                                            ? 'border-[#2563eb] bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        form.data.role === r ? 'bg-[#2563eb]' : 'bg-slate-100'
                                    }`}>
                                        <svg className={`w-4 h-4 ${form.data.role === r ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {r === 'admin'
                                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            }
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold ${form.data.role === r ? 'text-[#2563eb]' : 'text-[#0f172a]'}`}>
                                            {r === 'admin' ? 'Admin' : 'Utilisateur'}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {r === 'admin' ? 'Accès complet' : 'Accès standard'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {form.errors.role && <p className="mt-1 text-xs text-red-500">{form.errors.role}</p>}
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label className={labelCls}>
                            {membre ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={form.data.password}
                                onChange={e => form.setData('password', e.target.value)}
                                className={inputCls(form.errors.password) + ' pr-12'}
                                placeholder="Minimum 8 caractères"
                            />
                            <button type="button" onClick={() => setShowPass(s => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showPass
                                        ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></>
                                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                                    }
                                </svg>
                            </button>
                        </div>
                        {form.errors.password && <p className="mt-1 text-xs text-red-500">{form.errors.password}</p>}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <button type="button" onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={form.processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors">
                            {form.processing ? <Spin /> : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                                </svg>
                            )}
                            {form.processing ? 'Enregistrement…' : membre ? 'Mettre à jour' : 'Créer le compte'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Modal Supprimer ──────────────────────────────────────────────────────────

function DeleteModal({ membre, onClose }: { membre: Membre; onClose: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = () => {
        setLoading(true);
        router.delete(`/equipe/${membre.id}`, {
            onSuccess: () => onClose(),
            onFinish: () => setLoading(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-[#0f172a]">Supprimer le membre</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Cette action est irréversible</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-[#0f172a]">{membre.name}</span> ?
                    Son compte sera définitivement supprimé.
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        Annuler
                    </button>
                    <button onClick={handleDelete} disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
                        {loading ? <Spin white /> : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6"/>
                            </svg>
                        )}
                        {loading ? 'Suppression…' : 'Supprimer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Icônes stats ─────────────────────────────────────────────────────────────

function StatIcon({ name, color }: { name: string; color: string }) {
    const cls = `w-5 h-5 ${color}`;
    switch (name) {
        case 'users':  return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
        case 'shield': return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>;
        case 'user':   return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
        default:       return null;
    }
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spin({ white = false }: { white?: boolean }) {
    return (
        <svg className={`w-4 h-4 animate-spin ${white ? 'text-white' : 'text-current'}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
    );
}