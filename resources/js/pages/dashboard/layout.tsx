import { Head, Link, usePage, router } from '@inertiajs/react';
import { ReactNode, useState, useEffect } from 'react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface PageProps extends InertiaPageProps {
    auth: { user: User };
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const { url, props } = usePage<PageProps>();
    const { auth } = props;
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Ferme le sidebar lors d'un changement de route (navigation mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [url]);

    // Empêche le scroll du body quand le sidebar est ouvert sur mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    const isActive = (path: string) => {
        const currentPath = url.split('?')[0].replace(/\/$/, '');
        const cleanPath = path.replace(/\/$/, '');
        const exactRoutes = [
            '/dashboard', '/enquetes', '/enquetes/create', '/reponses',
            '/modeles', '/contacts', '/distributions', '/invitations',
            '/rapports', '/exports', '/insights', '/equipe',
            '/espaces', '/integrations',
        ];
        if (exactRoutes.includes(cleanPath)) return currentPath === cleanPath;
        return currentPath === cleanPath || currentPath.startsWith(cleanPath + '/');
    };

    const handleLogout = () => router.post('/logout');

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen bg-slate-50">

                {/* ─── OVERLAY MOBILE ─── */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* ─── SIDEBAR ─── */}
                <aside className={`
                    fixed left-0 top-0 z-40 h-screen w-64 bg-[#0f172a] flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}>

                    {/* Logo + bouton fermeture (mobile) */}
                    <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb] flex-shrink-0">
                                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-white tracking-tight">STATS ENQUETES</span>
                        </div>

                        {/* Bouton × visible uniquement sur mobile */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Fermer le menu"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-none">
                        <div className="mb-6">
                            <NavLink href="/dashboard" icon={<HomeIcon />} active={isActive('/dashboard')}>
                                Tableau de bord
                            </NavLink>
                        </div>

                        <NavSection title="Enquêtes">
                            <NavLink href="/enquetes"        icon={<FormIcon />}       active={isActive('/enquetes')}>Mes enquêtes</NavLink>
                            <NavLink href="/enquetes/create" icon={<PlusCircleIcon />} active={isActive('/enquetes/create')}>Créer une enquête</NavLink>
                            <NavLink href="/modeles"         icon={<TemplateIcon />}   active={isActive('/modeles')}>Modèles</NavLink>
                        </NavSection>

                        <NavSection title="Collecte">
                            <NavLink href="/reponses"    icon={<InboxIcon />}   active={isActive('/reponses')}>Réponses</NavLink>
                            <NavLink href="/contacts"    icon={<ContactIcon />} active={isActive('/contacts')}>Contacts</NavLink>
                            <NavLink href="/invitations" icon={<MailIcon />}    active={isActive('/invitations')}>Invitations</NavLink>
                        </NavSection>

                        <NavSection title="Analyse">
                            <NavLink href="/rapports" icon={<ChartIcon />}  active={isActive('/rapports')}>Rapports</NavLink>
                            <NavLink href="/exports"  icon={<ExportIcon />} active={isActive('/exports')}>Exports</NavLink>
                        </NavSection>

                        <NavSection title="Paramètres">
                            <NavLink href="/equipe" icon={<UsersGroupIcon />} active={isActive('/equipe')}>Équipe</NavLink>
                        </NavSection>
                    </nav>

                    {/* User footer */}
                    {auth?.user && (
                        <div className="border-t border-white/5 p-3">
                            <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors group">
                                <div className="h-8 w-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {getInitials(auth.user.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-white truncate group-hover:text-blue-200 transition-colors">{auth.user.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{auth.user.role ?? auth.user.email}</p>
                                </div>
                                <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                </svg>
                            </Link>
                        </div>
                    )}
                </aside>

                {/* ─── MAIN ─── */}
                {/* ml-0 sur mobile, ml-64 à partir de lg */}
                <div className="flex-1 flex flex-col min-w-0 lg:ml-64">

                    {/* Header */}
                    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 gap-3">

                        {/* Gauche : hamburger (mobile) + titre */}
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Hamburger — visible uniquement sous lg */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#2563eb] hover:border-blue-200 transition-all flex-shrink-0"
                                aria-label="Ouvrir le menu"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                                </svg>
                            </button>

                            <div className="min-w-0">
                                <h1 className="text-sm sm:text-base font-bold text-[#0f172a] tracking-tight truncate">{title}</h1>
                                {subtitle && <p className="text-xs text-slate-400 mt-0.5 hidden sm:block truncate">{subtitle}</p>}
                            </div>
                        </div>

                        {/* Droite : actions */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <Link
                                href="/enquetes/create"
                                className="hidden sm:inline-flex items-center gap-2 bg-[#2563eb] text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-xl hover:bg-[#1d4ed8] transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/>
                                </svg>
                                <span className="hidden md:inline">Nouvelle enquête</span>
                                <span className="sm:inline md:hidden">Nouveau</span>
                            </Link>

                            {/* Notif */}
                            <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#2563eb] hover:border-blue-200 transition-all flex-shrink-0">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563eb]"></span>
                            </button>

                            {/* User menu */}
                            {auth?.user && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-2 sm:px-3 py-2 hover:border-blue-200 transition-all"
                                    >
                                        <div className="h-7 w-7 rounded-lg bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {getInitials(auth.user.name)}
                                        </div>
                                        <span className="hidden md:block text-sm font-semibold text-[#0f172a]">{auth.user.name}</span>
                                        <svg className={`hidden sm:block h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none">
                                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>

                                    {showUserMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                            <div className="absolute right-0 mt-2 w-60 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100 overflow-hidden">
                                                <div className="p-4 border-b border-slate-100 bg-slate-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-[#2563eb] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                            {getInitials(auth.user.name)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-[#0f172a] truncate">{auth.user.name}</p>
                                                            <p className="text-xs text-slate-400 truncate">{auth.user.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <Link href="/profile" onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-[#2563eb] transition-colors">
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>
                                                        Mon profil
                                                    </Link>
                                                    <Link href="/parametres" onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-[#2563eb] transition-colors">
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5"/></svg>
                                                        Paramètres
                                                    </Link>
                                                    <div className="my-1 h-px bg-slate-100" />
                                                    <button onClick={handleLogout}
                                                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                        Se déconnecter
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
                </div>
            </div>
        </>
    );
}

// ─── NavSection & NavLink ─────────────────────────────────────────────────────

function NavSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">{title}</p>
            <ul className="space-y-0.5">{children}</ul>
        </div>
    );
}

function NavLink({ href, icon, children, active = false }: {
    href: string; icon: ReactNode; children: ReactNode; active?: boolean;
}) {
    return (
        <li>
            <Link href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active
                        ? 'bg-[#2563eb] text-white font-semibold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}>
                <span className={active ? 'text-white' : 'text-slate-500'}>{icon}</span>
                {children}
            </Link>
        </li>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon()       { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function FormIcon()       { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function PlusCircleIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function TemplateIcon()   { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function InboxIcon()      { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M22 12h-6l-2 3h-4l-2-3H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ContactIcon()    { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function MailIcon()       { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5"/><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function ChartIcon()      { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function ExportIcon()     { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function UsersGroupIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13M16 3.13C17.7699 3.58317 19.0078 5.17799 19.0078 7.005C19.0078 8.83201 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }