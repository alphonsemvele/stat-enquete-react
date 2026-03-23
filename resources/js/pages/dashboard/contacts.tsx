import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import DashboardLayout from './layout';

interface ContactItem { id: number; nom: string; email: string; notes: string | null; initials: string; created_at: string; }
interface PaginatedData { data: ContactItem[]; current_page: number; last_page: number; per_page: number; total: number; links: Array<{ url: string | null; label: string; active: boolean }>; }
interface Props { contacts: PaginatedData; stats: { total: number; ce_mois: number }; filters?: { search?: string }; success?: string; }

const AVATAR_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#4f46e5'];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const inputCls = (err?: string) => `w-full rounded-xl border px-4 py-2.5 text-sm text-[#0f172a] transition-all focus:outline-none focus:ring-2 ${err ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-[#2563eb] focus:ring-blue-50'}`;
const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

export default function Contacts({ contacts, stats, filters = {}, success }: Props) {
    const [search,      setSearch]      = useState(filters?.search ?? '');
    const [showCreate,  setShowCreate]  = useState(false);
    const [editContact, setEditContact] = useState<ContactItem | null>(null);
    const [delContact,  setDelContact]  = useState<ContactItem | null>(null);
    const [showImport,  setShowImport]  = useState(false);
    const [selected,    setSelected]    = useState<number[]>([]);

    const safeStats = { total: stats?.total ?? 0, ce_mois: stats?.ce_mois ?? 0 };
    const allSelected = contacts.data.length > 0 && selected.length === contacts.data.length;

    const toggleSelect = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    const toggleAll    = () => setSelected(allSelected ? [] : contacts.data.map(c => c.id));

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get('/contacts', { search: val }, { preserveState: true });
    };

    return (
        <DashboardLayout title="Contacts" subtitle="Votre carnet d'adresses">
            <Head title="Contacts — STAT ENQUETE" />

            {success && (
                <div className="mb-5 flex items-center gap-3 px-5 py-3.5 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-medium">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    {success}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <p className="text-xs font-medium text-slate-400">Total contacts</p>
                    <p className="text-2xl font-extrabold text-[#0f172a] mt-1">{safeStats.total.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <p className="text-xs font-medium text-slate-400">Ajoutés ce mois</p>
                    <p className="text-2xl font-extrabold text-[#2563eb] mt-1">+{safeStats.ce_mois}</p>
                </div>
            </div>

            {/* Header actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <input type="text" value={search} onChange={e => handleSearch(e.target.value)} placeholder="Rechercher par nom ou email…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0f172a] placeholder-slate-300 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-[#2563eb] transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        <span className="hidden sm:inline">Importer</span> CSV
                    </button>
                    <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                        <span className="hidden sm:inline">Ajouter un contact</span>
                        <span className="sm:hidden">Ajouter</span>
                    </button>
                </div>
            </div>

            {/* Barre sélection */}
            {selected.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-4 sm:px-5 py-3 bg-blue-50 border border-blue-200 rounded-2xl">
                    <span className="text-sm font-semibold text-[#2563eb]">{selected.length} contact{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { const emails = contacts.data.filter(c => selected.includes(c.id)).map(c => c.email).join(', '); navigator.clipboard.writeText(emails); }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-semibold text-[#2563eb] hover:bg-blue-100 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                            Copier emails
                        </button>
                        <button onClick={() => setSelected([])} className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors">Désélectionner</button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-4 sm:px-6 py-4 text-left w-10">
                                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer" />
                                </th>
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left">Contact</th>
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden sm:table-cell">Email</th>
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden lg:table-cell">Notes</th>
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-left hidden md:table-cell">Ajouté le</th>
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {contacts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                            </div>
                                            <p className="text-sm text-slate-400">Aucun contact trouvé</p>
                                            <button onClick={() => setShowCreate(true)} className="text-sm font-semibold text-[#2563eb] hover:underline">Ajouter votre premier contact →</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : contacts.data.map(c => (
                                <tr key={c.id} className={`hover:bg-slate-50 transition-colors group ${selected.includes(c.id) ? 'bg-blue-50/40' : ''}`}>
                                    <td className="px-4 sm:px-6 py-4">
                                        <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} className="w-4 h-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: avatarColor(c.id) }}>{c.initials}</div>
                                            <div className="min-w-0">
                                                <span className="text-sm font-semibold text-[#0f172a] block truncate">{c.nom}</span>
                                                {/* Email visible inline sur mobile */}
                                                <span className="text-xs text-slate-400 font-mono truncate sm:hidden block">{c.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden sm:table-cell">
                                        <a href={`mailto:${c.email}`} className="text-sm text-[#2563eb] hover:underline font-mono">{c.email}</a>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-400 max-w-xs truncate hidden lg:table-cell">{c.notes || <span className="text-slate-300">—</span>}</td>
                                    <td className="px-4 py-4 text-sm text-slate-400 hidden md:table-cell">{c.created_at}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setEditContact(c)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#2563eb] transition-colors" title="Modifier">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button onClick={() => navigator.clipboard.writeText(c.email)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-green-600 transition-colors hidden sm:block" title="Copier l'email">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                            </button>
                                            <button onClick={() => setDelContact(c)} className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Supprimer">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {contacts.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 px-4 sm:px-6 py-4">
                        <p className="text-sm text-slate-400"><span className="font-semibold text-[#0f172a]">{contacts.total.toLocaleString()}</span> contact{contacts.total > 1 ? 's' : ''}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {contacts.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'} preserveState
                                    className={`rounded-xl px-3 py-2 text-sm transition-colors ${link.active ? 'bg-[#2563eb] font-semibold text-white' : link.url ? 'border border-slate-200 text-slate-500 hover:bg-slate-50' : 'cursor-not-allowed border border-slate-100 text-slate-300'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showCreate  && <ContactModal onClose={() => setShowCreate(false)} />}
            {editContact && <ContactModal contact={editContact} onClose={() => setEditContact(null)} />}
            {delContact  && <DeleteModal contact={delContact} onClose={() => setDelContact(null)} />}
            {showImport  && <ImportModal onClose={() => setShowImport(false)} />}
        </DashboardLayout>
    );
}

function ContactModal({ contact, onClose }: { contact?: ContactItem; onClose: () => void }) {
    const form = useForm({ nom: contact?.nom ?? '', email: contact?.email ?? '', notes: contact?.notes ?? '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (contact) { form.put(`/contacts/${contact.id}`, { onSuccess: () => { form.reset(); onClose(); } }); }
        else          { form.post('/contacts',              { onSuccess: () => { form.reset(); onClose(); } }); }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div><h2 className="text-base font-bold text-[#0f172a]">{contact ? 'Modifier le contact' : 'Nouveau contact'}</h2><p className="text-xs text-slate-400 mt-0.5">{contact ? contact.email : 'Ajouter un contact à votre carnet'}</p></div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className={labelCls}>Nom complet <span className="text-red-500">*</span></label>
                        <input type="text" value={form.data.nom} onChange={e => form.setData('nom', e.target.value)} className={inputCls(form.errors.nom)} placeholder="Alphonse Loic" autoFocus />
                        {form.errors.nom && <p className="mt-1 text-xs text-red-500">{form.errors.nom}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Adresse email <span className="text-red-500">*</span></label>
                        <input type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} className={inputCls(form.errors.email)} placeholder="alphonse@exemple.com" />
                        {form.errors.email && <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Notes <span className="text-slate-300 font-normal normal-case">(optionnel)</span></label>
                        <textarea rows={3} value={form.data.notes} onChange={e => form.setData('notes', e.target.value)} className={`${inputCls()} resize-none`} placeholder="Informations supplémentaires…" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
                        <button type="submit" disabled={form.processing} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors">
                            {form.processing ? <Spin /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>}
                            {form.processing ? 'Enregistrement…' : contact ? 'Mettre à jour' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ImportModal({ onClose }: { onClose: () => void }) {
    const form = useForm({ csv: null as File | null });
    const fileRef = useRef<HTMLInputElement>(null);
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.csv) return;
        const data = new FormData();
        data.append('csv', form.data.csv);
        router.post('/contacts/import', data as any, { onSuccess: () => onClose() });
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div><h2 className="text-base font-bold text-[#0f172a]">Importer des contacts</h2><p className="text-xs text-slate-400 mt-0.5">Fichier CSV avec colonnes : nom, email, notes</p></div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-5">
                    <label className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center cursor-pointer transition-all ${form.data.csv ? 'border-[#2563eb] bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                        <svg className={`w-10 h-10 mb-3 ${form.data.csv ? 'text-[#2563eb]' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        {form.data.csv ? <p className="text-sm font-semibold text-[#2563eb]">{form.data.csv.name}</p> : <><p className="text-sm font-semibold text-slate-500">Glisser un fichier CSV</p><p className="text-xs text-slate-400 mt-1">ou <span className="text-[#2563eb] font-semibold">cliquer pour parcourir</span></p></>}
                        <input ref={fileRef} type="file" accept=".csv,.txt" className="sr-only" onChange={e => form.setData('csv', e.target.files?.[0] ?? null)} />
                    </label>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Format attendu :</p>
                        <code className="text-xs text-slate-600 font-mono block">nom,email,notes</code>
                        <code className="text-xs text-slate-400 font-mono block mt-1">Alphonse,alphonse@mail.com,Client VIP</code>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
                        <button type="submit" disabled={!form.data.csv || form.processing} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors">
                            {form.processing ? <Spin /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>}
                            {form.processing ? 'Import en cours…' : 'Importer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteModal({ contact, onClose }: { contact: ContactItem; onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const handleDelete = () => { setLoading(true); router.delete(`/contacts/${contact.id}`, { onSuccess: () => onClose(), onFinish: () => setLoading(false) }); };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0"><svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></div>
                    <div><h2 className="font-bold text-[#0f172a]">Supprimer le contact</h2><p className="text-xs text-slate-400">{contact.email}</p></div>
                </div>
                <p className="text-sm text-slate-600 mb-6">Supprimer <span className="font-semibold text-[#0f172a]">{contact.nom}</span> de votre carnet d'adresses ?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
                    <button onClick={handleDelete} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
                        {loading ? <Spin white /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6"/></svg>}
                        {loading ? 'Suppression…' : 'Supprimer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Spin({ white = false }: { white?: boolean }) {
    return <svg className={`w-4 h-4 animate-spin ${white ? 'text-white' : 'text-current'}`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}