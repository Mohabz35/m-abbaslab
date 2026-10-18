import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import EconomicsBookClient from './EconomicsBookClient'

export const metadata: Metadata = pageMeta({
    title: 'Economics Forecasting System — ML & Econometrics (Academic Blueprint)',
    description:
        '11-chapter blueprint of an economics forecasting system: LSTM/GRU models, data pipelines, statistical validation, MLOps, real-time inference APIs, cloud deployment, and ethical limitations.',
    keywords: [
        'economic forecasting machine learning',
        'LSTM GRU economics',
        'econometrics Kenya',
        'time series forecasting Africa',
        'data pipeline economics',
        'MLOps economics models',
        'Chuka University economics project',
        'statistical validation models',
    ],
    path: '/work/academic/economics',
})

export default function EconomicsBookPage() {
    return <EconomicsBookClient />
}
