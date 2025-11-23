import { Outlet, Link, useNavigate } from 'react-router-dom';
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

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0">
                            <Link to="/" className="text-2xl font-bold text-indigo-600">APPRI</Link>
                        </div>
                        <nav className="flex space-x-4 items-center">
                            <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Markets</Link>
                            {isLoggedIn ? (
                                <>
                                    <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                                    <button onClick={handleLogout} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium">Login</Link>
                            )}
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
