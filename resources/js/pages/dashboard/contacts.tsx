import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import DashboardLayout from './layout';

interface ContactItem { id: number; nom: string; email: string; notes: string | null; initials: string; created_at: string; }
interface PaginatedData { data: ContactItem[]; current_page: number; last_page: number; per_page: number; total: number; links: Array<{ url: string | null; label: string; active: boolean }>; }
interface Props { contacts: PaginatedData; stats: { total: number; ce_mois: number }; filters?: { search?: string }; success?: string; import_errors?: string[]; }

const AVATAR_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#4f46e5'];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const inputCls = (err?: string) => `w-full rounded-xl border px-4 py-2.5 text-sm text-[#0f172a] transition-all focus:outline-none focus:ring-2 ${err ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-[#2563eb] focus:ring-blue-50'}`;
const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

export default function Contacts({ contacts, stats, filters = {}, success, import_errors }: Props) {
    const [search,      setSearch]      = useState(filters?.search ?? '');
    const [showCreate,  setShowCreate]  = useState(false);
    const [editContact, setEditContact] = useState<ContactItem | null>(null);
    const [delContact,  setDelContact]  = useState<ContactItem | null>(null);
    const [showImport,  setShowImport]  = useState(false);
    const [selected,    setSelected]    = useState<number[]>([]);

    const safeStats   = { total: stats?.total ?? 0, ce_mois: stats?.ce_mois ?? 0 };
    const allSelected = contacts.data.length > 0 && selected.length === contacts.data.length;

    const toggleSelect = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    const toggleAll    = () => setSelected(allSelected ? [] : contacts.data.map(c => c.id));

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get('/contacts', { search: val }, { preserveState: true });
    };

    return (
        <DashboardLayout title="Contacts" subtitle="Votre carnet d'adresses">
            <Head title="Contacts — STAT ENQUETE"/>

            {/* Flash success */}
            {success && (
                <div className="mb-5 flex items-start gap-3 px-5 py-3.5 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-medium">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    <div>
                        <p>{success}</p>
                        {import_errors && import_errors.length > 0 && (
                            <ul className="mt-2 space-y-0.5">
                                {import_errors.slice(0, 5).map((e, i) => <li key={i} className="text-xs text-amber-600">⚠ {e}</li>)}
                                {import_errors.length > 5 && <li className="text-xs text-slate-400">…et {import_errors.length - 5} autre(s)</li>}
                            </ul>
                        )}
                    </div>
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
                    <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
                        placeholder="Rechercher par nom ou email…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0f172a] placeholder-slate-300 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all"/>
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setShowImport(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-[#2563eb] transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        Importer
                    </button>
                    <button onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors">
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
                        <button onClick={() => {
                            const emails = contacts.data.filter(c => selected.includes(c.id)).map(c => c.email).join(', ');
                            navigator.clipboard.writeText(emails);
                        }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-semibold text-[#2563eb] hover:bg-blue-100 transition-colors">
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
                                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer"/>
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
                                        <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} className="w-4 h-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer"/>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: avatarColor(c.id) }}>{c.initials}</div>
                                            <div className="min-w-0">
                                                <span className="text-sm font-semibold text-[#0f172a] block truncate">{c.nom}</span>
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
                                    dangerouslySetInnerHTML={{ __html: link.label }}/>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showCreate  && <ContactModal onClose={() => setShowCreate(false)}/>}
            {editContact && <ContactModal contact={editContact} onClose={() => setEditContact(null)}/>}
            {delContact  && <DeleteModal  contact={delContact}  onClose={() => setDelContact(null)}/>}
            {showImport  && <ImportModal  onClose={() => setShowImport(false)}/>}
        </DashboardLayout>
    );
}

// ─── Modal Import ─────────────────────────────────────────────────────────────
function ImportModal({ onClose }: { onClose: () => void }) {
    const [file,     setFile]     = useState<File | null>(null);
    const [loading,  setLoading]  = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [tab,      setTab]      = useState<'upload' | 'guide'>('upload');
    const fileRef = useRef<HTMLInputElement>(null);

    const COLUMNS = [
        { name: 'nom',   required: true,  desc: 'Prénom et nom complet',       ex: 'Marie Dupont' },
        { name: 'email', required: true,  desc: 'Adresse email valide',         ex: 'marie@exemple.com' },
        { name: 'notes', required: false, desc: 'Informations complémentaires', ex: 'Client VIP' },
    ];

    const handleFile = (f: File | null) => {
        if (!f) return;
        const ext = f.name.split('.').pop()?.toLowerCase();
        if (!['csv', 'txt', 'xlsx', 'xls'].includes(ext ?? '')) {
            alert('Format non supporté. Utilisez CSV ou Excel (.xlsx, .xls)');
            return;
        }
        setFile(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        handleFile(e.dataTransfer.files[0] ?? null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        const data = new FormData();
        data.append('file', file);
        router.post('/contacts/import', data as any, {
            onSuccess: () => onClose(),
            onFinish:  () => setLoading(false),
        });
    };

    const extBadge = (f: File) => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return (ext === 'csv' || ext === 'txt')
            ? { label: 'CSV',  color: '#059669', bg: '#f0fdf4' }
            : { label: 'XLSX', color: '#2563eb', bg: '#eff6ff' };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-[#0f172a]">Importer des contacts</h2>
                        <p className="text-xs text-slate-400 mt-0.5">CSV ou Excel — jusqu'à 5 Mo</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-6">
                    {[{k:'upload',l:'Importer'},{k:'guide',l:'Guide des colonnes'}].map(({k,l}) => (
                        <button key={k} onClick={() => setTab(k as any)}
                            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all -mb-px ${tab===k?'border-[#2563eb] text-[#2563eb]':'border-transparent text-slate-400 hover:text-slate-600'}`}>
                            {l}
                        </button>
                    ))}
                </div>

                {tab === 'upload' ? (
                    <form onSubmit={submit} className="p-6 space-y-5">

                        {/* Templates */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">1. Téléchargez un modèle</p>
                            <div className="grid grid-cols-2 gap-3">
                                <a href="/contacts/template/excel" target="_blank"
                                    className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-200 hover:border-[#2563eb] hover:bg-blue-50 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                                        <svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#0f172a] group-hover:text-[#2563eb] transition-colors">Modèle Excel</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">.xlsx avec instructions</p>
                                    </div>
                                    <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#2563eb] ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                </a>
                                <a href="/contacts/template/csv" target="_blank"
                                    className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center flex-shrink-0 transition-colors">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8m-8 4h4"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#0f172a] group-hover:text-green-700 transition-colors">Modèle CSV</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">.csv simple</p>
                                    </div>
                                    <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-green-500 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                </a>
                            </div>
                        </div>

                        {/* Zone dépôt */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">2. Importez votre fichier</p>
                            <label
                                className={`relative block border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                    dragOver ? 'border-[#2563eb] bg-blue-50'
                                    : file    ? 'border-green-300 bg-green-50'
                                             : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                }`}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}>

                                {file ? (
                                    <div className="flex items-center gap-4 p-5">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: extBadge(file).bg }}>
                                            <span className="text-xs font-black" style={{ color: extBadge(file).color }}>{extBadge(file).label}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-[#0f172a] truncate">{file.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} Ko</p>
                                        </div>
                                        <button type="button"
                                            onClick={e => { e.preventDefault(); setFile(null); if(fileRef.current) fileRef.current.value=''; }}
                                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors flex-shrink-0">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-8 px-4 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-600">Glissez votre fichier ici</p>
                                        <p className="text-xs text-slate-400 mt-1">ou <span className="text-[#2563eb] font-semibold">cliquez pour parcourir</span></p>
                                        <div className="flex items-center gap-2 mt-3">
                                            {['CSV','XLSX','XLS'].map(f => (
                                                <span key={f} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">.{f.toLowerCase()}</span>
                                            ))}
                                            <span className="text-[10px] text-slate-400">max 5 Mo</span>
                                        </div>
                                    </div>
                                )}
                                <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx,.xls" className="sr-only"
                                    onChange={e => handleFile(e.target.files?.[0] ?? null)}/>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-1">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
                            <button type="submit" disabled={!file || loading}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors">
                                {loading ? <><Spin white/> Import en cours…</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>Importer</>}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Guide */
                    <div className="p-6 space-y-4">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Votre fichier doit avoir une première ligne avec les noms de colonnes ci-dessous.
                        </p>

                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Colonne</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Exemple</th>
                                        <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-20">Requis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {COLUMNS.map(col => (
                                        <tr key={col.name} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <code className="text-xs font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded">{col.name}</code>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">{col.desc}</td>
                                            <td className="px-4 py-3 text-xs text-slate-400 font-mono">{col.ex}</td>
                                            <td className="px-4 py-3 text-center">
                                                {col.required
                                                    ? <span className="inline-flex w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold items-center justify-center mx-auto">✓</span>
                                                    : <span className="inline-flex w-5 h-5 rounded-full bg-slate-100 text-slate-400 text-[10px] items-center justify-center mx-auto">—</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Exemple CSV */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Exemple CSV</p>
                            <div className="bg-[#0f172a] rounded-xl p-4 overflow-x-auto">
                                <pre className="text-xs text-[#a5f3fc] font-mono whitespace-pre">{`nom,email,notes\nMarie Dupont,marie@exemple.com,Client VIP\nJean Martin,jean@exemple.com,Prospect`}</pre>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-amber-700 mb-1.5">⚠ Points importants</p>
                            <ul className="text-xs text-amber-600 space-y-1">
                                <li>→ Les doublons (même email) seront automatiquement ignorés</li>
                                <li>→ La première ligne doit contenir les noms de colonnes</li>
                                <li>→ Pour Excel : utilisez l'onglet "Contacts" du fichier téléchargé</li>
                            </ul>
                        </div>

                        <button onClick={() => setTab('upload')}
                            className="w-full py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors">
                            Importer un fichier →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Modal Contact ────────────────────────────────────────────────────────────
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
                    <div>
                        <h2 className="text-base font-bold text-[#0f172a]">{contact ? 'Modifier le contact' : 'Nouveau contact'}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{contact ? contact.email : 'Ajouter un contact à votre carnet'}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className={labelCls}>Nom complet <span className="text-red-500">*</span></label>
                        <input type="text" value={form.data.nom} onChange={e => form.setData('nom', e.target.value)} className={inputCls(form.errors.nom)} placeholder="Marie" autoFocus/>
                        {form.errors.nom && <p className="mt-1 text-xs text-red-500">{form.errors.nom}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Adresse email <span className="text-red-500">*</span></label>
                        <input type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} className={inputCls(form.errors.email)} placeholder="marie@exemple.com"/>
                        {form.errors.email && <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Notes <span className="text-slate-300 font-normal normal-case">(optionnel)</span></label>
                        <textarea rows={3} value={form.data.notes} onChange={e => form.setData('notes', e.target.value)} className={`${inputCls()} resize-none`} placeholder="Informations supplémentaires…"/>
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
                        <button type="submit" disabled={form.processing} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors">
                            {form.processing
                                ? <><Spin/> Enregistrement…</>
                                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>{contact ? 'Mettre à jour' : 'Ajouter'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Modal Supprimer ──────────────────────────────────────────────────────────
function DeleteModal({ contact, onClose }: { contact: ContactItem; onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const handleDelete = () => {
        setLoading(true);
        router.delete(`/contacts/${contact.id}`, { onSuccess: () => onClose(), onFinish: () => setLoading(false) });
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-[#0f172a]">Supprimer le contact</h2>
                        <p className="text-xs text-slate-400">{contact.email}</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mb-6">Supprimer <span className="font-semibold text-[#0f172a]">{contact.nom}</span> de votre carnet d'adresses ?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
                    <button onClick={handleDelete} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
                        {loading ? <><Spin white/> Suppression…</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6"/></svg>Supprimer</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Spin({ white = false }: { white?: boolean }) {
    return <svg className={`w-4 h-4 animate-spin ${white ? 'text-white' : 'text-current'}`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}