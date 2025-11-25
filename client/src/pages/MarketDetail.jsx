import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpRight, DollarSign, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import 'react-quill-new/dist/quill.snow.css';

import { getOutcomeColor, getOutcomeStroke } from '../utils/colors';
import lmsr from '../utils/lmsr';

const MarketDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [market, setMarket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [selectedOutcome, setSelectedOutcome] = useState(null);
    const [predictionCost, setPredictionCost] = useState(null);
    const [userBalance, setUserBalance] = useState(null);

    // Mock data for chart - in real app, fetch historical prices
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (id) {
            fetchMarket();
            fetchUserBalance();
            fetchHistory();
        }
    }, [id]);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`/api/markets/${id}/history`);
            const historyData = response.data;

            if (historyData && historyData.length > 0) {
                const formattedData = historyData.map(point => {
                    const date = new Date(point.timestamp);
                    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    return {
                        name: formattedDate,
                        ...point.prices
                    };
                });
                setChartData(formattedData);
            } else {
                setChartData([]);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const fetchMarket = async () => {
        try {
            const response = await axios.get(`/api/markets/${id}`);
            setMarket(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching market:', error);
            setLoading(false);
        }
    };

    const fetchUserBalance = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get('/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserBalance(response.data.balance);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const handleOutcomeSelect = (outcome) => {
        setSelectedOutcome(outcome);
        setAmount('');
        setPredictionCost(null);
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        setAmount(val);
        if (val && selectedOutcome && !isNaN(parseFloat(val))) {
            // Use LMSR to calculate accurate cost
            const outcomeIndex = market.outcomes.findIndex(o => o.id === selectedOutcome.id);
            const currentQuantities = market.outcomes.map(o => parseFloat(o.quantity || 0));
            const cost = lmsr.calculateTradeCost(currentQuantities, outcomeIndex, parseFloat(val));
            setPredictionCost(cost.toFixed(2));
        } else {
            setPredictionCost(null);
        }
    };

    const handlePlacePrediction = async () => {
        if (!selectedOutcome || !amount) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to place a prediction');
                return;
            }

            const response = await axios.post(`/api/markets/${id}/predict`, {
                outcomeId: selectedOutcome.id,
                amount: amount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                alert(`Prediction placed! Cost: ₳${response.data.cost.toFixed(2)}`);
                setAmount('');
                setSelectedOutcome(null);
                setPredictionCost(null);
                fetchMarket();
                fetchUserBalance();
                fetchHistory();
            }
        } catch (error) {
            console.error('Error placing prediction:', error);
            alert(error.response?.data?.error || 'Failed to place prediction');
        }
    };

    // Calculate 24H Volume
    const get24HVolume = () => {
        if (!market) return '0';
        const createdDate = new Date(market.created_at);
        const now = new Date();
        const isNew = (now - createdDate) < 24 * 60 * 60 * 1000;

        // If market is less than 24h old, 24H volume = Total Volume
        if (isNew) {
            return market.volume ? parseFloat(market.volume).toFixed(0) : '0';
        }

        // Otherwise, mock it as 10% for now (until we have real historical data)
        return market.volume ? (parseFloat(market.volume) * 0.1).toFixed(0) : '0';
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!market) return <div className="text-center mt-10">Market not found</div>;

    const isResolved = market.status === 'resolved';

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="uppercase tracking-wide font-semibold text-xs">{t('home.politics')}</span>
                    <span>•</span>
                    <span>{t('home.ends')} {new Date(market.resolution_date).toLocaleDateString()}</span>
                    {isResolved && (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                            {t('market.resolved')}
                        </span>
                    )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{market.title}</h1>
                <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{t('home.vol')}: ₳{market.volume ? parseFloat(market.volume).toLocaleString() : '0'}</span>
                    </div>
                    {/* Placeholder for other stats */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Chart & Description */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Chart Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <ArrowUpRight className="w-5 h-5 text-indigo-500" />
                                {t('market.market_trend')}
                            </h2>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {t('market.vol_24h')}: ₳{get24HVolume()}
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
                                        />
                                        {market.outcomes && Array.isArray(market.outcomes) && market.outcomes.map((outcome, index) => (
                                            <Line
                                                key={outcome.id || index}
                                                type="monotone"
                                                dataKey={outcome.name}
                                                stroke={getOutcomeStroke(index, outcome.name)}
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6 }}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    Loading chart data...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description & Resolution Criteria */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">{t('market.rules')}</h3>
                            <div className="ql-snow">
                                <div
                                    className="ql-editor text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(market.description || "No background provided.")
                                    }}
                                />
                            </div>
                        </div>

                        {market.resolution_criteria && (
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-3">{t('market.resolution_criteria')}</h3>
                                <div className="ql-snow">
                                    <div
                                        className="ql-editor text-gray-600 leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(market.resolution_criteria)
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Betting Interface */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg sticky top-6 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900 text-lg">
                                {isResolved ? t('market.market_resolved') : t('market.make_prediction')}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {isResolved ? t('market.market_ended') : t('market.select_outcome')}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Outcome Selection */}
                            <div className="space-y-3">
                                {market.outcomes.map((outcome, index) => {
                                    // Logic to highlight winning outcome
                                    // Use loose equality to handle potential type mismatches (string vs number)
                                    const isWinner = isResolved && market.winner_outcome_id == outcome.id;

                                    return (
                                        <button
                                            key={outcome.id}
                                            onClick={() => !isResolved && handleOutcomeSelect(outcome)}
                                            disabled={isResolved}
                                            className={`w-full flex justify-between items-center p-4 rounded-lg border-2 transition-all
                                            ${isResolved
                                                    ? (isWinner
                                                        ? 'border-green-500 bg-green-50 ring-1 ring-green-500 opacity-100'
                                                        : 'border-gray-100 bg-gray-50 opacity-50')
                                                    : (selectedOutcome?.id === outcome.id
                                                        ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50')
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isWinner && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                                <span className={`font-bold ${isResolved && isWinner ? 'text-green-900' : (selectedOutcome?.id === outcome.id ? 'text-indigo-900' : 'text-gray-700')}`}>
                                                    {outcome.name}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-lg font-bold ${isResolved && isWinner ? 'text-green-700' : (selectedOutcome?.id === outcome.id ? 'text-indigo-700' : getOutcomeColor(index, outcome.name).split(' ')[1])}`}>
                                                    {(outcome.price * 100).toFixed(0)}%
                                                </div>
                                                {!isResolved && (
                                                    <div className="text-xs text-gray-400">
                                                        ₳{outcome.price.toFixed(2)} / share
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Amount Input - Hide if resolved */}
                            {!isResolved && selectedOutcome && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('market.shares_for')} "{selectedOutcome.name}"
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-lg"
                                            placeholder="0"
                                            min="1"
                                        />
                                        <div className="absolute right-4 top-3 text-gray-400">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                    </div>
                                    {predictionCost && (
                                        <div className="text-sm text-gray-500 mt-2 flex justify-between">
                                            <span>{t('market.est_cost')}:</span>
                                            <span className="font-medium text-indigo-600">₳{predictionCost}</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePlacePrediction}
                                        className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors shadow-md"
                                    >
                                        {t('market.predict')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketDetail;
