import * as React from 'react';
import AssetDashboard from './AssetDashboard';
import { Lang } from './services/i18nService';

interface InvestmentTrackerProps {
    lang: Lang;
}

/**
 * InvestmentTracker component - A clean wrapper around the universal AssetDashboard.
 * This provides the full-page portfolio management experience with CRUD operations
 * and real-time market valuations.
 */
export default function InvestmentTracker({ lang }: InvestmentTrackerProps) {
    return (
        <div className="w-full pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <AssetDashboard lang={lang} variant="full" />
        </div>
    );
}
