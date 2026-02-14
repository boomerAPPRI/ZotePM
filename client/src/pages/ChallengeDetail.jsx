import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Medal, AlertCircle, Calendar, ArrowRight, Clock } from 'lucide-react';

const ChallengeDetail = () => {
    const { id } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch Challenge Details
                const challengeResponse = await axios.get(`/api/challenges/${id}`);
                setChallenge(challengeResponse.data);

                // Fetch Leaderboard
                const leaderboardResponse = await axios.get(`/api/challenges/${id}/leaderboard`);
                setLeaderboard(leaderboardResponse.data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load challenge details.');
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

    const isActive = new Date() >= new Date(challenge.start_date) && new Date() <= new Date(challenge.end_date);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link to="/challenges" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block font-medium">← Back to Challenges</Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            {challenge.title}
                        </h1>
                        <p className="text-gray-600 mb-4 text-lg">{challenge.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                            </div>
                            <div className={`px-2 py-0.5 rounded text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {isActive ? 'ACTIVE' : 'Ended/Upcoming'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Leaderboard */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-indigo-800">
                                Rankings are based on <strong>Net Profit</strong> from trades made <em>within the challenge window</em>.
                                Profit = (Value at Challenge End) - (Cost).
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Trades</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                No participants yet. Be the first to trade!
                                            </td>
                                        </tr>
                                    ) : (
                                        leaderboard.map((entry, index) => {
                                            let rankIcon = null;
                                            if (index === 0) rankIcon = <Medal className="w-5 h-5 text-yellow-500 inline mr-1" />;
                                            if (index === 1) rankIcon = <Medal className="w-5 h-5 text-gray-400 inline mr-1" />;
                                            if (index === 2) rankIcon = <Medal className="w-5 h-5 text-amber-700 inline mr-1" />;

                                            const isPositive = entry.profit >= 0;

                                            return (
                                                <tr key={entry.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {rankIcon}
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                                                            {entry.country && (
                                                                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                    {entry.country}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                        {isPositive ? '+' : ''}₳{entry.profit.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                        {entry.trades}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Eligible Markets */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Eligible Markets</h3>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {challenge.markets && challenge.markets.length > 0 ? (
                                challenge.markets.map(market => (
                                    <Link key={market.id} to={`/markets/${market.id}`} className="block p-4 hover:bg-gray-50 transition-colors group">
                                        <h4 className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 mb-1 line-clamp-2">
                                            {market.title}
                                        </h4>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className={`text-xs px-2 py-0.5 rounded ${market.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {market.status}
                                            </span>
                                            {market.end_date && (
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(market.end_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-6 text-center">
                                    <p className="text-sm text-gray-600 mb-2">All active markets are eligible for this challenge!</p>
                                    <Link to="/" className="text-indigo-600 text-sm font-medium hover:underline flex items-center justify-center gap-1">
                                        Browse Markets <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeDetail;
