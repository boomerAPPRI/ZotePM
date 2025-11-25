import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const Layout = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/login');
    };

    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'zh-TW' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0">
                            <Link to="/" className="text-2xl font-bold text-indigo-600">APPRI</Link>
                        </div>
                        <nav className="flex space-x-4 items-center">
                            <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">{t('nav.markets')}</Link>
                            <Link to="/leaderboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">{t('nav.leaderboard')}</Link>
                            {isLoggedIn ? (
                                <>
                                    <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">{t('nav.dashboard')}</Link>
                                    <Link to="/profile" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">{t('nav.profile')}</Link>
                                    <button onClick={handleLogout} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">{t('nav.logout')}</button>
                                </>
                            ) : (
                                <Link to="/login" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium">{t('nav.login')}</Link>
                            )}
                            <div className="ml-4 flex items-center bg-gray-200 rounded-full p-1">
                                <button
                                    onClick={() => i18n.changeLanguage('en')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${i18n.language === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => i18n.changeLanguage('zh-TW')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${i18n.language === 'zh-TW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    繁中
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-500 text-sm">© 2025 APPRI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
