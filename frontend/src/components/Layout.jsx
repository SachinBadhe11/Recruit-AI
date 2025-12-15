import React from 'react';
import { LayoutDashboard, Users, Settings, Bell, Search, Menu, LogOut } from 'lucide-react';

const Layout = ({ children, activeView, onNavigate, user, onProfileClick, onLogout }) => {
    return (
        <div className="min-h-screen flex">
            {/* Floating Glass Sidebar */}
            <aside className="fixed left-4 top-4 bottom-4 w-72 glass rounded-3xl z-20 hidden md:flex flex-col p-6">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow text-white font-bold text-xl">
                        RA
                    </div>
                    <h1 className="text-2xl font-display font-bold text-surface-900 tracking-tight">
                        Recruit-AI
                    </h1>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem
                        icon={<LayoutDashboard size={22} />}
                        label="Dashboard"
                        active={activeView === 'dashboard'}
                        onClick={() => onNavigate('dashboard')}
                    />
                    <NavItem
                        icon={<Users size={22} />}
                        label="Candidates"
                        active={activeView === 'candidates'}
                        onClick={() => onNavigate('candidates')}
                    />
                    <NavItem
                        icon={<Settings size={22} />}
                        label="Settings"
                        active={activeView === 'settings'}
                        onClick={() => onNavigate('settings')}
                    />
                </nav>

                <div className="mt-auto space-y-3">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>

                    <div className="pt-3 border-t border-surface-200/50">
                        <button
                            onClick={onProfileClick}
                            className="w-full flex items-center gap-3 px-2 hover:bg-surface-50 rounded-xl p-2 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-sm font-semibold text-surface-900 truncate">{user?.name}</p>
                                <p className="text-xs text-surface-500 truncate">{user?.role}</p>
                            </div>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-80 p-4 md:p-8 min-h-screen">
                {/* Sticky Glass Header */}
                <header className="sticky top-4 z-10 glass rounded-2xl px-6 py-4 mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4 md:hidden">
                        <button className="p-2 text-surface-500 hover:bg-surface-100 rounded-lg">
                            <Menu size={24} />
                        </button>
                        <span className="font-display font-bold text-xl text-surface-900">Recruit-AI</span>
                    </div>

                    <div className="hidden md:block relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search jobs, candidates..."
                            className="w-full bg-surface-50/50 border border-surface-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2.5 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors relative group">
                            <Bell size={22} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
      w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group
      ${active
                ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                : 'text-surface-500 hover:bg-surface-50 hover:text-surface-900 font-medium'}
    `}
    >
        <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
        </span>
        {label}
    </button>
);

export default Layout;
