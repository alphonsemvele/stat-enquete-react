import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '../../../dashboard/layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Answer {
    question_id: number;
    question_label: string;
    question_type: string;
    value: string | null;
}

interface ResponseItem {
    id: number;
    ip_address: string;
    submitted_at: string;
    answers: Answer[];
}

interface QuestionStat {
    id: number;
    label: string;
    type: string;
    total: number;
    top_values: { value: string; count: number }[];
}

interface FormInfo {
    id: number;
    title: string;
    reference: string;
    color: string;
    responses_count: number;
    questions_count: number;
    is_published: boolean;
    accepts_responses: boolean;
}

interface PaginatedData {
    data: ResponseItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    form: FormInfo;
    responses: PaginatedData;
    question_stats: QuestionStat[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResponsesShow({ form, responses, question_stats }: Props) {
    const [activeTab,   setActiveTab]   = useState<'reponses' | 'stats'>('reponses');
    const [expandedId,  setExpandedId]  = useState<number | null>(null);
    const [deleting,    setDeleting]    = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer cette réponse ?')) return;
        setDeleting(id);
        router.delete(`/reponses/${id}`, {
            preserveScroll: true,
            onFinish: () => { setDeleting(null); if (expandedId === id) setExpandedId(null); },
        });
    };

    return (
        <DashboardLayout title={form.title} subtitle={`${form.responses_count} réponse${form.responses_count > 1 ? 's' : ''} collectée${form.responses_count > 1 ? 's' : ''}`}>
            <Head title={`Réponses — ${form.title}`} />

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: form.color }}>
                        {form.title.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400">{form.reference}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${form.accepts_responses ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {form.accepts_responses ? 'Ouverte' : 'Fermée'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{form.questions_count} question{form.questions_count > 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/enquetes/${form.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-blue-200 hover:text-[#2563eb] transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Modifier l'enquête
                    </Link>
                    <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/f/${form.reference}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#2563eb] text-white rounded-xl hover:bg-[#1d4ed8] transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        Copier le lien
                    </button>
                </div>
            </div>

            {/* ── Stats rapides ───────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <p className="text-xs font-medium text-slate-400">Total réponses</p>
                    <p className="mt-1 text-2xl font-extrabold text-[#2563eb]">{form.responses_count}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <p className="text-xs font-medium text-slate-400">Questions</p>
                    <p className="mt-1 text-2xl font-extrabold text-[#0f172a]">{form.questions_count}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <p className="text-xs font-medium text-slate-400">Statut collecte</p>
                    <p className={`mt-1 text-lg font-extrabold ${form.accepts_responses ? 'text-green-600' : 'text-slate-400'}`}>
                        {form.accepts_responses ? '● Ouverte' : '○ Fermée'}
                    </p>
                </div>
            </div>

            {/* ── Onglets ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-1 mb-5 bg-white rounded-2xl border border-slate-100 p-1.5 w-fit">
                {[
                    { key: 'reponses', label: 'Réponses individuelles' },
                    { key: 'stats',    label: 'Statistiques' },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-[#2563eb] text-white shadow-sm' : 'text-slate-400 hover:text-[#0f172a]'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB : Réponses individuelles ───────────────────────────── */}
            {activeTab === 'reponses' && (
                <div className="space-y-3">
                    {responses.data.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                </svg>
                            </div>
                            <p className="text-sm text-slate-400">Aucune réponse pour cette enquête</p>
                        </div>
                    ) : responses.data.map((r, idx) => (
                        <div key={r.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                            {/* Header réponse */}
                            <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {(responses.current_page - 1) * responses.per_page + idx + 1}
                                    </span>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-[#0f172a]">{r.submitted_at}</p>
                                        <p className="text-xs text-slate-400 font-mono">{r.ip_address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-full">
                                        {r.answers.length} réponse{r.answers.length > 1 ? 's' : ''}
                                    </span>
                                    <button onClick={e => { e.stopPropagation(); handleDelete(r.id); }} disabled={deleting === r.id}
                                        className="p-1.5 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
                                        {deleting === r.id
                                            ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        }
                                    </button>
                                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedId === r.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </div>
                            </button>

                            {/* Détail réponses */}
                            {expandedId === r.id && (
                                <div className="border-t border-slate-100 px-6 py-5 bg-slate-50">
                                    {r.answers.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-4">Aucune réponse enregistrée</p>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {r.answers.map((a, i) => (
                                                <div key={i} className="bg-white rounded-xl border border-slate-100 p-4">
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{a.question_label}</p>
                                                    <p className="text-sm font-medium text-[#0f172a]">
                                                        {a.value || <span className="text-slate-300 italic">Sans réponse</span>}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Pagination */}
                    {responses.last_page > 1 && (
                        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 px-6 py-4">
                            <p className="text-sm text-slate-400">
                                Page <span className="font-semibold text-[#0f172a]">{responses.current_page}</span> sur <span className="font-semibold text-[#0f172a]">{responses.last_page}</span>
                            </p>
                            <div className="flex items-center gap-1.5">
                                {responses.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'}
                                        className={`rounded-xl px-3 py-2 text-sm transition-colors ${link.active ? 'bg-[#2563eb] font-semibold text-white' : link.url ? 'border border-slate-200 text-slate-500 hover:bg-slate-50' : 'cursor-not-allowed border border-slate-100 text-slate-300'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB : Statistiques ─────────────────────────────────────── */}
            {activeTab === 'stats' && (
                <div className="grid gap-5 sm:grid-cols-2">
                    {question_stats.length === 0 ? (
                        <div className="sm:col-span-2 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-sm text-slate-400">Aucune statistique disponible</p>
                        </div>
                    ) : question_stats.map((q, i) => (
                        <div key={q.id} className="bg-white rounded-2xl border border-slate-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Q{i + 1}</span>
                                    <p className="text-sm font-semibold text-[#0f172a] mt-0.5 truncate">{q.label}</p>
                                </div>
                                <span className="text-xs font-semibold text-[#2563eb] bg-blue-50 px-2 py-1 rounded-full ml-3 flex-shrink-0">
                                    {q.total} rép.
                                </span>
                            </div>

                            {/* Graphique barres pour radio/dropdown */}
                            {q.top_values.length > 0 ? (
                                <div className="space-y-2.5">
                                    {q.top_values.map((v, vi) => {
                                        const pct = q.total > 0 ? Math.round((v.count / q.total) * 100) : 0;
                                        return (
                                            <div key={vi}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-slate-600 truncate max-w-[160px]">{v.value}</span>
                                                    <span className="text-xs font-bold text-slate-500 ml-2">{v.count} ({pct}%)</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full bg-[#2563eb] transition-all"
                                                        style={{ width: `${pct}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-400">Champ texte libre — {q.total} réponse{q.total > 1 ? 's' : ''}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}