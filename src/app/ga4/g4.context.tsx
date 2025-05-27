'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { initGA, pageview, event, verifyGA4Setup } from './g4-tag'

// Test event function
const testGA4Event = () => {
    console.log('Testing GA4 event...')
    event({
        action: 'DashPending',
        category: 'dashboard',
        label: 'Test Button Click',
        page_name: 'C2 Generic Dashboard',
        tab_name: 'Brokerage Activities',
        value: 1,
        non_interaction: false
    })
    console.log('GA4 event sent')
}

function GA4ProviderContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isInitialized, setIsInitialized] = useState(false)
    const [isVerified, setIsVerified] = useState(false)

    useEffect(() => {
        const initializeGA4 = async () => {
            try {
                // Initialize GA4
                console.log('Initializing GA4...')
                await initGA()
                setIsInitialized(true)
                console.log('GA4 initialized')

                // Verify setup
                const verified = await verifyGA4Setup()
                setIsVerified(verified)
                console.log('GA4 verification:', verified ? 'successful' : 'failed')

                if (verified) {
                    // Test event on initial load
                    testGA4Event()
                }
            } catch (error) {
                console.error('Failed to initialize GA4:', error)
                setIsInitialized(false)
                setIsVerified(false)
            }
        }

        initializeGA4()
    }, [])

    useEffect(() => {
        // Only track page views if GA4 is initialized and verified
        if (isInitialized && isVerified && pathname) {
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
            console.log('Tracking page view:', url)
            pageview(url)
        }
    }, [pathname, searchParams, isInitialized, isVerified])

    // Add debug info in development
    // if (process.env.NODE_ENV === 'development') {
    console.log('GA4 Status:', {
        isInitialized,
        isVerified,
        trackingId: process.env.NEXT_PUBLIC_GA_ID
    })
    // }

    return <>{children}</>
}

export function GA4Provider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <GA4ProviderContent>{children}</GA4ProviderContent>
        </Suspense>
    )
}