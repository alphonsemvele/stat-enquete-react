import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '../layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Template {
    id: string;
    title: string;
    description: string;
    category: string;
    color: string;
    icon: string;
    questions: number;
}

interface Props {
    templates: Template[];
    categories: string[];
}

// ─── Icônes par catégorie ─────────────────────────────────────────────────────

function TemplateIcon({ icon, cls = 'w-6 h-6' }: { icon: string; cls?: string }) {
    const p = { className: cls, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' };
    switch (icon) {
        case 'star':     return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;
        case 'calendar': return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
        case 'users':    return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={1.8}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
        case 'book':     return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>;
        case 'box':      return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>;
        case 'mail':     return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
        default:         return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>;
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Modeles({ templates, categories }: Props) {
    const [activeCategory, setActiveCategory] = useState<string>('Tous');
    const [loadingId,      setLoadingId]      = useState<string | null>(null);
    const [previewTpl,     setPreviewTpl]     = useState<Template | null>(null);

    const filtered = activeCategory === 'Tous'
        ? templates
        : templates.filter(t => t.category === activeCategory);

    const useTemplate = (id: string) => {
        setLoadingId(id);
        router.post(`/modeles/${id}/use`, {}, {
            onFinish: () => setLoadingId(null),
        });
    };

    return (
        <DashboardLayout title="Modèles" subtitle="Démarrez rapidement avec un modèle prêt à l'emploi">
            <Head title="Modèles — STAT ENQUETE" />

            {/* ── Hero ────────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-[#2563eb] to-indigo-600 rounded-2xl p-8 mb-8 text-white overflow-hidden relative">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">{templates.length} modèles disponibles</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Commencez plus vite 🚀</h2>
                    <p className="text-blue-100 text-sm max-w-xl">
                        Choisissez un modèle parmi notre bibliothèque, personnalisez-le selon vos besoins et publiez en quelques clics. Toutes les questions sont modifiables.
                    </p>
                </div>
            </div>

            {/* ── Filtres catégories ──────────────────────────────────────── */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                {['Tous', ...categories].map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            activeCategory === cat
                                ? 'bg-[#2563eb] text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-[#2563eb]'
                        }`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* ── Grille de modèles ───────────────────────────────────────── */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(tpl => (
                    <div key={tpl.id}
                        className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-0.5 transition-all duration-200">

                        {/* Bandeau couleur + icône */}
                        <div className="h-28 flex items-center justify-center relative overflow-hidden"
                            style={{ backgroundColor: tpl.color + '15' }}>
                            <div className="absolute inset-0 opacity-10"
                                style={{ background: `radial-gradient(circle at 70% 50%, ${tpl.color}, transparent 70%)` }}></div>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm relative z-10"
                                style={{ backgroundColor: tpl.color }}>
                                <TemplateIcon icon={tpl.icon} cls="w-7 h-7 text-white" />
                            </div>
                        </div>

                        {/* Contenu */}
                        <div className="p-5">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-sm font-bold text-[#0f172a] leading-tight">{tpl.title}</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border"
                                    style={{ color: tpl.color, backgroundColor: tpl.color + '12', borderColor: tpl.color + '30' }}>
                                    {tpl.category}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed mb-4">{tpl.description}</p>

                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
                                    </svg>
                                    {tpl.questions} questions
                                </span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPreviewTpl(tpl)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-[#0f172a] transition-all">
                                        Aperçu
                                    </button>
                                    <button onClick={() => useTemplate(tpl.id)} disabled={loadingId === tpl.id}
                                        className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90"
                                        style={{ backgroundColor: tpl.color }}>
                                        {loadingId === tpl.id ? (
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                                Chargement…
                                            </span>
                                        ) : 'Utiliser'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
                        </svg>
                    </div>
                    <p className="text-sm text-slate-400">Aucun modèle dans cette catégorie</p>
                </div>
            )}

            {/* ── MODAL APERÇU ────────────────────────────────────────────── */}
            {previewTpl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setPreviewTpl(null)}>
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="h-2" style={{ backgroundColor: previewTpl.color }}></div>
                        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: previewTpl.color }}>
                                    <TemplateIcon icon={previewTpl.icon} cls="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#0f172a]">{previewTpl.title}</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">{previewTpl.questions} questions · {previewTpl.category}</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewTpl(null)}
                                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>

                        {/* Description */}
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <p className="text-sm text-slate-500">{previewTpl.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                            {[
                                { label: 'Questions', value: previewTpl.questions },
                                { label: 'Catégorie', value: previewTpl.category },
                                { label: 'Modifiable', value: '100%' },
                            ].map(s => (
                                <div key={s.label} className="px-4 py-3 text-center">
                                    <p className="text-sm font-bold text-[#0f172a]">{s.value}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4">
                            <button onClick={() => setPreviewTpl(null)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                Fermer
                            </button>
                            <button onClick={() => { useTemplate(previewTpl.id); setPreviewTpl(null); }}
                                disabled={loadingId === previewTpl.id}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90"
                                style={{ backgroundColor: previewTpl.color }}>
                                {loadingId === previewTpl.id ? (
                                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Chargement…</>
                                ) : (
                                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg> Utiliser ce modèle</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}