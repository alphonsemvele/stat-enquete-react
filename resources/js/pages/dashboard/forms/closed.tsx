import { Head } from '@inertiajs/react';

interface Props {
    form: {
        title: string;
        confirmation_message: string | null;
    };
}

export default function Closed({ form }: Props) {
    return (
        <>
            <Head title={`Fermée — ${form.title}`} />

            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h1 className="text-2xl font-bold text-[#0f172a] mb-3">Enquête fermée</h1>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            {form.confirmation_message ?? `L'enquête "${form.title}" n'accepte plus de nouvelles réponses.`}
                        </p>
                        <div className="h-px bg-slate-100 mb-6"></div>
                        <p className="text-xs text-slate-400">
                            Propulsé par <span className="font-semibold text-slate-500">STAT ENQUETE</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}