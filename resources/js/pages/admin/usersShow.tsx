// ══════════════════════════════════════════════════════
// resources/js/pages/admin/users/show.tsx
// ══════════════════════════════════════════════════════
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from './layout';

interface UserDetail {
    id: number; name: string; email: string; role: string;
    is_blocked: boolean; created_at: string; initials: string;
}
interface EnqueteItem {
    id: number; title: string; color: string; reference: string;
    statut: string; total_reponses: number; created_at: string;
}

export function AdminUserShow({ user, enquetes, stats }: {
    user: UserDetail;
    enquetes: EnqueteItem[];
    stats: { total_enquetes: number; total_reponses: number; enquetes_actives: number; membre_depuis: string };
}) {
    const toggleBlock = () => router.post(`/admin/users/${user.id}/toggle-block`, {}, { preserveScroll: true });
    const changeRole  = (role: string) => router.patch(`/admin/users/${user.id}/role`, { role }, { preserveScroll: true });

    return (
        <AdminLayout title={user.name} subtitle={user.email}>
            <Head title={`Admin — ${user.name}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                {/* Profil */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-3 ${user.is_blocked ? 'bg-slate-400' : 'bg-[#2563eb]'}`}>
                        {user.initials}
                    </div>
                    <h2 className="text-base font-bold text-[#0f172a]">{user.name}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                    <div className="flex gap-2 mt-3 flex-wrap justify-center">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {user.role === 'admin' ? '👑 Admin' : 'Utilisateur'}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.is_blocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                            {user.is_blocked ? '🔒 Bloqué' : '✅ Actif'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-3">Membre depuis le {user.created_at}</p>

                    <div className="flex gap-2 mt-4 w-full">
                        <button onClick={toggleBlock}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${user.is_blocked ? 'border-green-200 text-green-700 hover:bg-green-50' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}`}>
                            {user.is_blocked ? 'Débloquer' : 'Bloquer'}
                        </button>
                        <select onChange={e => changeRole(e.target.value)} defaultValue={user.role}
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-white focus:outline-none cursor-pointer">
                            <option value="user">→ Utilisateur</option>
                            <option value="admin">→ Admin</option>
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
                    {[
                        { label: 'Enquêtes',         value: stats.total_enquetes,   color: 'text-[#2563eb]' },
                        { label: 'Actives',           value: stats.enquetes_actives, color: 'text-green-600' },
                        { label: 'Total réponses',    value: stats.total_reponses,   color: 'text-purple-600' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4">
                            <p className="text-xs text-slate-400">{s.label}</p>
                            <p className={`text-2xl font-extrabold tracking-tight mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enquêtes de l'utilisateur */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-[#0f172a]">Enquêtes de {user.name}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Titre</th>
                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden sm:table-cell">Référence</th>
                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Statut</th>
                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Réponses</th>
                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden md:table-cell">Créée le</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {enquetes.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">Aucune enquête.</td></tr>
                            ) : enquetes.map(e => (
                                <tr key={e.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg flex-shrink-0" style={{ backgroundColor: e.color }}/>
                                            <span className="text-sm font-medium text-[#0f172a] truncate max-w-[180px]">{e.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 hidden sm:table-cell"><code className="text-xs text-slate-400">{e.reference}</code></td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${e.statut === 'Active' ? 'bg-green-100 text-green-700' : e.statut === 'Fermée' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                                            {e.statut}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-sm font-bold text-[#2563eb]">{e.total_reponses}</td>
                                    <td className="px-5 py-3 text-xs text-slate-400 hidden md:table-cell">{e.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4">
                <Link href="/admin/users" className="text-sm text-slate-400 hover:text-[#2563eb] transition-colors">← Retour à la liste</Link>
            </div>
        </AdminLayout>
    );
}

export default AdminUserShow;