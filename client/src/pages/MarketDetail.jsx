import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const MarketDetail = () => {
    const { id } = useParams();
    const [market, setMarket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [predictionAmount, setPredictionAmount] = useState('');
    const [selectedOutcome, setSelectedOutcome] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [estimatedCost, setEstimatedCost] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        fetchMarket();
    }, [id]);

    const fetchMarket = async () => {
        try {
            const response = await axios.get(`/api/markets/${id}`);
            setMarket(response.data);
        } catch (error) {
            console.error('Error fetching market:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrediction = async () => {
        if (!selectedOutcome || !predictionAmount) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/api/markets/${id}/predict`, {
                outcomeId: selectedOutcome,
                amount: predictionAmount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Prediction placed! Cost: ${response.data.cost.toFixed(2)} APPRI`);
            setPredictionAmount('');
            setSelectedOutcome(null);
            fetchMarket(); // Refresh to show new prices
        } catch (error) {
            console.error('Error placing prediction:', error);
            alert('Failed to place prediction');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!market) return <div className="text-center mt-10 text-gray-500">Market not found</div>;

    const selectedOutcomeObj = market.outcomes.find(o => o.id === selectedOutcome);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Ends {new Date(market.resolution_date).toLocaleDateString()}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{market.title}</h1>
                <p className="text-lg text-gray-600 max-w-3xl">{market.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Chart & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Placeholder Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                Market Trend
                            </h3>
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">24H Volume: $12.4k</span>
                        </div>
                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                            <span className="text-gray-400">Chart Visualization Coming Soon</span>
                        </div>
                    </div>

                    {/* Outcomes List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Outcomes</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {market.outcomes.map((outcome) => (
                                <div
                                    key={outcome.id}
                                    onClick={() => setSelectedOutcome(outcome.id)}
                                    className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${selectedOutcome === outcome.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 ${selectedOutcome === outcome.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                                            }`}></div>
                                        <span className="font-medium text-gray-900">{outcome.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-500">{outcome.quantity ? Math.round(outcome.quantity) : 0} shares</span>
                                        <span className={`px-3 py-1 rounded-md text-sm font-bold ${outcome.name === 'Yes' ? 'bg-green-100 text-green-700' :
                                            outcome.name === 'No' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {(outcome.price * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Betting Interface */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Place Order</h3>

                        {!isLoggedIn ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                <p className="text-sm text-yellow-700">
                                    <a href="/login" className="font-semibold underline hover:text-yellow-800">Log in</a> to trade on this market.
                                </p>
                            </div>
                        ) : !selectedOutcome ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">Select an outcome from the list to start trading.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <span className="text-sm text-indigo-700 font-medium">Buying</span>
                                    <span className="font-bold text-indigo-900">{selectedOutcomeObj?.name}</span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shares to Buy
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            value={predictionAmount}
                                            onChange={(e) => setPredictionAmount(e.target.value)}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-lg border-gray-300 rounded-md py-3"
                                            placeholder="0"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">Shares</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Current Price</span>
                                        <span className="font-medium">{(selectedOutcomeObj?.price).toFixed(2)} APPRI</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Est. Cost</span>
                                        <span className="font-medium text-gray-900">
                                            {/* Simple estimation for UI, real cost calculated on backend */}
                                            {predictionAmount ? `~${(predictionAmount * selectedOutcomeObj?.price).toFixed(2)} APPRI` : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Potential Payout</span>
                                        <span className="font-medium text-green-600">
                                            {predictionAmount ? `${predictionAmount} APPRI` : '-'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePrediction}
                                    disabled={!predictionAmount || parseFloat(predictionAmount) <= 0}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${!predictionAmount || parseFloat(predictionAmount) <= 0
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                        }`}
                                >
                                    Place Prediction
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketDetail;
