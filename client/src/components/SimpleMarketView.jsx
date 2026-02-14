import React, { useState, useEffect } from 'react';
import { Trophy, Battery, Zap, Users, Flag, Clock } from 'lucide-react';

const SimpleMarketView = ({ market, userBalance, onPredict, handleAmountChange, amount, setAmount, setSelectedOutcome, selectedOutcome, predictionCost }) => {

    // Set default confidence level to 10 on mount if empty
    useEffect(() => {
        if (!amount) {
            // We need to simulate the event for handleAmountChange to calculate cost properly
            // Or just setAmount directly? But handleAmountChange does cost calc.
            // Let's call handleAmountChange with a synthetic event
            handleAmountChange({ target: { value: '10' } });
        }
    }, []);

    // Helper to calculate approximate multiplier (e.g., 50% -> 2x)
    const getMultiplier = (price) => {
        if (!price || price <= 0) return '∞';
        return (1 / price).toFixed(2) + 'x';
    };

    // Helper: Determine visualization type
    // If 2 outcomes, assume Binary/Versus -> Tug of War
    // If >2 outcomes, use standard bars or "Battery" style for simplicty
    const isBinary = market.outcomes && market.outcomes.length === 2;

    // For Tug of War: P(Left) determines flag position
    // Use Outcome 0 as Left (Blue), Outcome 1 as Right (Red)
    const leftOutcome = isBinary ? market.outcomes[0] : null;
    const rightOutcome = isBinary ? market.outcomes[1] : null;
    // If Left (Yes) is winning (high price), flag should move Left (towards 0).
    const flagPosition = leftOutcome ? (100 - (leftOutcome.price * 100)) : 50;

    // Handle "Join Team" click
    // This sets the outcome, sets the amount (from slider), and triggers predict if desired
    // Or just prepares it. User asked for "Join Team YES" button... implying action?
    // "Add two large action buttons... Join Team YES and Join Team NO".
    // I will make them select the team. The user then hits "Confirm" or the button works if amount is set?
    // User said: "Confidence Slider... Add two large action buttons...". 
    // Likely flow: Adjust Slider -> Click "Join Team X".

    const handleJoinTeam = (outcome) => {
        setSelectedOutcome(outcome);
        // We need to trigger the parent's prediction logic. 
        // Parent `handlePlacePrediction` checks `selectedOutcome` and `amount`.
        // Since setState is async, we might need a wrapper or useEffect.
        // But simpler: Just set it and show a "Confirm" modal or button?
        // OR: The "Join Team" button SUBMITS the order immediately?
        // "Join Team" implies entering the pool. 
        // Let's make "Join Team" SELECT the team, and update the "Confirm" button text?
        // Or make the buttons themselves submit if Amount > 0.
        // Let's try: Select Team -> Show "Confirm" button or Auto-submit from simplified view?
        // Safety: Better to have explicit Confirm.
        // BUT for "Gamer UI", maybe "FIRE!" button?

        // Revised Flow:
        // 1. Slider sets Amount (Collateral).
        // 2. Click "BET BLUE (2x)" -> Places Bet immediately?
        // Let's assume immediate action for "Gamer" feel, BUT we need `setSelectedOutcome` to propagate.
        // I'll wrap it:

        // Actually, parent handles `amount` and `selectedOutcome`.
        // If I call `setSelectedOutcome(outcome)` then `onPredict()`, `selectedOutcome` might not be updated yet in closure.
        // So I'll modify the parent to accept args, OR I'll enforce a 2-step:
        // Step 1: Pick Team (Buttons highlight).
        // Step 2: "LOCK IN!" (Confirm button).

        setSelectedOutcome(outcome);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
            {/* 1. Header with Gamified Stats */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border-4 border-indigo-100">
                <div className="bg-indigo-600 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black uppercase tracking-wider text-yellow-300 drop-shadow-md mb-2">
                            {market.title}
                        </h1>
                        <div className="flex justify-center items-center gap-4 text-indigo-100 text-sm font-bold">
                            <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-2">
                                <Trophy size={16} /> {market.volume ? parseFloat(market.volume).toFixed(0) : 0} Total Points
                            </span>
                            <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-2">
                                <Clock size={16} /> Ends {new Date(market.resolution_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Visualization: Tug of War or Bars */}
                <div className="p-8 bg-gradient-to-b from-indigo-50 to-white">
                    {isBinary ? (
                        <div className="relative pt-8 pb-4">
                            {/* Team Labels */}
                            <div className="flex justify-between text-xl font-black mb-2 uppercase">
                                <span className="text-blue-600 drop-shadow-sm">{leftOutcome.name}</span>
                                <span className="text-red-500 drop-shadow-sm">{rightOutcome.name}</span>
                            </div>

                            {/* The Rope Track */}
                            <div className="h-4 bg-gray-300 rounded-full w-full relative">
                                {/* Center Marker */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 h-full z-0"></div>

                                {/* The Flag */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-10"
                                    style={{ left: `${flagPosition}%` }}
                                >
                                    <div className="relative -ml-6 -mt-8 flex flex-col items-center">
                                        <Flag className={`w-10 h-10 ${flagPosition < 50 ? 'text-blue-600 fill-blue-600' : 'text-red-500 fill-red-500'} drop-shadow-lg transform -rotate-12`} />
                                        <div className="w-1 h-8 bg-gray-800"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Percentages */}
                            <div className="flex justify-between mt-2 font-mono font-bold text-gray-500">
                                <span>{(leftOutcome.price * 100).toFixed(0)}% Power</span>
                                <span>{(rightOutcome.price * 100).toFixed(0)}% Power</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {market.outcomes.map(outcome => (
                                <div key={outcome.id}>
                                    <div className="flex justify-between font-bold mb-1">
                                        <span>{outcome.name}</span>
                                        <span className="text-indigo-600">{(outcome.price * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden relative">
                                        {/* Battery Style Segments */}
                                        <div
                                            className="h-full bg-green-500 transition-all duration-500"
                                            style={{ width: `${outcome.price * 100}%` }}
                                        >
                                            <div className="w-full h-full opacity-30 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqUAXYwYJAdkMQAwjIwMAtcvFf7Ly/OYAAAAASUVORK5CYII=')]"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Betting Interface */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-yellow-400 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Zap size={120} />
                </div>

                <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                    <Zap className="text-yellow-500 fill-yellow-500" />
                    POWER UP YOUR PREDICTION
                </h2>

                {/* Confidence Slider */}
                <div className="mb-8">
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4 rounded-r-lg">
                        <p className="text-indigo-700 font-bold flex items-center gap-2">
                            👈 Step 1: Slide this to pick your points!
                        </p>
                    </div>

                    <label className="block text-lg font-bold text-gray-700 mb-1">
                        Confidence Level (Points): <span className="text-indigo-600 text-2xl">{amount || 0}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={amount || 1}
                        onChange={handleAmountChange}
                        className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
                    />
                    <div className="flex justify-between text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">
                        <span>Low (1)</span>
                        <span>High (50)</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {market.outcomes.map((outcome, idx) => {
                        const isSelected = selectedOutcome?.id === outcome.id;
                        const btnColor = idx === 0 ? 'bg-blue-500 hover:bg-blue-600 border-blue-700' : 'bg-red-500 hover:bg-red-600 border-red-700'; // Default binary colors
                        // If not binary, cycle colors?
                        const dynamicColor = isBinary ? btnColor : 'bg-indigo-500 hover:bg-indigo-600 border-indigo-700';

                        return (
                            <button
                                key={outcome.id}
                                onClick={() => handleJoinTeam(outcome)}
                                className={`
                                    relative py-6 px-4 rounded-2xl border-b-8 transition-all duration-150 active:border-b-0 active:translate-y-2
                                    ${dynamicColor} text-white
                                    ${isSelected ? 'ring-4 ring-yellow-400 scale-105 z-10' : 'opacity-90 hover:opacity-100'}
                                `}
                            >
                                <div className="font-black text-2xl uppercase italic tracking-tighter">
                                    JOIN {outcome.name}
                                </div>
                                <div className="text-white/80 font-bold text-sm mt-1">
                                    Reward Multiplier: <span className="text-yellow-300 text-lg">{getMultiplier(outcome.price)}</span>
                                </div>
                                {isSelected && (
                                    <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-bounce">
                                        SELECTED
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Helper Message / Validation */}
                <div className="mt-6 text-center">
                    {!amount || amount <= 0 ? (
                        <div className="text-red-500 font-bold animate-pulse">
                            ⚠️ Please set a Confidence Level above 0 using the slider!
                        </div>
                    ) : !selectedOutcome ? (
                        <div className="text-indigo-500 font-bold animate-bounce">
                            👆 Select a Team above to continue!
                        </div>
                    ) : (
                        <div className="text-green-600 font-bold">
                            ✅ Ready to launch! Click the yellow button below.
                        </div>
                    )}
                </div>

                {/* Confirm Button (Always show but disabled if invalid) */}
                <div className={`mt-4 transition-all duration-300 ${(!amount || amount <= 0 || !selectedOutcome) ? 'opacity-50 grayscale cursor-not-allowed' : 'opacity-100 hover:scale-[1.02]'}`}>
                    <button
                        onClick={() => {
                            if (amount > 0 && selectedOutcome) {
                                onPredict();
                            } else {
                                // Optional: Shake animation logic could be added here
                            }
                        }}
                        disabled={!amount || amount <= 0 || !selectedOutcome}
                        className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 border-b-8 border-yellow-600 font-black text-3xl py-6 rounded-2xl uppercase tracking-widest shadow-2xl active:border-b-0 active:translate-y-2 transition-all disabled:border-b-4 disabled:translate-y-1"
                    >
                        LOCK IN GAME! 🚀
                    </button>
                    {predictionCost && (
                        <div className="text-center mt-3 text-gray-500 font-bold text-sm">
                            EST. COST: ₳{predictionCost}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center mt-8 text-gray-400 font-bold text-sm opacity-50">
                SIMPLE MODE ENABLED • ZOTEPM PIANO EDITION
            </div>
        </div>
    );
};

export default SimpleMarketView;
