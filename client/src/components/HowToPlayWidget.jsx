import React, { useState } from 'react';
import { HelpCircle, X, Trophy } from 'lucide-react';

const HowToPlayWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-bold"
            >
                <Trophy className="w-5 h-5" />
                <span className="hidden sm:inline">How to Play</span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                🏆 How to Play ZotePM
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 text-gray-700">

                            <div className="text-lg text-gray-600 leading-relaxed border-b border-gray-100 pb-6">
                                Welcome to the ultimate Prediction Challenge. Unlike a standard bet where you lock it in and wait, <strong>ZotePM is a Market</strong>. You are trading probabilities.
                            </div>

                            {/* The Objective */}
                            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-xl">
                                <h3 className="text-xl font-bold text-emerald-800 flex items-center gap-2 mb-3">
                                    💰 The Objective
                                </h3>
                                <ul className="space-y-2 text-emerald-900">
                                    <li><strong>Starting Balance:</strong> Everyone starts with <span className="font-bold">$1,000 ZoteBucks</span> (Play Money).</li>
                                    <li><strong>The Goal:</strong> Grow your account value by buying shares in winning outcomes.</li>
                                    <li><strong>The Winner:</strong> The player with the highest Total Account Value (Cash + Market Value of Winning Shares) at the end of the event wins.</li>
                                </ul>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* The Golden Rule */}
                                <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl">
                                    <h3 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-3">
                                        🛑 The Golden Rule: "Diamond Hands"
                                    </h3>
                                    <p className="text-red-900 italic mb-2">This is a test of conviction.</p>
                                    <ul className="space-y-2 text-red-900 text-sm">
                                        <li><strong>Buy-Only:</strong> Once you buy a share, you own it until the market resolves.</li>
                                        <li><strong>No Selling:</strong> You cannot "day trade" or sell early. You only get paid if the event actually happens.</li>
                                    </ul>
                                </div>

                                {/* How It Works */}
                                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-xl">
                                    <h3 className="text-lg font-bold text-indigo-800 flex items-center gap-2 mb-3">
                                        📉 How It Works
                                    </h3>
                                    <p className="text-indigo-900 text-sm mb-2">Every outcome is a "Share" priced between $0.01 and $0.99.</p>
                                    <ul className="space-y-2 text-indigo-900 text-sm">
                                        <li><strong>Price = Probability:</strong> If an outcome costs $0.60, the market believes there is a 60% chance it will happen.</li>
                                        <li><strong>The Payout:</strong>
                                            <ul className="ml-4 mt-1 list-disc">
                                                <li><strong>WIN:</strong> Pays out $1.00. (Profit = $1.00 - Price).</li>
                                                <li><strong>LOSE:</strong> Drops to $0.00.</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Strategy */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
                                <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2 mb-3">
                                    ⚡ Strategy: The "Manual Hedge"
                                </h3>
                                <p className="text-blue-900 mb-4">Since you cannot sell a losing position, the only way to protect your bankroll is to buy the other side.</p>

                                <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm text-sm grid md:grid-cols-3 gap-4">
                                    <div>
                                        <div className="font-bold text-blue-600 uppercase text-xs mb-1">Scenario</div>
                                        <div>You went big on "Team A," but "Team B" is winning.</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-blue-600 uppercase text-xs mb-1">The Move</div>
                                        <div>Use your remaining cash to buy shares of "Team B."</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-blue-600 uppercase text-xs mb-1">Result</div>
                                        <div>If "Team B" wins, those new shares pay out $1.00, covering your losses.</div>
                                    </div>
                                </div>
                            </div>

                            {/* Important Notes */}
                            <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
                                <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2 mb-3">
                                    🚨 Important Notes
                                </h3>
                                <ul className="space-y-3 text-amber-900 text-sm">
                                    <li className="flex gap-2">
                                        <span className="font-bold min-w-[120px]">Double Down:</span>
                                        <span>You can buy more shares of the same outcome at any time while the market is open.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold min-w-[120px]">Check Inputs:</span>
                                        <span>Since you cannot sell, a "Fat Finger" mistake (betting $1,000 instead of $100) is permanent!</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold min-w-[120px]">Oracle Ruling:</span>
                                        <span>All markets resolve based on the Host's decision. The Oracle's ruling is final.</span>
                                    </li>
                                </ul>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors"
                            >
                                Got it, let's play!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HowToPlayWidget;
