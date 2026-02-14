import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, Clock, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getOutcomeColor } from '../utils/colors';

const Home = () => {
    const { t } = useTranslation();
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quickBuyMarket, setQuickBuyMarket] = useState(null);
    const [quickBuyOutcome, setQuickBuyOutcome] = useState(null);
    const [quickBuyAmount, setQuickBuyAmount] = useState('');

    useEffect(() => {
        fetchMarkets();
    }, []);

    const fetchMarkets = async () => {
        try {
            const response = await axios.get('/api/markets');
            setMarkets(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching markets:', error);
            setLoading(false);
        }
    };

    const openQuickBuy = (e, market, outcome) => {
        e.preventDefault(); // Prevent navigation to detail page
        setQuickBuyMarket(market);
        setQuickBuyOutcome(outcome);
        setQuickBuyAmount('');
    };

    const closeQuickBuy = () => {
        setQuickBuyMarket(null);
        setQuickBuyOutcome(null);
        setQuickBuyAmount('');
    };

    const handleQuickBuySubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await axios.post(`/api/markets/${quickBuyMarket.id}/predict`, {
                outcomeId: quickBuyOutcome.id,
                amount: quickBuyAmount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                alert(`Prediction placed! Cost: ₳${response.data.cost.toFixed(2)}`);
                closeQuickBuy();
                fetchMarkets(); // Refresh data
            }
        } catch (error) {
            console.error('Error placing prediction:', error);
            alert(error.response?.data?.error || 'Failed to place prediction');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('home.title')}</h1>
                    <p className="mt-2 text-gray-600">{t('home.subtitle')}</p>
                </div>
            </div>

            {/* Markets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {markets.map(market => {
                    const isResolved = market.status === 'resolved';

                    // PIANO MODE: Gamer UI Card
                    if (import.meta.env.MODE === 'piano') {
                        const isBinary = market.outcomes.length === 2;
                        const leftOutcome = market.outcomes[0];
                        const rightOutcome = market.outcomes[1];
                        // If Left (Yes) is winning (high price), flag should move Left (towards 0).
                        const flagPosition = isBinary ? (100 - (leftOutcome.price * 100)) : 50;

                        return (
                            <div key={market.id} className="group bg-white rounded-3xl border-4 border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col h-full relative">
                                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
                                <div className="p-6 flex-grow">
                                    <h3 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-tight leading-tight">
                                        {market.title}
                                    </h3>

                                    {/* Mini Tug of War */}
                                    {isBinary && (
                                        <div className="mb-6">
                                            <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wide">
                                                <span className="text-blue-600">{leftOutcome.name}</span>
                                                <span className="text-red-500">{rightOutcome.name}</span>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded-full w-full relative overflow-visible">
                                                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 h-full z-0"></div>
                                                <div
                                                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white rounded-full shadow-md z-10 transition-all duration-500 ${flagPosition < 50 ? 'bg-blue-600' : 'bg-red-500'}`}
                                                    style={{ left: `${flagPosition}%` }}
                                                ></div>
                                                <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400">
                                                    <span>{(leftOutcome.price * 100).toFixed(0)}% POW</span>
                                                    <span>{(rightOutcome.price * 100).toFixed(0)}% POW</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {market.outcomes.slice(0, 2).map((outcome, idx) => (
                                            <button
                                                key={outcome.id}
                                                onClick={(e) => openQuickBuy(e, market, outcome)}
                                                className={`
                                                    py-3 px-2 rounded-xl border-b-4 font-black text-sm uppercase transition-all active:border-b-0 active:translate-y-1
                                                    ${idx === 0 ? 'bg-blue-500 hover:bg-blue-400 border-blue-700 text-white' : 'bg-red-500 hover:bg-red-400 border-red-700 text-white'}
                                                `}
                                            >
                                                JOIN {outcome.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Link to={`/markets/${market.id}`} className="block bg-gray-50 hover:bg-indigo-50 p-3 text-center text-xs font-bold text-gray-400 hover:text-indigo-600 border-t border-gray-100 transition-colors uppercase">
                                    View Full Challenge details →
                                </Link>
                            </div>
                        );
                    }

                    // STANDARD UI Card
                    return (
                        <Link to={`/markets/${market.id}`} key={market.id} className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
                            <div className="p-5 flex-grow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            {import.meta.env.MODE === 'superbowl' ? 'NFL' : 'POL'}
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {import.meta.env.MODE === 'superbowl' ? 'SPORTS' : t('home.politics')}
                                        </span>
                                        {isResolved && (
                                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {t('market.resolved')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400 gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>{t('home.vol')}: ₳{market.volume ? parseFloat(market.volume).toLocaleString() : '0'}</span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                    {market.title}
                                </h3>

                                <div className="space-y-3">
                                    {market.outcomes.slice(0, 2).map((outcome, index) => (
                                        <div key={outcome.id} className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-medium text-gray-700 truncate flex-grow">{outcome.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-gray-900">{(outcome.price * 100).toFixed(0)}%</span>
                                                {isResolved && market.winner_outcome_id == outcome.id && (
                                                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {t('market.winner') || 'Winner'}
                                                    </span>
                                                )}
                                                {!isResolved && (
                                                    <button
                                                        onClick={(e) => openQuickBuy(e, market, outcome)}
                                                        className={`px-3 py-1 rounded-md text-xs font-bold border transition-colors ${getOutcomeColor(index, outcome.name)}`}
                                                    >
                                                        Yes/No
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {market.outcomes.length > 2 && (
                                        <div className="text-xs text-gray-400 text-center pt-1">
                                            + {market.outcomes.length - 2} more outcomes
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{t('home.ends')} {new Date(market.resolution_date).toLocaleDateString()}</span>
                                </div>
                                <span className="group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1 text-indigo-600 font-medium">
                                    {isResolved ? t('home.view_results') : t('home.trade')} <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Buy Modal */}
            {quickBuyMarket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    {/* PIANO GAMER MODAL */}
                    {import.meta.env.MODE === 'piano' ? (
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-yellow-400 transform transition-all scale-100">
                            <div className="bg-indigo-600 p-4 flex justify-between items-center">
                                <h3 className="font-black text-white uppercase tracking-wider text-lg">
                                    JOIN TEAM {quickBuyOutcome.name}!
                                </h3>
                                <button onClick={closeQuickBuy} className="text-indigo-200 hover:text-white bg-indigo-700/50 rounded-full p-1 hover:bg-indigo-700 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleQuickBuySubmit}>
                                    <div className="mb-6">
                                        <label className="block text-gray-800 font-bold mb-2 text-lg">
                                            How confident are you?
                                        </label>
                                        <div className="flex items-center gap-4 mb-2">
                                            <input
                                                type="range"
                                                min="1"
                                                max="50"
                                                value={quickBuyAmount || 10}
                                                onChange={(e) => setQuickBuyAmount(e.target.value)}
                                                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                            <span className="text-2xl font-black text-indigo-600 w-12 text-center">{quickBuyAmount || 10}</span>
                                        </div>
                                        <p className="text-xs text-center text-gray-400 font-bold uppercase">
                                            Points to Play
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 border-b-8 border-yellow-600 font-black text-2xl py-4 rounded-xl uppercase tracking-widest shadow-lg active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>🚀</span> LOCK IN!
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        // STANDARD UI MODAL
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-900">{t('home.quick_buy')}: {quickBuyOutcome.name}</h3>
                                <button onClick={closeQuickBuy} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quickBuyMarket.title}</p>
                                <div className="flex justify-between items-center mb-6 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <span className="text-sm font-medium text-indigo-900">{t('home.current_price')}</span>
                                    <span className="text-xl font-bold text-indigo-700">₳{quickBuyOutcome.price.toFixed(2)}</span>
                                </div>

                                <form onSubmit={handleQuickBuySubmit}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('home.shares_to_buy')}</label>
                                    <input
                                        type="number"
                                        value={quickBuyAmount}
                                        onChange={(e) => setQuickBuyAmount(e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border mb-4 text-lg"
                                        placeholder="0"
                                        autoFocus
                                        min="1"
                                        required
                                    />
                                    <div className="flex justify-between text-sm text-gray-500 mb-6">
                                        <span>{t('home.est_cost')}:</span>
                                        <span className="font-bold text-gray-900">
                                            ₳{quickBuyAmount ? (parseFloat(quickBuyAmount) * quickBuyOutcome.price).toFixed(2) : '0.00'}
                                        </span>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md"
                                    >
                                        {t('home.confirm')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
