import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Shield, AlertTriangle, Scroll, DollarSign } from 'lucide-react';

const HowToPlay = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                    🏆 ZotePM: The "Diamond Hands" Bowl
                </h1>
                <p className="text-xl text-gray-600">
                    Welcome to the ultimate Prediction Challenge. You start with <span className="font-bold text-green-600">$1,000</span>. Your goal is to pick the winning outcomes.
                </p>
            </div>

            <div className="space-y-8">
                {/* Golden Rule Section */}
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-red-100 p-3 rounded-full">
                            <span className="text-2xl">🛑</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-red-800 mb-3">The Golden Rule: "Buy & Hold"</h2>
                            <p className="font-medium text-red-900 mb-4">This is a test of conviction.</p>
                            <ul className="list-disc list-inside space-y-2 text-red-800">
                                <li><strong>No Selling:</strong> Once you buy a share, you own it until the market resolves.</li>
                                <li><strong>No Flipping:</strong> You cannot "day trade" (buy low, sell high). You only win if the event actually happens.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* How to Win Section */}
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-green-800 mb-3">How to Win</h2>
                            <div className="space-y-4 text-green-900">
                                <div>
                                    <h3 className="font-bold mb-2">Analyze the Price:</h3>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>If "Seahawks Win" costs <span className="font-mono font-bold">$0.60</span>, the market says they have a 60% chance.</li>
                                        <li>If they <strong>WIN</strong>, that share pays out <span className="font-mono font-bold">$1.00</span> (You make $0.40 profit).</li>
                                        <li>If they <strong>LOSE</strong>, that share goes to <span className="font-mono font-bold">$0.00</span> (You lose everything).</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2">Re-Buying (Doubling Down):</h3>
                                    <p className="mb-2">You can buy more shares at any time before the market closes.</p>
                                    <div className="bg-white/50 p-3 rounded-lg text-sm">
                                        <strong>Example:</strong> You bought Seahawks at $0.60. They score a touchdown! The price jumps to $0.75. You can buy more at $0.75 if you think they are a lock.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Manual Hedge Section */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <span className="text-2xl">🛡️</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-blue-800 mb-3">The "Manual Hedge" (Advanced Strategy)</h2>
                            <p className="text-blue-900 mb-4">Since you cannot sell, the only way to "exit" a bad bet is to bet on the other side.</p>

                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white p-3 rounded shadow-sm border border-blue-100">
                                    <h4 className="font-bold text-blue-800">Scenario</h4>
                                    <p>You bet $500 on Seahawks.</p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm border border-blue-100">
                                    <h4 className="font-bold text-blue-800">The Game</h4>
                                    <p>The Patriots are winning 21-0 at halftime.</p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm border border-blue-100">
                                    <h4 className="font-bold text-blue-800">The Save</h4>
                                    <p>You use your remaining cash to buy Patriots shares.</p>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-blue-800 font-medium">If Patriots win, your new shares pay out $1.00, covering your loss on the Seahawks.</p>
                        </div>
                    </div>
                </div>

                {/* Oracle Rules Section */}
                <div className="bg-slate-50 border-l-4 border-slate-500 p-6 rounded-r-xl shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-slate-100 p-3 rounded-full">
                            <span className="text-2xl">📜</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">The Markets (Oracle Rules)</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-slate-900">1. Opening Kickoff</h3>
                                    <ul className="text-slate-600 text-sm ml-2">
                                        <li><strong>Touchback:</strong> Kneel in endzone.</li>
                                        <li><strong>Return:</strong> Player catches & moves forward.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">2. Coin Toss</h3>
                                    <p className="text-slate-600 text-sm ml-2">Resolves to Referee’s announcement.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">3. Commercials</h3>
                                    <p className="text-slate-600 text-sm ml-2">Resolves to the first brand to air (AI, Beer, Cars).</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">4. Halftime: Bad Bunny</h3>
                                    <ul className="text-slate-600 text-sm ml-2">
                                        <li><strong>Sunglasses:</strong> Must be on his face in the first video frame.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">5. Game Winner</h3>
                                    <p className="text-slate-600 text-sm ml-2">Resolves at 0:00 (Includes Overtime).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Warning Section */}
                <div className="mt-8 bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-4">
                    <div className="text-3xl">🚨</div>
                    <div>
                        <h3 className="font-bold text-amber-900">Final Warning</h3>
                        <p className="text-amber-800">Check your inputs! Since you cannot sell, a "Fat Finger" mistake (betting $1,000 instead of $100) is permanent!</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HowToPlay;
