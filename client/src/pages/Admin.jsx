import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, List, Calendar, Hash, BarChart3, MessageSquare, Plus, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Admin = () => {
    const [markets, setMarkets] = useState([]);
    const [step, setStep] = useState(1); // 1: Type Selection, 2: Configuration
    const [selectedType, setSelectedType] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [resolutionCriteria, setResolutionCriteria] = useState('');
    const [outcomes, setOutcomes] = useState([{ id: 1, name: '' }, { id: 2, name: '' }]);
    const [resolutionDate, setResolutionDate] = useState('');

    useEffect(() => {
        checkAdmin();
        fetchMarkets();
    }, []);

    const checkAdmin = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
            const response = await axios.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.role !== 'admin') {
                alert('Access Denied: Admin only');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            window.location.href = '/login';
        }
    };

    const fetchMarkets = async () => {
        try {
            const response = await axios.get('/api/markets');
            setMarkets(response.data);
        } catch (error) {
            console.error('Error fetching markets:', error);
        }
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setStep(2);
        // Reset/Preset outcomes based on type
        if (type === 'binary') {
            setOutcomes([{ id: 1, name: 'Yes' }, { id: 2, name: 'No' }]);
        } else {
            setOutcomes([{ id: 1, name: '' }, { id: 2, name: '' }]);
        }
    };

    const handleCreateMarket = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/markets', {
                title,
                description,
                resolution_criteria: resolutionCriteria,
                outcomes: outcomes.filter(o => o.name.trim() !== ''),
                resolution_date: resolutionDate,
                type: selectedType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Market created!');
            fetchMarkets();
            setStep(1);
            setTitle('');
            setDescription('');
            setResolutionCriteria('');
            setOutcomes([{ id: 1, name: '' }, { id: 2, name: '' }]);
            setResolutionDate('');
        } catch (error) {
            console.error('Error creating market:', error);
            alert('Failed to create market: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleAddOutcome = () => {
        setOutcomes([...outcomes, { id: outcomes.length + 1, name: '' }]);
    };

    const handleOutcomeChange = (index, value) => {
        const newOutcomes = [...outcomes];
        newOutcomes[index].name = value;
        setOutcomes(newOutcomes);
    };

    const handleRemoveOutcome = (index) => {
        if (outcomes.length > 2) {
            const newOutcomes = outcomes.filter((_, i) => i !== index).map((o, i) => ({ ...o, id: i + 1 }));
            setOutcomes(newOutcomes);
        }
    };

    const handleResolve = async (marketId, outcomeId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/markets/${marketId}/resolve`, { outcomeId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Market resolved!');
            fetchMarkets();
        } catch (error) {
            console.error('Error resolving market:', error);
            alert('Failed to resolve market');
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Create New Market</h1>

            {step === 1 && (
                <div>
                    <h2 className="text-xl font-semibold mb-6 text-gray-800">Choose question type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <TypeCard
                            icon={<CheckCircle2 className="w-8 h-8 text-blue-500" />}
                            title="Yes/No"
                            description="Will NASA confirm the discovery of aliens before 2025?"
                            onClick={() => handleTypeSelect('binary')}
                        />
                        <TypeCard
                            icon={<List className="w-8 h-8 text-purple-500" />}
                            title="Multiple Choice"
                            description="Who will be the next president of the United States?"
                            onClick={() => handleTypeSelect('multiple_choice')}
                        />
                        <TypeCard
                            icon={<Hash className="w-8 h-8 text-indigo-500" />}
                            title="Numeric"
                            description="How many people will come to Taco Tuesday?"
                            disabled
                        />
                        <TypeCard
                            icon={<Calendar className="w-8 h-8 text-green-500" />}
                            title="Date"
                            description="When will OpenAI release GPT-7?"
                            disabled
                        />
                        <TypeCard
                            icon={<BarChart3 className="w-8 h-8 text-orange-500" />}
                            title="Poll"
                            description="Which color should I wear to prom?"
                            disabled
                        />
                        <TypeCard
                            icon={<MessageSquare className="w-8 h-8 text-teal-500" />}
                            title="Discussion Post"
                            description="Share groups of markets, updates, ideas, or stories."
                            disabled
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <button onClick={() => setStep(1)} className="mb-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        ← Back to types
                    </button>

                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                        {selectedType === 'binary' ? 'Yes/No Question' : 'Multiple Choice Question'}
                    </h2>

                    <form onSubmit={handleCreateMarket} className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border text-lg"
                                placeholder="e.g. Will it rain tomorrow?"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Background (Optional)</label>
                            <ReactQuill
                                theme="snow"
                                value={description}
                                onChange={setDescription}
                                className="bg-white"
                                placeholder="Provide background info..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Criteria</label>
                            <ReactQuill
                                theme="snow"
                                value={resolutionCriteria}
                                onChange={setResolutionCriteria}
                                className="bg-white"
                                placeholder="Define exactly how this market will be resolved..."
                            />
                        </div>

                        {selectedType === 'multiple_choice' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Answers</label>
                                <div className="space-y-3">
                                    {outcomes.map((outcome, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="text-gray-400 w-6 text-right">{index + 1}.</span>
                                            <input
                                                type="text"
                                                value={outcome.name}
                                                onChange={(e) => handleOutcomeChange(index, e.target.value)}
                                                className="flex-grow border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                                                placeholder={`Option ${index + 1}`}
                                                required
                                            />
                                            {outcomes.length > 2 && (
                                                <button type="button" onClick={() => handleRemoveOutcome(index)} className="text-gray-400 hover:text-red-500">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleAddOutcome} className="mt-3 text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Add answer
                                </button>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Date</label>
                            <input
                                type="date"
                                value={resolutionDate}
                                onChange={e => setResolutionDate(e.target.value)}
                                className="w-full md:w-1/3 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                                required
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button type="submit" className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md text-lg">
                                Create Market
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Manage Markets</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {markets.map(market => (
                        <div key={market.id} className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{market.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Status: <span className={`capitalize ${market.status === 'open' ? 'text-green-600' : 'text-gray-600'}`}>{market.status}</span></p>
                                </div>
                                {market.status === 'open' && (
                                    <div className="flex flex-wrap gap-2 justify-end max-w-md">
                                        {market.outcomes.map(outcome => (
                                            <button
                                                key={outcome.id}
                                                onClick={() => handleResolve(market.id, outcome.id)}
                                                className="bg-gray-100 text-gray-700 px-3 py-1 text-xs rounded-full hover:bg-green-600 hover:text-white transition-colors"
                                            >
                                                Resolve: {outcome.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TypeCard = ({ icon, title, description, onClick, disabled }) => (
    <div
        onClick={!disabled ? onClick : undefined}
        className={`p-6 rounded-xl border transition-all duration-200 text-left ${disabled
            ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
            : 'bg-white border-gray-200 hover:border-indigo-500 hover:shadow-md cursor-pointer'
            }`}
    >
        <div className="mb-4">{icon}</div>
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
    </div>
);

export default Admin;
