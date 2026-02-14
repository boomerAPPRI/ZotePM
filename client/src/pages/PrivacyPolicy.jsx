import { useTranslation, Trans } from 'react-i18next';
import { Shield, Lock, FileText, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
    const { t } = useTranslation();
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 bg-white min-h-screen">
            <div className="mb-8 text-center">
                <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('privacy.title')} & {t('privacy.description')}</h1>
                <p className="text-gray-500">{t('privacy.last_updated', { date: new Date().toLocaleDateString() })}</p>
            </div>

            <div className="prose prose-indigo max-w-none text-gray-700">
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-500" />
                        {t('privacy.intro.title')}
                    </h2>
                    <p>
                        <Trans i18nKey="privacy.intro.content" />
                    </p>
                    <p className="mt-4">
                        {t('privacy.intro.compliance')}
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        {(t('privacy.intro.laws', { returnObjects: true }) || []).map((law, index) => (
                            <li key={index}><Trans defaults={law} /></li>
                        ))}
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        {t('privacy.collection.title')}
                    </h2>
                    <p>{t('privacy.collection.intro')}</p>
                    <ul className="list-disc pl-6 space-y-2">
                        {(t('privacy.collection.items', { returnObjects: true }) || []).map((item, index) => (
                            <li key={index}><Trans defaults={item} /></li>
                        ))}
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="w-6 h-6 text-indigo-500" />
                        {t('privacy.usage.title')}
                    </h2>
                    <p>{t('privacy.usage.intro')}</p>
                    <ul className="list-disc pl-6 space-y-2">
                        {(t('privacy.usage.items', { returnObjects: true }) || []).map((item, index) => (
                            <li key={index}><Trans defaults={item} /></li>
                        ))}
                    </ul>
                    <p className="mt-4 font-semibold text-red-600">
                        {t('privacy.usage.no_sell')}
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.sharing.title')}</h2>
                    <p>
                        <Trans i18nKey="privacy.sharing.content" />
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.rights.title')}</h2>
                    <p>{t('privacy.rights.intro')}</p>
                    <ul className="list-disc pl-6 space-y-2">
                        {(t('privacy.rights.items', { returnObjects: true }) || []).map((right, index) => (
                            <li key={index}><Trans defaults={right} /></li>
                        ))}
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.contact.title')}</h2>
                    <p>
                        {t('privacy.contact.content')}
                    </p>
                    <p className="mt-2 text-indigo-600 font-bold">
                        <a href="mailto:privacy@asiapacificpeace.org">privacy@asiapacificpeace.org</a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
