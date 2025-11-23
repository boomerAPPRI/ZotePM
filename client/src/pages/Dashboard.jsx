import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Account Information</h3>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.name}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Balance</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.balance} APPRI</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Predictions</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    <li className="px-4 py-4 sm:px-6 text-gray-500 text-sm text-center">
                        No predictions placed yet.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
