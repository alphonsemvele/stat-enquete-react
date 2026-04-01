import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from './layout';

interface UserItem {
    id: number; name: string; email: string; role: string;
    is_blocked: boolean; forms_count: number; created_at: string; initials: string;
}
interface PaginatedData {
    data: UserItem[]; total: number; last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
interface Props {
    users: PaginatedData;
    stats: { total: number; admins: number; users: number };
    filters?: { search?: string; role?: string };
}

const ROLE_CONFIG = {
    admin: { label: 'Admin',        cls: 'bg-amber-100 text-amber-700 border border-amber-200',  dot: 'bg-amber-500'  },
    user:  { label: 'Utilisateur',  cls: 'bg-slate-100 text-slate-600 border border-slate-200',  dot: 'bg-slate-400'  },
};

function RoleBadge({ role }: { role: string }) {
    const cfg = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.user;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
            {cfg.label}
        </span>
    );
}

export default function AdminRoles({ users, stats, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role,   setRole]   = useState(filters.role   ?? '');
    const [confirm, setConfirm] = useState<{ user: UserItem; action: 'promote' | 'demote' } | null>(null);

    const apply = (o: object = {}) =>
        router.get('/admin/roles', { search, role, ...o }, { preserveState: true });

    const promote = (u: UserItem) => {
        router.post(`/admin/roles/${u.id}/promote`, {}, { preserveScroll: true, onSuccess: () => setConfirm(null) });
    };
    const demote = (u: UserItem) => {
        router.post(`/admin/roles/${u.id}/demote`, {}, { preserveScroll: true, onSuccess: () => setConfirm(null) });
    };

    return (
        <AdminLayout title="Gestion des rôles" subtitle="Gérez les permissions des utilisateurs">
            <Head title="Admin — Rôles" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
                    <p className="text-2xl font-extrabold text-[#0f172a]">{stats.total}</p>
                    <p className="text-xs text-slate-400 mt-1">Total utilisateurs</p>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 text-center">
                    <p className="text-2xl font-extrabold text-amber-700">{stats.admins}</p>
                    <p className="text-xs text-amber-500 mt-1">Administrateurs</p>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 text-center">
                    <p className="text-2xl font-extrabold text-slate-600">{stats.users}</p>
                    <p className="text-xs text-slate-400 mt-1">Utilisateurs</p>
                </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-5 text-sm text-blue-700">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <div>
                    <strong>Admin</strong> — accès complet à l'interface d'administration, gestion des utilisateurs, enquêtes et réponses.<br/>
                    <strong>Utilisateur</strong> — accès uniquement au dashboard personnel.
                </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <input type="text" value={search}
                        onChange={e => { setSearch(e.target.value); apply({ search: e.target.value }); }}
                        placeholder="Rechercher par nom ou email…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#2563eb] focus:outline-none transition-all"/>
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
                </div>
                <div className="flex gap-2">
                    {['', 'admin', 'user'].map(r => (
                        <button key={r} onClick={() => { setRole(r); apply({ role: r }); }}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                                role === r
                                    ? r === 'admin' ? 'bg-amber-500 text-white border-amber-500'
                                                    : r === 'user' ? 'bg-slate-700 text-white border-slate-700'
                                                                   : 'bg-[#2563eb] text-white border-[#2563eb]'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}>
                            {r === '' ? 'Tous' : r === 'admin' ? '👑 Admins' : '👤 Utilisateurs'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Utilisateur</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden md:table-cell">Enquêtes</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden lg:table-cell">Inscrit le</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Rôle actuel</th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-400">
                                        Aucun utilisateur trouvé.
                                    </td>
                                </tr>
                            ) : users.data.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                                                u.role === 'admin' ? 'bg-amber-500' : 'bg-[#2563eb]'
                                            }`}>
                                                {u.initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#0f172a] truncate">{u.name}</p>
                                                <p className="text-xs text-slate-400 font-mono truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <span className="text-sm font-semibold text-[#2563eb]">{u.forms_count}</span>
                                        <span className="text-xs text-slate-400 ml-1">enquête{u.forms_count > 1 ? 's' : ''}</span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-400 hidden lg:table-cell">{u.created_at}</td>
                                    <td className="px-5 py-4 text-center">
                                        <RoleBadge role={u.role} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {u.role === 'user' ? (
                                                <button onClick={() => setConfirm({ user: u, action: 'promote' })}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                                                    Promouvoir Admin
                                                </button>
                                            ) : (
                                                <button onClick={() => setConfirm({ user: u, action: 'demote' })}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold hover:bg-slate-100 transition-colors">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                                                    Rétrograder
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                        <p className="text-sm text-slate-400">
                            <span className="font-semibold text-[#0f172a]">{users.total}</span> utilisateur(s)
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
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

            {/* Modal confirmation */}
            {confirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setConfirm(null)}>
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h3 className="text-base font-bold text-[#0f172a]">
                                {confirm.action === 'promote' ? '👑 Promouvoir en Admin' : '👤 Rétrograder en Utilisateur'}
                            </h3>
                        </div>
                        <div className="px-6 py-5">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                                    confirm.action === 'promote' ? 'bg-[#2563eb]' : 'bg-amber-500'
                                }`}>
                                    {confirm.user.initials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#0f172a]">{confirm.user.name}</p>
                                    <p className="text-xs text-slate-400">{confirm.user.email}</p>
                                </div>
                                <div className="ml-auto">
                                    <RoleBadge role={confirm.user.role} />
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">
                                {confirm.action === 'promote'
                                    ? `Cet utilisateur aura accès à toute l'interface d'administration.`
                                    : `Cet utilisateur perdra l'accès à l'interface d'administration.`
                                }
                            </p>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                            <button onClick={() => setConfirm(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                Annuler
                            </button>
                            <button onClick={() => confirm.action === 'promote' ? promote(confirm.user) : demote(confirm.user)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
                                    confirm.action === 'promote'
                                        ? 'bg-amber-500 hover:bg-amber-600'
                                        : 'bg-slate-700 hover:bg-slate-800'
                                }`}>
                                {confirm.action === 'promote' ? 'Promouvoir' : 'Rétrograder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}