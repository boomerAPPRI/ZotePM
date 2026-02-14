import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');

    const handleLogin = () => {
        window.location.href = '/auth/line';
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isRegister ? '/auth/register' : '/auth/login';
            const payload = isRegister ? { email, password, name } : { email, password };

            const response = await axios.post(endpoint, payload);
            const { token } = response.data;

            localStorage.setItem('token', token);
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Auth error:', error);
            alert(isRegister ? t('login_page.registration_failed') : t('login_page.login_failed'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {isRegister ? t('login_page.create_account_title') : t('login_page.sign_in_title')}
                </h2>
                <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                        {t('login_page.or')}{' '}
                        <button onClick={() => setIsRegister(!isRegister)} className="font-medium text-indigo-600 hover:text-indigo-500">
                            {isRegister ? t('login_page.sign_in_existing') : t('login_page.create_new')}
                        </button>
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleEmailAuth}>
                        {isRegister && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('login_page.name')}</label>
                                <div className="mt-1">
                                    <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('login_page.email')}</label>
                            <div className="mt-1">
                                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('login_page.password')}</label>
                                {!isRegister && (
                                    <div className="text-sm">
                                        <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                                            {t('login_page.forgot_password') || 'Forgot your password?'}
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="mt-1">
                                <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                {isRegister ? t('login_page.register_button') : t('login_page.sign_in_button')}
                            </button>
                        </div>
                    </form>

                    {/* 
                         <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">{t('login_page.continue_with')}</span>
                                </div>
                            </div>
                        
                        <div className="mt-6">
                            <button
                                onClick={handleLogin}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00C300] hover:bg-[#00B300]"
                            >
                                {t('login_page.sign_in_line')}
                            </button>
                        </div>
                        */}
                </div>
            </div>
        </div>
    );
};

export default Login;
