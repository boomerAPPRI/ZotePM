import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, MapPin, Briefcase, Calendar, Trophy } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../context/AuthContext';



const Profile = () => {
    const { t } = useTranslation();
    const { refreshUser } = useAuth(); // Get refreshUser from context
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        country: '',
        city: '',
        age_range: '',
        occupation: '',
        termsAccepted: false
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            setFormData({
                country: response.data.country || '',
                city: response.data.city || '',
                age_range: response.data.age_range || '',
                occupation: response.data.occupation || '',
                termsAccepted: !!response.data.terms_accepted_at
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.put('/auth/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(t('profile.save_success')); // Connect to existing key
            await fetchProfile(); // Refresh local data 
            await refreshUser(); // Refresh global context for Navbar
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage(t('profile.fail'));
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!user) return <div className="text-center mt-10">Please login to view profile.</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('profile.title')}</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                </div>

                <div className="p-6">
                    {/* Profile Completion Reward Banner */}
                    {!user.profile_completed && (
                        <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white shadow-md flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-300" />
                                    Complete Your Profile
                                </h3>
                                <p className="text-indigo-100 text-sm">
                                    Fill in your Country, City, Age, and Occupation to instantly earn <span className="font-bold text-white">₳500</span>!
                                </p>
                            </div>
                            <div className="bg-white/20 p-2 rounded-full">
                                <span className="text-2xl font-bold">₳500</span>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('success') || message === t('profile.success') || message.includes('earned') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> {t('profile.country')}
                                </label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                                >
                                    <option value="">{t('profile.placeholders.select_country')}</option>
                                    {t('profile.options.countries', { returnObjects: true }).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> {t('profile.city')}
                                </label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={!formData.country}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <option value="">{t('profile.placeholders.select_city')}</option>
                                    {formData.country && t('profile.options.cities', { returnObjects: true })[formData.country]?.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Age Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> {t('profile.age_range')}
                                </label>
                                <select
                                    name="age_range"
                                    value={formData.age_range}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                                >
                                    <option value="">{t('profile.placeholders.select_age')}</option>
                                    {t('profile.options.age_ranges', { returnObjects: true }).map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>

                            {/* Occupation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> {t('profile.occupation')}
                                </label>
                                <select
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                                >
                                    <option value="">{t('profile.placeholders.select_occupation')}</option>
                                    {t('profile.options.occupations', { returnObjects: true }).map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Terms & Legal */}
                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Legal</h3>
                            {user.terms_accepted_at ? (
                                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-800">
                                            <Trans
                                                i18nKey="profile.terms_accepted"
                                                values={{ date: new Date(user.terms_accepted_at).toLocaleDateString() }}
                                                components={{
                                                    1: <a href="/terms" target="_blank" className="underline hover:text-green-900 font-bold">Terms</a>,
                                                    3: <a href="/privacy" target="_blank" className="underline hover:text-green-900 font-bold">Privacy</a>
                                                }}
                                            />
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        required
                                        name="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleChange}
                                        className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-600">
                                        <Trans
                                            i18nKey="privacy.consent"
                                            components={{
                                                1: <a href="/privacy" target="_blank" className="text-indigo-600 hover:text-indigo-500 font-medium">Privacy Policy</a>,
                                                3: <a href="/terms" target="_blank" className="text-indigo-600 hover:text-indigo-500 font-medium">Terms of Service</a>
                                            }}
                                        />
                                    </span>
                                </label>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                {t('profile.save')}
                            </button>
                        </div>
                    </form>

                    {/* Debug Button for Testing - Visible to all for now or check admin */}
                    {/* Debug Button Hidden for Production */}
                    {/* <div className="mt-8 border-t pt-4">
                        <button ... > ... </button>
                    </div> */}
                </div>
            </div>

            {/* Change Password Section */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                </div>
                <div className="p-6">
                    <ChangePasswordForm />
                </div>
            </div>
        </div>
    );
};

const ChangePasswordForm = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/auth/change-password',
                { currentPassword: formData.currentPassword, newPassword: formData.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(response.data.message);
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change password');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && <div className="text-green-600 text-sm">{message}</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                />
            </div>
            <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
            >
                Update Password
            </button>
        </form>
    );
};

export default Profile;
