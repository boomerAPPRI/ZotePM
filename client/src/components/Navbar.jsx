import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Globe, User, LogOut } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'zh-TW' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            {import.meta.env.MODE === 'appri' && (
                <div className="h-1.5 w-full flex">
                    <div className="h-full w-1/4 bg-[#000095]"></div>
                    <div className="h-full w-3/4 bg-[#FE0000]"></div>
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
                            {import.meta.env.MODE === 'piano' ? (
                                <span className="flex items-center gap-2 text-emerald-600">
                                    🎹 Piano Practice <span className="text-xs bg-emerald-100 text-emerald-800 px-2 rounded-full">Student</span>
                                </span>
                            ) : import.meta.env.MODE === 'superbowl' ? (
                                <div className="flex items-center gap-3">
                                    {/* Seahawks Style User Icon */}
                                    <svg width="32" height="32" viewBox="0 0 24 24" className="fill-current text-[#002244] stroke-[#69BE28] stroke-1">
                                        <path d="M2.5 12c0-4.4 3.6-8 8-8 4.4 0 8 3.6 8 8 0 4.4-3.6 8-8 8-4.4 0-8-3.6-8-8z" />
                                        <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
                                    </svg>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-slate-800 tracking-tighter">SUPER BOWL LIX</span>
                                        <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm animate-pulse">LIVE NOW</span>
                                    </div>

                                    {/* Patriots Style User Icon */}
                                    <svg width="32" height="32" viewBox="0 0 24 24" className="fill-current text-[#002244] stroke-[#C60C30] stroke-1">
                                        <path d="M21.5 12c0 4.4-3.6 8-8 8-4.4 0-8-3.6-8-8 0-4.4 3.6-8 8-8 4.4 0 8 3.6 8 8z" />
                                        <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                            ) : import.meta.env.MODE === 'appri' ? (
                                <span
                                    className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-cover bg-center"
                                    style={{
                                        backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/7/72/Flag_of_the_Republic_of_China.svg')",
                                        backgroundPosition: 'center',
                                        // Adjust scale to ensure the sun is visible if possible, 
                                        // but 'cover' usually works best for generic coloring.
                                    }}
                                >
                                    APPRI
                                </span>
                            ) : (
                                "ZotePM"
                            )}
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-1 items-center">
                        <Link to="/" className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            {import.meta.env.MODE === 'piano' ? 'Challenges' : (t('nav.markets') || 'Markets')}
                        </Link>
                        {user && (
                            <Link to="/challenges" className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                {t('nav.challenges') || 'Challenges'}
                            </Link>
                        )}
                        {user && (
                            <Link to="/leaderboard" className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                {import.meta.env.MODE === 'piano' ? 'Top Scores' : (t('nav.leaderboard') || 'Leaderboard')}
                            </Link>
                        )}

                        {user && user.role === 'admin' && (
                            <Link to="/admin" className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">Admin</Link>
                        )}

                        <div className="h-6 w-px bg-gray-200 mx-2"></div>

                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    {import.meta.env.MODE === 'piano' ? 'My Stats' : (t('nav.dashboard') || 'Dashboard')}
                                </Link>
                                <Link to="/profile" className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors" title="Profile">
                                    <User className="w-5 h-5" />
                                </Link>
                                <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition-colors" title="Logout">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md">
                                {t('nav.login') || 'Login'}
                            </Link>
                        )}

                        <button
                            onClick={toggleLanguage}
                            className="ml-2 p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
                            title="Switch Language"
                        >
                            <Globe className="w-5 h-5" />
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-md focus:outline-none"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div >

            {/* Mobile Menu */}
            {
                isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">{t('nav.markets') || 'Markets'}</Link>
                            {user && (
                                <Link to="/challenges" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">{t('nav.challenges') || 'Challenges'}</Link>
                            )}
                            {user && (
                                <Link to="/leaderboard" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">{t('nav.leaderboard') || 'Leaderboard'}</Link>
                            )}

                            {user && user.role === 'admin' && (
                                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Admin</Link>
                            )}

                            {user ? (
                                <>
                                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">{t('nav.dashboard') || 'Dashboard'}</Link>
                                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">{t('nav.profile') || 'Profile'}</Link>
                                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium">{t('nav.logout') || 'Logout'}</button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-indigo-600 font-medium px-3 py-2 rounded-md text-base">{t('nav.login') || 'Login'}</Link>
                            )}

                            <button onClick={() => { toggleLanguage(); setIsMenuOpen(false); }} className="block w-full text-left text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-base font-medium">
                                {i18n.language === 'en' ? 'Switch to 繁中' : 'Switch to English'}
                            </button>
                        </div>
                    </div>
                )
            }
            {user && !user.profile_completed && (
                <div className="bg-indigo-600 text-white text-center py-2 text-sm font-medium">
                    <Link to="/profile" className="hover:underline">
                        {t('dashboard.complete_profile_reward') || 'Complete your profile to earn 500 ₳!'}
                    </Link>
                </div>
            )}
        </header >
    );
};

export default Navbar;
