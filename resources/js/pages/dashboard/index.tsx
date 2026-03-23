import { Link } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    enquetes_actives:        number;
    total_reponses:          number;
    taux_completion:         number;
    enquetes_ce_mois:        number;
    reponses_aujourd_hui:    number;
    enquetes_en_cours:       number;
    enquetes_terminees:      number;
    invitations_en_attente:  number;
}

interface EnqueteRecente {
    id:       number;
    initials: string;
    titre:    string;
    reponses: number;
    statut:   'Active' | 'Brouillon' | 'Fermée';
    creee_le: string;
}

interface Props {
    stats:             Stats;
    enquetes_recentes: EnqueteRecente[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard({
    stats = {
        enquetes_actives: 0, total_reponses: 0, taux_completion: 0,
        enquetes_ce_mois: 0, reponses_aujourd_hui: 0,
        enquetes_en_cours: 0, enquetes_terminees: 0, invitations_en_attente: 0,
    },
    enquetes_recentes = [],
}: Partial<Props>) {

    const s = {
        enquetes_actives:       stats?.enquetes_actives        ?? 0,
        total_reponses:         stats?.total_reponses          ?? 0,
        taux_completion:        stats?.taux_completion         ?? 0,
        enquetes_ce_mois:       stats?.enquetes_ce_mois        ?? 0,
        reponses_aujourd_hui:   stats?.reponses_aujourd_hui    ?? 0,
        enquetes_en_cours:      stats?.enquetes_en_cours       ?? 0,
        enquetes_terminees:     stats?.enquetes_terminees      ?? 0,
        invitations_en_attente: stats?.invitations_en_attente  ?? 0,
    };

    return (
        <DashboardLayout title="Tableau de bord" subtitle="Bienvenue sur votre espace STATS ENQUETES">

            {/* ─── KPI CARDS ───
                mobile  : 1 col
                sm (≥640): 2 cols
                lg (≥1024): 4 cols
            */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
                <KpiCard
                    label="Enquêtes actives"
                    value={s.enquetes_actives}
                    sub={`+${s.enquetes_ce_mois} ce mois`}
                    subUp
                    icon={<FormIcon />}
                    accent="blue"
                />
                <KpiCard
                    label="Total réponses"
                    value={s.total_reponses.toLocaleString()}
                    sub={`+${s.reponses_aujourd_hui} aujourd'hui`}
                    subUp
                    icon={<InboxIcon />}
                    accent="indigo"
                />
                <KpiCard
                    label="Taux de complétion"
                    value={`${s.taux_completion}%`}
                    sub={`${s.enquetes_en_cours} en cours`}
                    subUp={s.taux_completion >= 70}
                    icon={<ChartIcon />}
                    accent="sky"
                    progress={s.taux_completion}
                />
                <KpiCard
                    label="Invitations en attente"
                    value={s.invitations_en_attente}
                    sub={`${s.enquetes_terminees} enquêtes terminées`}
                    icon={<MailIcon />}
                    accent="violet"
                />
            </div>

            {/* ─── BODY ───
                mobile  : 1 col (empilé)
                lg      : 5 cols (3 + 2)
            */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-5">

                {/* Enquêtes récentes — prend toute la largeur sur mobile, 3 cols sur lg */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-sm font-bold text-[#0f172a]">Enquêtes récentes</h2>
                            <p className="text-xs text-slate-400 mt-0.5">{enquetes_recentes.length} enquête(s)</p>
                        </div>
                        <Link href="/enquetes" className="text-xs font-semibold text-[#2563eb] hover:underline flex items-center gap-1">
                            Voir tout
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    </div>

                    {enquetes_recentes.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                            {enquetes_recentes.map(e => (
                                <EnqueteRow key={e.id} {...e} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Aucune enquête pour l'instant</p>
                            <p className="text-xs text-slate-400 mb-4">Créez votre première enquête en quelques secondes</p>
                            <Link href="/enquetes/create" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2563eb] px-4 py-2 rounded-xl hover:bg-[#1d4ed8] transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/>
                                </svg>
                                Créer une enquête
                            </Link>
                        </div>
                    )}
                </div>

                {/* Actions rapides — 2 cols sur lg, grille 2 cols sur mobile */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-[#0f172a]">Actions rapides</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Raccourcis fréquents</p>
                    </div>
                    {/*
                        Sur mobile : grille 2 colonnes pour les actions rapides
                        Sur lg     : liste verticale (1 col) dans le panneau latéral
                    */}
                    <div className="p-3 sm:p-4 grid grid-cols-2 lg:grid-cols-1 gap-2">
                        <QuickAction href="/enquetes/create"    icon={<PlusIcon />}     label="Nouvelle enquête"        color="bg-blue-50 text-[#2563eb]" />
                        <QuickAction href="/modeles"            icon={<TemplateIcon />} label="Utiliser un modèle"      color="bg-indigo-50 text-indigo-600" />
                        <QuickAction href="/invitations/create" icon={<MailIcon />}     label="Envoyer des invitations" color="bg-sky-50 text-sky-600" />
                        <QuickAction href="/rapports"           icon={<ChartIcon />}    label="Voir les rapports"       color="bg-violet-50 text-violet-600" />
                        <QuickAction href="/exports"            icon={<ExportIcon />}   label="Exporter les données"    color="bg-amber-50 text-amber-600" />
                        <QuickAction href="/distributions"      icon={<ShareIcon />}    label="Distribuer via QR code"  color="bg-cyan-50 text-cyan-600" />
                        <QuickAction href="/equipe"             icon={<UsersIcon />}    label="Gérer l'équipe"          color="bg-slate-100 text-slate-500" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const accentMap: Record<string, { bg: string; text: string; ring: string }> = {
    blue:   { bg: 'bg-blue-50',   text: 'text-[#2563eb]',  ring: 'bg-blue-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'bg-indigo-500' },
    sky:    { bg: 'bg-sky-50',    text: 'text-sky-600',    ring: 'bg-sky-500' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'bg-violet-500' },
};

function KpiCard({ label, value, sub, subUp = false, icon, accent = 'blue', progress }: {
    label: string; value: string | number; sub: string; subUp?: boolean;
    icon: React.ReactNode; accent?: string; progress?: number;
}) {
    const a = accentMap[accent] ?? accentMap.blue;
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className={a.text}>{icon}</span>
                </div>
                {progress !== undefined && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.bg} ${a.text}`}>{progress}%</span>
                )}
            </div>
            <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
            <p className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">{value}</p>
            {progress !== undefined && (
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${a.ring} transition-all`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
            )}
            <p className={`mt-2 text-xs font-medium ${subUp ? 'text-green-600' : 'text-slate-400'}`}>{sub}</p>
        </div>
    );
}

// ─── Enquete Row ──────────────────────────────────────────────────────────────

function EnqueteRow({ initials, titre, reponses, statut, creee_le }: Omit<EnqueteRecente, 'id'>) {
    const statusStyle = {
        'Active':   'bg-green-50 text-green-700 border-green-100',
        'Brouillon':'bg-amber-50 text-amber-700 border-amber-100',
        'Fermée':   'bg-slate-100 text-slate-500 border-slate-200',
    }[statut];

    const dotColor = {
        'Active':   'bg-green-500',
        'Brouillon':'bg-amber-500',
        'Fermée':   'bg-slate-400',
    }[statut];

    return (
        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-xs font-bold text-[#2563eb] flex-shrink-0">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0f172a] truncate group-hover:text-[#2563eb] transition-colors">{titre}</p>
                <p className="text-xs text-slate-400 truncate">{reponses} réponse{reponses > 1 ? 's' : ''} · {creee_le}</p>
            </div>
            {/* Badge complet sur sm+, pastille seule sur mobile */}
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${statusStyle}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                {statut}
            </span>
            <span className={`sm:hidden w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`}></span>
        </div>
    );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────

function QuickAction({ href, icon, label, color }: {
    href: string; icon: React.ReactNode; label: string; color: string;
}) {
    return (
        <Link href={href} className="flex items-center gap-2.5 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
            <span className="text-xs sm:text-sm font-medium text-slate-600 group-hover:text-[#0f172a] transition-colors leading-tight">{label}</span>
            <svg className="w-4 h-4 text-slate-300 ml-auto group-hover:text-[#2563eb] transition-colors flex-shrink-0 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
        </Link>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function FormIcon()     { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function InboxIcon()    { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M22 12h-6l-2 3h-4l-2-3H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ChartIcon()    { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function MailIcon()     { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5"/><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function PlusIcon()     { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>; }
function TemplateIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function ExportIcon()   { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ShareIcon()    { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function UsersIcon()    { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>; }