import { Shield, Scale, ScrollText, AlertTriangle } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

const TermsOfService = () => {
    const { t } = useTranslation();

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 bg-white min-h-screen">
            <div className="mb-8 text-center">
                <Scale className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('terms.title')}</h1>
                <p className="text-gray-500 mt-2">{t('terms.last_updated', { date: new Date().toLocaleDateString() })}</p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <strong>{t('terms.notice.title')}</strong> {t('terms.notice.content')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="prose prose-indigo max-w-none text-gray-700">
                {/* 1. Acceptance */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('terms.acceptance.title')}</h3>
                    <p>
                        <Trans i18nKey="terms.acceptance.content" />
                    </p>
                </section>

                {/* 2. No Monetary Value */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('terms.virtual_currency.title')}</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        {(t('terms.virtual_currency.items', { returnObjects: true }) || []).map((item, index) => (
                            <li key={index}><Trans defaults={item} /></li>
                        ))}
                    </ul>
                </section>

                {/* 3. Limitation of Liability */}
                <section className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('terms.liability.title')}</h3>
                    <p className="uppercase font-semibold text-gray-800 text-sm mb-2">{t('terms.liability.warning')}</p>
                    <p>
                        <Trans i18nKey="terms.liability.content" />
                    </p>
                </section>

                {/* 4. Indemnification */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('terms.indemnification.title')}</h3>
                    <p>
                        <Trans i18nKey="terms.indemnification.content" />
                    </p>
                </section>

                {/* 5. Governing Law */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('terms.governing_law.title')}</h3>

                    {/* User Disputes */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-800">{t('terms.governing_law.user_disputes.title')}</h4>
                        <p>
                            <Trans i18nKey="terms.governing_law.user_disputes.content" />
                        </p>
                    </div>

                    {/* IP Disputes */}
                    <div>
                        <h4 className="font-semibold text-gray-800">{t('terms.governing_law.ip_disputes.title')}</h4>
                        <p>
                            <Trans i18nKey="terms.governing_law.ip_disputes.content" />
                        </p>
                    </div>
                </section>

                {/* 6. Contact */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('terms.contact.title')}</h3>
                    <p>
                        <Trans
                            i18nKey="terms.contact.content"
                            components={{
                                1: <a href="mailto:legal@asiapacificpeace.org" className="text-indigo-600 font-bold" />
                            }}
                        />
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;
