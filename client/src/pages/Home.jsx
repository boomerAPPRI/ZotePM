import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { X, AlertCircle } from 'lucide-react';

const Home = () => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [selectedOutcome, setSelectedOutcome] = useState(null);
    const [predictionAmount, setPredictionAmount] = useState('');

    useEffect(() => {
        fetchMarkets();
    }, []);

    const fetchMarkets = async () => {
        try {
            const response = await axios.get('/api/markets');
            setMarkets(response.data);
        } catch (error) {
            console.error('Error fetching markets:', error);
        } finally {
            setLoading(false);
        }
    };

    const openQuickBuy = (e, market, outcome) => {
        e.preventDefault(); // Prevent navigation to detail page
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        setSelectedMarket(market);
        setSelectedOutcome(outcome);
        setPredictionAmount('');
        setIsModalOpen(true);
    };

    const handleQuickPrediction = async () => {
        if (!selectedMarket || !selectedOutcome || !predictionAmount) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/api/markets/${selectedMarket.id}/predict`, {
                outcomeId: selectedOutcome.id,
                amount: predictionAmount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Prediction placed! Cost: ${response.data.cost.toFixed(2)} APPRI`);
            setIsModalOpen(false);
            fetchMarkets(); // Refresh prices
        } catch (error) {
            console.error('Error placing prediction:', error);
            alert('Failed to place prediction. Check your balance.');
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading markets...</div>;
    }

    return (
        <div>
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                    Predict the Future
                </h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                    Trade on the outcome of future events with APPRI tokens.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 sm:grid-cols-1">
                {markets.map((market) => (
                    <Link key={market.id} to={`/markets/${market.id}`} className="block group">
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200 h-full flex flex-col">
                            <div className="px-6 py-5 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {market.title}
                                    </h3>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        Ends {new Date(market.resolution_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {market.outcomes && market.outcomes.map((outcome) => (
                                        <button
                                            key={outcome.id}
                                            onClick={(e) => openQuickBuy(e, market, outcome)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${outcome.name === 'Yes' ? 'bg-green-50 border-green-200 hover:bg-green-100' :
                                                    outcome.name === 'No' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
                                                        'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span className={`text-sm font-bold ${outcome.name === 'Yes' ? 'text-green-800' :
                                                    outcome.name === 'No' ? 'text-red-800' :
                                                        'text-gray-800'
                                                }`}>{outcome.name}</span>
                                            <span className="text-lg font-bold text-gray-900">{(outcome.price * 100).toFixed(0)}%</span>
                                            <span className="text-xs text-gray-500">{(outcome.price).toFixed(2)} APPRI</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Buy Modal */}
            {isModalOpen && selectedMarket && selectedOutcome && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">Place Prediction</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {selectedMarket.title} - <span className="font-bold text-indigo-600">{selectedOutcome.name}</span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shares to Buy</label>
                                <input
                                    type="number"
                                    value={predictionAmount}
                                    onChange={(e) => setPredictionAmount(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                                    placeholder="Amount"
                                    autoFocus
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Price per share</span>
                                    <span className="font-medium">{(selectedOutcome.price).toFixed(2)} APPRI</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Est. Cost</span>
                                    <span className="font-medium">
                                        {predictionAmount ? `~${(predictionAmount * selectedOutcome.price).toFixed(2)}` : '-'} APPRI
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                                    <span className="text-gray-500">Potential Payout</span>
                                    <span className="font-bold text-green-600">
                                        {predictionAmount ? `${predictionAmount}` : '-'} APPRI
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleQuickPrediction}
                                disabled={!predictionAmount || parseFloat(predictionAmount) <= 0}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Confirm Prediction
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
