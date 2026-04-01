import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from './layout';

interface UserItem {
    id: number; name: string; email: string; role: string;
    is_blocked: boolean; forms_count: number; created_at: string; initials: string;
}
interface PaginatedData {
    data: UserItem[]; current_page: number; last_page: number; total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
interface Props {
    users: PaginatedData;
    filters?: { search?: string; role?: string; statut?: string };
}

// ── Modal création ────────────────────────────────────────────────────────────
function CreateUserModal({ onClose }: { onClose: () => void }) {
    const form = useForm({ name: '', email: '', password: '', role: 'user' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/users', {
            onSuccess: () => { form.reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-[#0f172a]">Nouvel utilisateur</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Un email avec les identifiants lui sera envoyé</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="px-6 py-5 space-y-4">

                        {/* Nom */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Nom complet <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={form.data.name}
                                onChange={e => form.setData('name', e.target.value)}
                                placeholder="Alphonse loic"
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all ${form.errors.name ? 'border-red-300' : 'border-slate-200 focus:border-[#2563eb]'}`}/>
                            {form.errors.name && <p className="mt-1 text-xs text-red-500">{form.errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input type="email" value={form.data.email}
                                onChange={e => form.setData('email', e.target.value)}
                                placeholder="alphonse@exemple.com"
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all ${form.errors.email ? 'border-red-300' : 'border-slate-200 focus:border-[#2563eb]'}`}/>
                            {form.errors.email && <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>}
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={form.data.password}
                                onChange={e => form.setData('password', e.target.value)}
                                placeholder="Minimum 8 caractères"
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all ${form.errors.password ? 'border-red-300' : 'border-slate-200 focus:border-[#2563eb]'}`}/>
                            {form.errors.password && <p className="mt-1 text-xs text-red-500">{form.errors.password}</p>}
                            <p className="mt-1 text-xs text-slate-400">Ce mot de passe sera envoyé à l'utilisateur par email.</p>
                        </div>

                        {/* Rôle */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Rôle <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'user',  label: '👤 Utilisateur', desc: 'Accès dashboard uniquement' },
                                    { value: 'admin', label: '👑 Admin',        desc: 'Accès complet' },
                                ].map(r => (
                                    <label key={r.value} className={`flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        form.data.role === r.value
                                            ? r.value === 'admin' ? 'border-amber-400 bg-amber-50' : 'border-[#2563eb] bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}>
                                        <input type="radio" name="role" value={r.value}
                                            checked={form.data.role === r.value}
                                            onChange={() => form.setData('role', r.value)}
                                            className="sr-only"/>
                                        <span className={`text-sm font-bold ${form.data.role === r.value ? (r.value === 'admin' ? 'text-amber-700' : 'text-[#2563eb]') : 'text-[#0f172a]'}`}>
                                            {r.label}
                                        </span>
                                        <span className="text-xs text-slate-400">{r.desc}</span>
                                    </label>
                                ))}
                            </div>
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
                                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Création…</>
                                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg> Créer et envoyer</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function AdminUsers({ users, filters = {} }: Props) {
    const [search,     setSearch]     = useState(filters.search  ?? '');
    const [role,       setRole]       = useState(filters.role    ?? '');
    const [statut,     setStatut]     = useState(filters.statut  ?? '');
    const [showCreate, setShowCreate] = useState(false);

    const { props } = usePage<any>();
    const success = props.flash?.success;
    const error   = props.flash?.error;

    const apply = (o: object = {}) =>
        router.get('/admin/users', { search, role, statut, ...o }, { preserveState: true });

    const toggleBlock = (id: number) =>
        router.post(`/admin/users/${id}/toggle-block`, {}, { preserveScroll: true });

    const deleteUser = (id: number) => {
        if (!confirm('Supprimer cet utilisateur ?')) return;
        router.delete(`/admin/users/${id}`, { preserveScroll: true });
    };

    const changeRole = (id: number, newRole: string) =>
        router.patch(`/admin/users/${id}/role`, { role: newRole }, { preserveScroll: true });

    return (
        <AdminLayout title="Utilisateurs" subtitle={`${users.total} utilisateur(s) enregistré(s)`}>
            <Head title="Admin — Utilisateurs" />

            {/* Flash messages */}
            {success && (
                <div className="mb-5 flex items-center gap-3 px-5 py-3.5 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-medium">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-5 flex items-center gap-3 px-5 py-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    {error}
                </div>
            )}

            {/* Filtres + bouton créer */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <input type="text" value={search}
                        onChange={e => { setSearch(e.target.value); apply({ search: e.target.value }); }}
                        placeholder="Rechercher par nom ou email…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#2563eb] focus:outline-none transition-all"/>
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
                </div>
                <select value={role} onChange={e => { setRole(e.target.value); apply({ role: e.target.value }); }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none">
                    <option value="">Tous les rôles</option>
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                </select>
                <select value={statut} onChange={e => { setStatut(e.target.value); apply({ statut: e.target.value }); }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none">
                    <option value="">Tous les statuts</option>
                    <option value="actif">Actif</option>
                    <option value="bloque">Bloqué</option>
                </select>
                <button onClick={() => setShowCreate(true)}
                    className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    Nouvel utilisateur
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Utilisateur</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden sm:table-cell">Rôle</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden md:table-cell">Enquêtes</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden lg:table-cell">Inscrit le</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Statut</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                            </div>
                                            <p className="text-sm text-slate-400">Aucun utilisateur trouvé</p>
                                            <button onClick={() => setShowCreate(true)} className="text-sm font-semibold text-[#2563eb] hover:underline">
                                                Créer le premier utilisateur →
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.data.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                                                u.is_blocked ? 'bg-slate-400' : u.role === 'admin' ? 'bg-amber-500' : 'bg-[#2563eb]'
                                            }`}>
                                                {u.initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#0f172a] truncate">{u.name}</p>
                                                <p className="text-xs text-slate-400 font-mono truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden sm:table-cell">
                                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                                                u.role === 'admin'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                            <option value="user">Utilisateur</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <Link href={`/admin/users/${u.id}`} className="text-sm font-semibold text-[#2563eb] hover:underline">
                                            {u.forms_count}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-400 hidden lg:table-cell">{u.created_at}</td>
                                    <td className="px-5 py-4">
                                        {u.is_blocked
                                            ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200">● Bloqué</span>
                                            : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">● Actif</span>
                                        }
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/users/${u.id}`}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#0f172a] transition-colors" title="Voir">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </Link>
                                            <button onClick={() => toggleBlock(u.id)}
                                                className={`p-2 rounded-xl transition-colors ${u.is_blocked ? 'text-green-500 hover:bg-green-50' : 'text-amber-500 hover:bg-amber-50'}`}
                                                title={u.is_blocked ? 'Débloquer' : 'Bloquer'}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {u.is_blocked
                                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 018 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                                    }
                                                </svg>
                                            </button>
                                            {u.role !== 'admin' && (
                                                <button onClick={() => deleteUser(u.id)}
                                                    className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Supprimer">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                        <p className="text-sm text-slate-400">
                            <span className="font-semibold text-[#0f172a]">{users.total}</span> utilisateur(s)
                        </p>
                        <div className="flex items-center gap-1.5">
                            {users.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'} preserveState
                                    className={`rounded-xl px-3 py-2 text-sm transition-colors ${
                                        link.active ? 'bg-[#2563eb] text-white font-semibold'
                                                    : link.url ? 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                                                               : 'cursor-not-allowed border border-slate-100 text-slate-300'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}/>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
        </AdminLayout>
    );
}