import { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { MessageSquare, X, Camera, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FeedbackWidget = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [type, setType] = useState('bug');
    const [description, setDescription] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const response = await axios.get('/api/feedback/status');
            setEnabled(response.data.enabled);
        } catch (error) {
            console.error('Error checking feedback status:', error);
        }
    };

    const handleScreenshot = async () => {
        try {
            const canvas = await html2canvas(document.body);
            setScreenshot(canvas.toDataURL('image/png'));
        } catch (error) {
            console.error('Error taking screenshot:', error);
            alert(t('feedback.capture_error'));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const metadata = {
                url: window.location.href,
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`
            };

            await axios.post('/api/feedback', {
                type,
                description,
                screenshot_url: screenshot,
                metadata
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            alert(t('feedback.success'));
            setIsOpen(false);
            setDescription('');
            setScreenshot(null);
            setType('bug');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert(t('feedback.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!enabled) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 flex items-center gap-2"
                >
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-medium">{t('feedback.button')}</span>
                </button>
            )}

            {isOpen && (
                <div className="bg-white rounded-xl shadow-2xl w-80 md:w-96 border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <h3 className="font-semibold">{t('feedback.title')}</h3>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('feedback.type')}</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                            >
                                <option value="bug">{t('feedback.types.bug')}</option>
                                <option value="feature">{t('feedback.types.feature')}</option>
                                <option value="general">{t('feedback.types.general')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('feedback.description')}</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border h-24 resize-none"
                                placeholder={t('feedback.placeholder')}
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">{t('feedback.screenshot')}</label>
                                {screenshot && (
                                    <button type="button" onClick={() => setScreenshot(null)} className="text-xs text-red-600 hover:text-red-700">
                                        {t('feedback.remove')}
                                    </button>
                                )}
                            </div>

                            {!screenshot ? (
                                <button
                                    type="button"
                                    onClick={handleScreenshot}
                                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex flex-col items-center gap-1"
                                >
                                    <Camera className="w-6 h-6" />
                                    <span className="text-sm">{t('feedback.capture')}</span>
                                </button>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                    <img src={screenshot} alt="Screenshot" className="w-full h-32 object-cover" />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {t('feedback.submit')}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FeedbackWidget;
