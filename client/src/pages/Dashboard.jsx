import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [portfolio, setPortfolio] = useState([]);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const [userRes, portfolioRes, txRes] = await Promise.all([
                    axios.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/auth/portfolio', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/auth/transactions', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setUser(userRes.data);
                setPortfolio(portfolioRes.data);
                setTransactions(txRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Only redirect if auth error
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;

    const totalEquity = user ? parseFloat(user.balance) + portfolio.reduce((acc, market) => {
        return acc + market.outcomes.reduce((mAcc, outcome) => mAcc + (outcome.totalShares * outcome.currentPrice), 0);
    }, 0) : 0;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('dashboard.title')}</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{t('dashboard.account_info')}</h3>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">{t('dashboard.full_name')}</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.name}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">{t('dashboard.total_equity')}</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-bold text-indigo-600">
                                {totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₳
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">{t('dashboard.balance')} ({t('dashboard.cash')})</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{parseFloat(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₳</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Portfolio / My Predictions */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard.your_predictions')}</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        {portfolio.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">{t('dashboard.no_predictions')}</div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {portfolio.map((market, index) => (
                                    <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                        <div className="mb-2">
                                            <Link to={`/markets/${market.marketId}`} className="text-sm font-medium text-indigo-600 truncate hover:underline">
                                                {market.marketTitle}
                                            </Link>
                                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${market.marketStatus === 'resolved' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {market.marketStatus}
                                            </span>
                                            {market.marketStatus === 'resolved' && market.winnerOutcomeName && (
                                                <span className="ml-2 text-sm text-gray-600">
                                                    {t('market.winner') || 'Winner'}: <span className="font-bold text-gray-900">{market.winnerOutcomeName}</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-2 space-y-3">
                                            {market.outcomes.map((outcome, oIdx) => (
                                                <div key={oIdx} className="pl-4 border-l-2 border-gray-200">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{outcome.outcomeName}</span>
                                                            {market.marketStatus === 'resolved' && market.winnerOutcomeId == outcome.outcomeId && (
                                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full border border-green-200">
                                                                    {t('market.winner') || 'Winner'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-500">{t('dashboard.current_price')}: {outcome.currentPrice.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-sm text-gray-700">{t('dashboard.shares_owned')}: {outcome.totalShares.toFixed(2)}</span>
                                                        <span className="text-sm text-gray-700">{t('dashboard.avg_cost')}: {outcome.averageCost.toFixed(2)}</span>
                                                    </div>

                                                    {/* Individual Orders Expansion (Simplified as list for now) */}
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        <p className="font-semibold">{t('dashboard.orders')}:</p>
                                                        {outcome.orders.map(order => (
                                                            <div key={order.id} className="flex justify-between pl-2">
                                                                <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                                                                <span>+{order.shares.toFixed(2)} @ {(order.invested / order.shares).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Transaction History */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard.transaction_history')}</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        {transactions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">{t('dashboard.no_transactions')}</div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.type')}</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">{t('dashboard.market')}</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.details')}</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.amount')}</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.date')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id}>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                                    {tx.type === 'bet' ? t('dashboard.prediction') : tx.type}
                                                </td>
                                                <td className="px-3 py-4 whitespace-normal text-sm text-gray-500 break-words">
                                                    {tx.category === 'order' ? (
                                                        <Link to={`/markets/${tx.market_id}`} className="text-indigo-600 hover:text-indigo-900">
                                                            {tx.marketTitle}
                                                        </Link>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-3 py-4 whitespace-normal text-sm text-gray-500">
                                                    {tx.category === 'order' ? (
                                                        <div>
                                                            <span className="font-medium block">{tx.outcomeName}</span>
                                                            <div className="text-xs text-gray-400">
                                                                {parseFloat(tx.shares).toFixed(2)} {t('dashboard.shares')} @ {parseFloat(tx.pricePerShare).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className={`px-3 py-4 whitespace-nowrap text-sm font-bold ${tx.type === 'win' || tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {tx.type === 'win' || tx.type === 'deposit' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₳
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-xs">
                                                    {new Date(tx.timestamp).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
