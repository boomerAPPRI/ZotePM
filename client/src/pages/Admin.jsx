import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, List, Calendar, Hash, BarChart3, MessageSquare, Plus, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('create'); // 'create', 'manage', 'reports'
    const [step, setStep] = useState(1); // 1: Type Selection, 2: Configuration
    const [editingMarket, setEditingMarket] = useState(null);
    const [markets, setMarkets] = useState([]);

    // Market Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [resolutionCriteria, setResolutionCriteria] = useState('');
    const [resolutionDate, setResolutionDate] = useState('');
    const [selectedType, setSelectedType] = useState('binary');
    const [outcomes, setOutcomes] = useState([{ id: 1, name: '' }, { id: 2, name: '' }]);

    // Challenge State
    const [challenges, setChallenges] = useState([]);
    const [selectedChallengeMarkets, setSelectedChallengeMarkets] = useState([]);
    const [challengeTitle, setChallengeTitle] = useState('');
    const [challengeDesc, setChallengeDesc] = useState('');
    const [challengeStart, setChallengeStart] = useState('');
    const [challengeEnd, setChallengeEnd] = useState('');
    const [editingChallenge, setEditingChallenge] = useState(null);

    // Feedback State
    const [feedbackEnabled, setFeedbackEnabled] = useState(false);
    const [feedbackList, setFeedbackList] = useState([]);

    const [reviews, setReviews] = useState([]); // This variable wasn't in original file, but I need `users` state.
    const [users, setUsers] = useState([]);

    useEffect(() => {
        checkAdmin();
        fetchMarkets();
        if (activeTab === 'challenges') fetchChallenges();
        if (activeTab === 'settings') fetchSettings();
        if (activeTab === 'feedback') fetchFeedback();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab]);

    const checkAdmin = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.role !== 'admin') {
                window.location.href = '/';
            }
        } catch (error) {
            window.location.href = '/login';
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/auth/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to fetch users');
        }
    };

    const handleExportUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/auth/users/${userId}/export`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `user_${userId}_data.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting user data:', error);
            alert('Failed to export user data');
        }
    };

    const fetchMarkets = async () => {
        try {
            const response = await axios.get('/api/markets?all=true'); // Assuming backend supports all=true to see archived/closed
            setMarkets(response.data);
        } catch (error) {
            console.error('Error fetching markets:', error);
        }
    };

    const fetchChallenges = async () => {
        try {
            const response = await axios.get('/api/challenges');
            setChallenges(response.data);
        } catch (error) {
            console.error('Error fetching challenges:', error);
        }
    };

    const fetchSettings = async () => {
        try {
            // Use public status endpoint for reading
            const response = await axios.get('/api/feedback/status');
            setFeedbackEnabled(response.data.enabled);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchFeedback = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/feedback', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbackList(response.data);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setResolutionCriteria('');
        setResolutionDate('');
        setOutcomes([{ id: 1, name: '' }, { id: 2, name: '' }]);
        setEditingMarket(null);
        setSelectedType('binary');
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setStep(2);
    };

    const handleAddOutcome = () => {
        setOutcomes([...outcomes, { id: outcomes.length + 1, name: '' }]);
    };

    const handleRemoveOutcome = (index) => {
        setOutcomes(outcomes.filter((_, i) => i !== index));
    };

    const handleOutcomeChange = (index, value) => {
        const newOutcomes = [...outcomes];
        newOutcomes[index].name = value;
        setOutcomes(newOutcomes);
    };

    const handleCreateMarket = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                title,
                description,
                resolution_criteria: resolutionCriteria,
                resolution_date: resolutionDate,
                type: selectedType,
                outcomes: selectedType === 'binary'
                    ? [{ id: 1, name: 'Yes' }, { id: 2, name: 'No' }]
                    : outcomes
            };

            await axios.post('/api/markets', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Market created successfully!');
            resetForm();
            setStep(1);
            fetchMarkets();
        } catch (error) {
            console.error('Error creating market:', error);
            alert('Failed to create market');
        }
    };

    const startEditing = (market) => {
        setEditingMarket(market);
        setTitle(market.title);
        setDescription(market.description || '');
        setResolutionCriteria(market.resolution_criteria || '');
        // Format date for date input (YYYY-MM-DD) or datetime-local
        // Input type is "date" so YYYY-MM-DD
        const date = new Date(market.resolution_date);
        setResolutionDate(date.toISOString().split('T')[0]);
        setSelectedType(market.type);
        setOutcomes(market.outcomes || []);
        setStep(2);
        setActiveTab('create');
    };

    const handleUpdateMarket = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                title,
                description,
                resolution_criteria: resolutionCriteria,
                resolution_date: resolutionDate,
                outcomes: outcomes // Usually outcomes aren't editable if bets exist, but for now allow
            };

            await axios.put(`/api/markets/${editingMarket.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Market updated successfully!');
            resetForm();
            setStep(1);
            setActiveTab('manage');
            fetchMarkets();
        } catch (error) {
            console.error('Error updating market:', error);
            alert('Failed to update market');
        }
    };

    const handleArchiveMarket = async (id) => {
        if (!confirm('Are you sure you want to archive this market?')) return;
        try {
            const token = localStorage.getItem('token');
            // Using delete endpoint which likely archives or deletes
            await axios.delete(`/api/markets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMarkets();
        } catch (error) {
            console.error('Error archiving market:', error);
            alert('Failed to archive market');
        }
    };

    const handleUnarchiveMarket = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/markets/${id}/unarchive`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMarkets();
        } catch (error) {
            console.error('Error unarchiving market:', error);
            alert('Failed to unarchive market');
        }
    };

    const handleResolve = async (marketId, outcomeId) => {
        if (!confirm('Are you sure? This will payout all bets!')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/markets/${marketId}/resolve`,
                { winner_outcome_id: outcomeId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Market resolved successfully!');
            fetchMarkets();
        } catch (error) {
            console.error('Error resolving market:', error);
            alert('Failed to resolve market');
        }
    };

    // Challenge Handlers
    const resetChallengeForm = () => {
        setChallengeTitle('');
        setChallengeDesc('');
        setChallengeStart('');
        setChallengeEnd('');
        setSelectedChallengeMarkets([]);
        setEditingChallenge(null);
    };

    const startEditingChallenge = (challenge) => {
        setEditingChallenge(challenge);
        setChallengeTitle(challenge.title);
        setChallengeDesc(challenge.description || '');
        // Format for datetime-local: YYYY-MM-DDTHH:mm
        const formatDate = (d) => new Date(d).toISOString().slice(0, 16);
        setChallengeStart(formatDate(challenge.start_date));
        setChallengeEnd(formatDate(challenge.end_date));
        setSelectedChallengeMarkets(challenge.market_ids || []);
    };

    const toggleMarketSelection = (marketId) => {
        setSelectedChallengeMarkets(prev => {
            if (prev.includes(marketId)) return prev.filter(id => id !== marketId);
            return [...prev, marketId];
        });
    };

    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                title: challengeTitle,
                description: challengeDesc,
                start_date: challengeStart,
                end_date: challengeEnd,
                market_ids: selectedChallengeMarkets.length > 0 ? selectedChallengeMarkets : null
            };
            await axios.post('/api/challenges', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Challenge created!');
            resetChallengeForm();
            fetchChallenges();
        } catch (error) {
            console.error('Error creating challenge:', error);
            alert('Failed to create challenge');
        }
    };

    const handleUpdateChallenge = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                title: challengeTitle,
                description: challengeDesc,
                start_date: challengeStart,
                end_date: challengeEnd,
                market_ids: selectedChallengeMarkets.length > 0 ? selectedChallengeMarkets : null
            };
            await axios.put(`/api/challenges/${editingChallenge.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Challenge updated!');
            resetChallengeForm();
            fetchChallenges();
        } catch (error) {
            console.error('Error updating challenge:', error);
            alert('Failed to update challenge');
        }
    };

    const handleArchiveChallenge = async (id) => {
        if (!confirm('Archive this challenge?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/challenges/${id}/archive`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchChallenges();
        } catch (error) {
            console.error('Error archiving challenge:', error);
        }
    };

    // Settings & Feedback
    const toggleFeedback = async () => {
        try {
            const token = localStorage.getItem('token');
            const newState = !feedbackEnabled;
            await axios.post('/api/admin/feedback/toggle',
                { enabled: newState },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFeedbackEnabled(newState);
        } catch (error) {
            console.error('Error toggling feedback:', error);
            alert('Failed to toggle feedback');
        }
    };

    const openScreenshot = (url) => {
        window.open(url, '_blank');
    };

    const downloadReport = async (type) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/admin/reports/${type}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`); // Default csv, full-dump handles json internally? 
            // Actually full-dump returns JSON usually, but blob handles it.
            // Let's deduce extension
            if (type === 'full-dump') link.setAttribute('download', `db_dump_${new Date().toISOString().split('T')[0]}.json`);

            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Failed to download report');
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

            <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4 overflow-x-auto">
                {['create', 'manage', 'challenges', 'users', 'archived', 'reports', 'settings', 'feedback'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap capitalize ${activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        {tab === 'create' ? 'Create Market' : tab}
                    </button>
                ))}
            </div>

            {/* ... Existing Tabs ... */}
            {activeTab === 'create' && (
                // ... (Keep existing create tab content)
                <div>
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
                                    icon={<Hash className="w-8 h-8 text-gray-400" />}
                                    title="Numeric"
                                    description="How many people will come to Taco Tuesday?"
                                    disabled={true}
                                />
                                <TypeCard
                                    icon={<Calendar className="w-8 h-8 text-gray-400" />}
                                    title="Date"
                                    description="When will OpenAI release GPT-7?"
                                    disabled={true}
                                />
                                <TypeCard
                                    icon={<BarChart3 className="w-8 h-8 text-gray-400" />}
                                    title="Poll"
                                    description="Which color should I wear to prom?"
                                    disabled={true}
                                />
                                <TypeCard
                                    icon={<MessageSquare className="w-8 h-8 text-gray-400" />}
                                    title="Discussion Post"
                                    description="Share groups of markets, updates, ideas, or stories."
                                    disabled={true}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                            {/* ... Form Content ... */}
                            {!editingMarket && (
                                <button onClick={() => setStep(1)} className="mb-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                    ← Back to types
                                </button>
                            )}
                            {editingMarket && (
                                <button onClick={() => { setEditingMarket(null); resetForm(); setActiveTab('manage'); }} className="mb-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                    ← Back to Manage Markets
                                </button>
                            )}

                            <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                {editingMarket ? 'Edit Market' : (selectedType === 'binary' ? 'Yes/No Question' : 'Multiple Choice Question')}
                            </h2>

                            <form onSubmit={editingMarket ? handleUpdateMarket : handleCreateMarket} className="space-y-8">
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

                                {selectedType === 'multiple_choice' && !editingMarket && (
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

                                <div className="pt-4 border-t border-gray-100 flex gap-4">
                                    <button type="submit" className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md text-lg">
                                        {editingMarket ? 'Update Market' : 'Create Market'}
                                    </button>
                                    {editingMarket && (
                                        <button type="button" onClick={() => { setEditingMarket(null); resetForm(); setActiveTab('manage'); }} className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-300">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'manage' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {markets.filter(m => m.status !== 'archived').map(market => (
                        <div key={market.id} className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{market.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Status: <span className={`capitalize ${market.status === 'open' ? 'text-green-600' : 'text-gray-600'}`}>{market.status}</span></p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <div className="flex gap-2">
                                        <button onClick={() => startEditing(market)} className="bg-blue-50 text-blue-600 px-3 py-1 text-xs rounded-full hover:bg-blue-100 transition-colors">Edit</button>
                                        <button onClick={() => handleArchiveMarket(market.id)} className="bg-red-50 text-red-600 px-3 py-1 text-xs rounded-full hover:bg-red-100 transition-colors">Archive</button>
                                    </div>
                                    {market.status === 'open' && (
                                        <div className="flex flex-wrap gap-2 justify-end max-w-md mt-2">
                                            {market.outcomes.map(outcome => (
                                                <button key={outcome.id} onClick={() => handleResolve(market.id, outcome.id)} className="bg-gray-100 text-gray-700 px-3 py-1 text-xs rounded-full hover:bg-green-600 hover:text-white transition-colors">
                                                    Resolve: {outcome.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'challenges' && (
                <div className="space-y-8">
                    {/* Create/Edit Challenge Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">{editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}</h2>
                        <form onSubmit={editingChallenge ? handleUpdateChallenge : handleCreateChallenge} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Challenge Title" value={challengeTitle} onChange={e => setChallengeTitle(e.target.value)} className="border p-2 rounded" required />
                                <input type="text" placeholder="Description" value={challengeDesc} onChange={e => setChallengeDesc(e.target.value)} className="border p-2 rounded" />
                                <input type="datetime-local" value={challengeStart} onChange={e => setChallengeStart(e.target.value)} className="border p-2 rounded" required />
                                <input type="datetime-local" value={challengeEnd} onChange={e => setChallengeEnd(e.target.value)} className="border p-2 rounded" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Markets (Optional - Default All)</label>
                                <div className="max-h-60 overflow-y-auto border rounded p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {markets.filter(m => m.status === 'open').map(market => (
                                        <label key={market.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedChallengeMarkets.includes(market.id)}
                                                onChange={() => toggleMarketSelection(market.id)}
                                                className="rounded text-indigo-600"
                                            />
                                            <span className="text-sm truncate">{market.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                                    {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                                </button>
                                {editingChallenge && (
                                    <button
                                        type="button"
                                        onClick={resetChallengeForm}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Challenge List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                        <h2 className="text-lg font-semibold p-6 pb-2">Existing Challenges</h2>
                        {challenges.map(challenge => (
                            <div key={challenge.id} className="p-6 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <h3 className="font-bold flex items-center gap-2">
                                        {challenge.title}
                                        {!challenge.is_active && <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">Archived</span>}
                                        {challenge.is_active && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Active</span>}
                                    </h3>
                                    <p className="text-sm text-gray-500">{new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-400 mt-1">Markets: {challenge.market_ids ? challenge.market_ids.length : 'All'}</p>
                                </div>
                                {challenge.is_active && (
                                    <div className="flex gap-2">
                                        <button onClick={() => startEditingChallenge(challenge)} className="bg-blue-50 text-blue-600 px-3 py-1 text-sm rounded hover:bg-blue-100">
                                            Edit
                                        </button>
                                        <button onClick={() => handleArchiveChallenge(challenge.id)} className="bg-red-50 text-red-600 px-3 py-1 text-sm rounded hover:bg-red-100">
                                            Archive
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'archived' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {markets.filter(m => m.status === 'archived').length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No archived markets found.</div>
                    ) : (
                        markets.filter(m => m.status === 'archived').map(market => (
                            <div key={market.id} className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">{market.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Status: <span className="capitalize text-gray-600">{market.status}</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUnarchiveMarket(market.id)}
                                            className="bg-green-50 text-green-600 px-3 py-1 text-xs rounded-full hover:bg-green-100 transition-colors"
                                        >
                                            Unarchive
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Market Results Report</h3>
                        <p className="text-gray-500 mb-4 text-sm">Download a CSV report of all market results, including user predictions, shares owned, and investment details.</p>
                        <button
                            onClick={() => downloadReport('market-results')}
                            className="w-full bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" /> Download CSV
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Full Database Dump</h3>
                        <p className="text-gray-500 mb-4 text-sm">Download a complete JSON dump of the database (excluding sensitive user data like passwords).</p>
                        <button
                            onClick={() => downloadReport('full-dump')}
                            className="w-full bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Hash className="w-4 h-4" /> Download JSON
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4">System Settings</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Beta Feedback System</h4>
                            <p className="text-sm text-gray-500">Enable or disable the floating feedback widget for all users.</p>
                        </div>
                        <button
                            onClick={toggleFeedback}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${feedbackEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${feedbackEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">ID</th>
                                    <th className="p-4 font-semibold text-gray-600">Name</th>
                                    <th className="p-4 font-semibold text-gray-600">Email</th>
                                    <th className="p-4 font-semibold text-gray-600">Role</th>
                                    <th className="p-4 font-semibold text-gray-600">Balance</th>
                                    <th className="p-4 font-semibold text-gray-600">Joined</th>
                                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-gray-500">#{user.id}</td>
                                        <td className="p-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="p-4 text-gray-500">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-700">₳{parseFloat(user.balance).toLocaleString()}</td>
                                        <td className="p-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleExportUser(user.id)}
                                                className="bg-indigo-50 text-indigo-600 px-3 py-1 text-sm rounded hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                            >
                                                <Download className="w-4 h-4" /> Export
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'feedback' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {/* ... Feedback Content ... */}
                    {feedbackList.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No feedback reports found.</div>
                    ) : (
                        feedbackList.map(item => (
                            <div key={item.id} className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${item.type === 'bug' ? 'bg-red-100 text-red-700' : item.type === 'feature' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {item.type.toUpperCase()}
                                        </span>
                                        <span className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        User: {item.user_name || 'Anonymous'} ({item.user_email || 'N/A'})
                                    </div>
                                </div>
                                <p className="text-gray-800 mb-4">{item.description}</p>
                                {item.screenshot_url && (
                                    <div className="mb-4">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Screenshot:</p>
                                        <button
                                            onClick={() => openScreenshot(item.screenshot_url)}
                                            className="block hover:opacity-90 transition-opacity focus:outline-none"
                                        >
                                            <img src={item.screenshot_url} alt="Screenshot" className="h-32 object-cover rounded border border-gray-200" />
                                        </button>
                                    </div>
                                )}
                                {item.metadata && (
                                    <details className="text-xs text-gray-500">
                                        <summary className="cursor-pointer hover:text-gray-700">View Metadata</summary>
                                        <pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                                            {JSON.stringify(item.metadata, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
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
