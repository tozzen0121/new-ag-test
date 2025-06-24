'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { pageview, event, verifyGA4Setup } from './g4-tag'

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
    const [isVerified, setIsVerified] = useState(false)

    useEffect(() => {
        const checkGA4Setup = async () => {
            try {
                // Wait a bit for GA4 to be available
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // Verify setup
                const verified = await verifyGA4Setup()
                setIsVerified(verified)
                console.log('GA4 verification:', verified ? 'successful' : 'failed')

                if (verified) {
                    // Test event on initial load
                    testGA4Event()
                }
            } catch (error) {
                console.error('Failed to verify GA4 setup:', error)
                setIsVerified(false)
            }
        }

        checkGA4Setup()
    }, [])

    useEffect(() => {
        // Track page views if GA4 is verified
        if (isVerified && pathname) {
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
            console.log('Tracking page view:', url)
            pageview(url)
        }
    }, [pathname, searchParams, isVerified])

    // Add debug info in development
    console.log('GA4 Status:', {
        isVerified,
        trackingId: process.env.NEXT_PUBLIC_GA_ID || 'G-QCELM17N8J'
    })

    return <>{children}</>
}

export function GA4Provider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <GA4ProviderContent>{children}</GA4ProviderContent>
        </Suspense>
    )
}