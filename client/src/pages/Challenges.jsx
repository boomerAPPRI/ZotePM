import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Challenges = () => {
    const { t } = useTranslation();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const fetchChallenges = async () => {
            try {
                const response = await axios.get('/api/challenges');
                setChallenges(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching challenges:', error);
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                {t('challenges.title') || 'Active Challenges'}
            </h1>

            {challenges.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No active challenges at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h2>
                                    <p className="text-gray-600 mb-4">{challenge.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {challenge.markets && challenge.markets.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Eligible Markets</p>
                                            <div className="flex flex-wrap gap-2">
                                                {challenge.markets.map(market => (
                                                    <Link
                                                        key={market.id}
                                                        to={`/markets/${market.id}`}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                    >
                                                        {market.title}
                                                    </Link>
                                                ))}
                                                {challenge.market_ids && challenge.market_ids.length > 4 && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                                                        +{challenge.market_ids.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Link
                                    to={`/challenges/${challenge.id}`}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    View Leaderboard
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Challenges;
