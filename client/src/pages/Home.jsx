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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {markets.map(market => {
                    const isResolved = market.status === 'resolved';
                    return (
                        <Link to={`/market/${market.id}`} key={market.id} className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
                            <div className="p-5 flex-grow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            POL
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('home.politics')}</span>
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
                    )
                })}
            </div>

            {/* Quick Buy Modal */}
            {quickBuyMarket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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
                </div>
            )}
        </div>
    );
};

export default Home;
