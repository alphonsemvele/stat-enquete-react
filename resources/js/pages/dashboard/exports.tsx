import { Head } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

interface FormOption {
    id: number; title: string; color: string; reference: string;
    statut: string; total_reponses: number; created_at: string;
}
interface Stats {
    total_enquetes: number; total_reponses: number;
    total_contacts: number; total_invitations: number;
}
interface Props { forms: FormOption[]; stats: Stats; }

// ─── Types d'export ───────────────────────────────────────────────────────────
type Format  = 'excel' | 'pdf';
type Statut  = '' | 'en_attente' | 'envoyee' | 'ouverte' | 'repondue';

const STATUTS_INV = [
    { value: '',           label: 'Tous les statuts' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'envoyee',    label: 'Envoyée' },
    { value: 'ouverte',    label: 'Ouverte' },
    { value: 'repondue',   label: 'Répondue' },
];

const PERIODES = [
    { value: '7',   label: '7 jours' },
    { value: '30',  label: '30 jours' },
    { value: '90',  label: '90 jours' },
    { value: '365', label: '1 an' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildUrl(path: string, params: Record<string, string>) {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return `${path}${q.toString() ? '?' + q.toString() : ''}`;
}

function download(url: string) { window.location.href = url; }

// ─── Composants UI ────────────────────────────────────────────────────────────
function FormatToggle({ value, onChange }: { value: Format; onChange: (f: Format) => void }) {
    return (
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
            {(['excel', 'pdf'] as Format[]).map(f => (
                <button key={f} onClick={() => onChange(f)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        value === f ? (f === 'excel' ? 'bg-green-600 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm')
                                    : 'text-slate-400 hover:text-slate-600'
                    }`}>
                    {f === 'excel' ? '⬡ Excel' : '⬢ PDF'}
                </button>
            ))}
        </div>
    );
}

function ExportCard({ title, description, icon, color, children }: {
    title: string; description: string; icon: React.ReactNode; color: string; children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className={`px-5 py-4 flex items-center gap-3 border-b border-slate-100`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-[#0f172a]">{title}</h3>
                    <p className="text-xs text-slate-400">{description}</p>
                </div>
            </div>
            <div className="p-5 space-y-4">{children}</div>
        </div>
    );
}

function ExportBtn({ label, format, onClick, disabled = false }: {
    label: string; format: Format; onClick: () => void; disabled?: boolean;
}) {
    const isExcel = format === 'excel';
    return (
        <button onClick={onClick} disabled={disabled}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isExcel
                    ? 'border-green-200 text-green-700 hover:bg-green-50 hover:border-green-400'
                    : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400'
            }`}>
            <span>{label}</span>
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-bold ${
                isExcel ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
                {isExcel ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17L7 15.5l1.5-1.5L7 12.5 8.5 11l2 2 2-2 1.5 1.5L12.5 14l1.5 1.5L12.5 17l-2-2-2 2z"/></svg>
                ) : (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9 13h6v1H9v-1zm0 2h6v1H9v-1zm0 2h4v1H9v-1z"/></svg>
                )}
                {isExcel ? 'XLSX' : 'PDF'}
            </div>
        </button>
    );
}

function Select({ value, onChange, options, placeholder = '' }: {
    value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; placeholder?: string;
}) {
    return (
        <select value={value} onChange={e => onChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0f172a] bg-white focus:border-[#2563eb] focus:outline-none transition-all">
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Exports({ forms = [], stats = { total_enquetes: 0, total_reponses: 0, total_contacts: 0, total_invitations: 0 } }: Props) {

    // États par section
    const [repForm,    setRepForm]    = useState('');
    const [invForm,    setInvForm]    = useState('');
    const [invStatut,  setInvStatut]  = useState<Statut>('');
    const [rapPeriode, setRapPeriode] = useState('30');
    const [ficheForm,  setFicheForm]  = useState('');

    const formOptions = forms.map(f => ({ value: String(f.id), label: f.title }));

    return (
        <DashboardLayout title="Exportations" subtitle="Exportez vos données en Excel ou PDF">
            <Head title="Exportations — STAT ENQUETE" />

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Enquêtes',    value: stats.total_enquetes,   icon: '📋', color: 'bg-blue-50 text-[#2563eb]' },
                    { label: 'Réponses',    value: stats.total_reponses,   icon: '💬', color: 'bg-purple-50 text-purple-600' },
                    { label: 'Contacts',    value: stats.total_contacts,   icon: '👥', color: 'bg-green-50 text-green-600' },
                    { label: 'Invitations', value: stats.total_invitations, icon: '✉️', color: 'bg-amber-50 text-amber-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
                        <p className="text-xs font-medium text-slate-400">{s.label}</p>
                        <p className={`text-2xl font-extrabold tracking-tight mt-1 ${s.color.split(' ')[1]}`}>{s.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── 1. Réponses d'une enquête ──────────────────────────── */}
                <ExportCard
                    title="Réponses d'une enquête"
                    description="Toutes les soumissions pour un formulaire"
                    color="bg-purple-50"
                    icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>}
                >
                    <Select value={repForm} onChange={setRepForm} options={formOptions} placeholder="Choisir une enquête…" />
                    <div className="grid grid-cols-2 gap-3">
                        <ExportBtn label="Exporter Excel" format="excel" disabled={!repForm}
                            onClick={() => download(buildUrl('/exports/reponses/excel', { form_id: repForm }))} />
                        <ExportBtn label="Exporter PDF" format="pdf" disabled={!repForm}
                            onClick={() => download(buildUrl('/exports/reponses/pdf', { form_id: repForm }))} />
                    </div>
                </ExportCard>

                {/* ── 2. Toutes les réponses ─────────────────────────────── */}
                <ExportCard
                    title="Toutes les réponses"
                    description="L'ensemble des réponses de toutes vos enquêtes"
                    color="bg-indigo-50"
                    icon={<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>}
                >
                    <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                        Exporte <strong className="text-[#0f172a]">{stats.total_reponses.toLocaleString()}</strong> réponses issues de <strong className="text-[#0f172a]">{stats.total_enquetes}</strong> enquêtes.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <ExportBtn label="Exporter Excel" format="excel"
                            onClick={() => download('/exports/reponses/toutes/excel')} />
                        <ExportBtn label="Rapport PDF" format="pdf"
                            onClick={() => download(buildUrl('/exports/rapport/pdf', { periode: rapPeriode }))} />
                    </div>
                </ExportCard>

                {/* ── 3. Contacts ────────────────────────────────────────── */}
                <ExportCard
                    title="Contacts"
                    description="Votre liste de contacts"
                    color="bg-green-50"
                    icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
                >
                    <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                        <strong className="text-[#0f172a]">{stats.total_contacts.toLocaleString()}</strong> contacts dans votre base.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <ExportBtn label="Exporter Excel" format="excel"
                            onClick={() => download('/exports/contacts/excel')} />
                        <ExportBtn label="Exporter PDF" format="pdf"
                            onClick={() => download('/exports/contacts/pdf')} />
                    </div>
                </ExportCard>

                {/* ── 4. Invitations ─────────────────────────────────────── */}
                <ExportCard
                    title="Invitations"
                    description="Suivi des invitations envoyées"
                    color="bg-amber-50"
                    icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <Select value={invForm} onChange={setInvForm} options={formOptions} placeholder="Toutes les enquêtes" />
                        <Select value={invStatut} onChange={v => setInvStatut(v as Statut)} options={STATUTS_INV} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ExportBtn label="Exporter Excel" format="excel"
                            onClick={() => download(buildUrl('/exports/invitations/excel', { form_id: invForm, statut: invStatut }))} />
                        <ExportBtn label="Exporter PDF" format="pdf"
                            onClick={() => download(buildUrl('/exports/invitations/pdf', { form_id: invForm, statut: invStatut }))} />
                    </div>
                </ExportCard>

                {/* ── 5. Rapport global ──────────────────────────────────── */}
                <ExportCard
                    title="Rapport global"
                    description="Statistiques complètes multi-feuilles"
                    color="bg-blue-50"
                    icon={<svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
                >
                    <Select value={rapPeriode} onChange={setRapPeriode} options={PERIODES} />
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
                        <strong>Excel :</strong> 4 feuilles — Enquêtes, Réponses, Contacts, Invitations<br/>
                        <strong>PDF :</strong> Rapport de synthèse avec statistiques clés
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ExportBtn label="Rapport Excel" format="excel"
                            onClick={() => download(buildUrl('/exports/rapport/excel', { periode: rapPeriode }))} />
                        <ExportBtn label="Rapport PDF" format="pdf"
                            onClick={() => download(buildUrl('/exports/rapport/pdf', { periode: rapPeriode }))} />
                    </div>
                </ExportCard>

                {/* ── 6. Fiche enquête ────────────────────────────────────── */}
                <ExportCard
                    title="Fiche d'une enquête"
                    description="Détail complet d'un formulaire avec ses questions"
                    color="bg-slate-100"
                    icon={<svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>}
                >
                    <Select value={ficheForm} onChange={setFicheForm} options={formOptions} placeholder="Choisir une enquête…" />
                    {ficheForm && forms.find(f => String(f.id) === ficheForm) && (() => {
                        const f = forms.find(f => String(f.id) === ficheForm)!;
                        return (
                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: f.color }}>{f.title.slice(0, 2).toUpperCase()}</div>
                                <div>
                                    <p className="text-xs font-semibold text-[#0f172a]">{f.title}</p>
                                    <p className="text-xs text-slate-400">{f.total_reponses} réponses · {f.statut}</p>
                                </div>
                            </div>
                        );
                    })()}
                    <ExportBtn label="Télécharger la fiche PDF" format="pdf" disabled={!ficheForm}
                        onClick={() => download(buildUrl('/exports/fiche-enquete/pdf', { form_id: ficheForm }))} />
                </ExportCard>

                {/* ── 7. Liste des enquêtes ───────────────────────────────── */}
                <ExportCard
                    title="Liste des enquêtes"
                    description="Toutes vos enquêtes avec leur statut"
                    color="bg-rose-50"
                    icon={<svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>}
                >
                    <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                        <strong className="text-[#0f172a]">{stats.total_enquetes}</strong> enquêtes avec titre, référence, statut et nombre de réponses.
                    </p>
                    <ExportBtn label="Exporter Excel" format="excel"
                        onClick={() => download('/exports/enquetes/excel')} />
                </ExportCard>

            </div>
        </DashboardLayout>
    );
}