// GA4 Types
declare global {
    interface Window {
        gtag: (
            command: 'config' | 'event' | 'consent' | 'set' | 'js',
            targetId: string | Date,
            config?: GtagConfig | GtagEventParams
        ) => void
        dataLayer: unknown[]
    }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-1RBGXM1DY8'

// Initialize GA4
export const initGA = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!GA_TRACKING_ID || typeof window === 'undefined') {
            reject(new Error('GA_TRACKING_ID is not defined or window is undefined'))
            return
        }

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || []

        // Load GA4 script
        const script = document.createElement('script')
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
        
        script.onload = () => {
            // Initialize gtag
            window.gtag = function gtag(...args: unknown[]) {
                window.dataLayer.push(args)
            }

            // Set initial timestamp
            window.gtag('js', new Date())

            // Configure GA4 with production settings
            window.gtag('config', GA_TRACKING_ID, {
                send_page_view: false,
                debug_mode: true,
                cookie_flags: 'SameSite=NoneSecure',
                cookie_domain: 'auto',
                cookie_expires: 28 * 24 * 60 * 60,
            })

            // Set default consent
            window.gtag('consent', 'default', {
                analytics_storage: 'granted',
                ad_storage: 'granted',
            })

            console.log('GA4 initialized successfully')
            resolve()
        }

        script.onerror = (error) => {
            console.error('Failed to load GA4 script:', error)
            reject(error)
        }

        document.head.appendChild(script)
    })
}

// GA4 Configuration Types
interface GtagConfig {
    page_path?: string
    page_title?: string
    page_location?: string
    send_page_view?: boolean
    [key: string]: unknown
}

// GA4 Event Types
export interface GTagEvent {
    action: GTagEventAction
    category: GTagEventCategory
    label?: string
    value?: number
    non_interaction?: boolean
    transport_type?: 'beacon' | 'xhr' | 'image'
    [key: string]: unknown
}

// GA4 Event Categories
export type GTagEventCategory =
    // Dashboard Categories
    | 'dashboard'
    | 'brokerage_activities'
    | 'brokerage_file'
    | 'shipments'
    | 'entry_details'
    | 'invoices'
    // Action Categories
    | 'button_click'
    | 'widget_interaction'
    | 'data_point'
    | 'view_change'
    | 'export'
    | 'navigation'

// GA4 Event Actions
export type GTagEventAction =
    // Dashboard Actions
    | 'DashPending'
    | 'DashFiled'
    | 'DashReleased'
    | 'DashDispatched'
    | 'DashDelivered'
    | 'DashException'
    | 'DashEntries'
    | 'DashCycle'
    | 'DashCompliance'
    | 'DashSpending'
    | 'DashExceptions'
    // Brokerage File Actions
    | 'BrkrgSummary'
    | 'BrkrgePouch'
    | 'BrkrgParties'
    | 'BrkrgISF'
    | 'BrkrgHistory'
    | 'BrkrgLinkRef'
    | 'BrkrgBilling'
    | 'BrkrgBOL'
    | 'BrkrgEntry'
    | 'BrkrgExceptions'
    // Shipments Actions
    | 'ShipITStatus'
    | 'ShipITAnalysis'
    | 'ShipITETA'
    | 'ShipISCMilestones'
    | 'ShipISCWeekly'
    | 'ShipCBSCMilestones'
    | 'ShipCBSCWeekly'
    | 'ShipVolMOT'
    | 'ShipVolOrigin'
    | 'ShipVolEntry'
    | 'ShipVolExport'
    | 'ShipExcepAnalysis'
    | 'ShipExcepVolumes'
    | 'ShipFDAEntry'
    // Entry Details Actions
    | 'EntryMonthly'
    | 'EntryParts'
    | 'EntryChart'
    | 'EntryEDI'
    | 'EntrySPTrend'
    | 'EntrySPUsage'
    | 'EntryTariffValue'
    | 'EntryTariffOccur'
    | 'EntryTariffClass'
    | 'EntryMID'
    // Invoices Actions
    | 'InvoicesOverview'
    | 'InvoicesMonthly'
    // Common Actions
    | 'view_change'
    | 'export_data'
    | 'column_chooser'
    | 'data_point_click'
    | 'widget_shortcut'
    | 'accordion_toggle'

// GA4 Event Parameters
interface GtagEventParams {
    event_category: GTagEventCategory
    event_label?: string
    value?: number
    non_interaction?: boolean
    transport_type?: 'beacon' | 'xhr' | 'image'
    view_type?: 'vertical' | 'horizontal' | 'grid' | 'bar' | 'map'
    export_type?: 'all' | 'selected'
    widget_name?: string
    page_name?: string
    tab_name?: string
    [key: string]: unknown
}

/**
 * Track page views
 * url - The URL of the page being viewed
 */
export const pageview = (url: string): void => {
    if (!GA_TRACKING_ID || typeof window === 'undefined') return

    const config: GtagConfig = {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
    }
    window.gtag('config', GA_TRACKING_ID, config)
}

/**
 * Track custom events
 * event - The event to track
 */
export const event = ({ action, category, label, value, ...rest }: GTagEvent): void => {
    if (!GA_TRACKING_ID || typeof window === 'undefined') return

    const params: GtagEventParams = {
        event_category: category,
        event_label: label,
        value,
        ...rest,
    }

    window.gtag('event', action, params)
}

/**
 * Track widget interactions
 * widgetName - Name of the widget
 * action - Action performed
 * additionalParams - Additional parameters to track
 */
export const trackWidgetInteraction = (
    widgetName: string,
    action: GTagEventAction,
    additionalParams: Partial<GtagEventParams> = {}
): void => {
    event({
        action,
        category: 'widget_interaction',
        label: widgetName,
        widget_name: widgetName,
        ...additionalParams,
    })
}

/**
 * Track view changes
 * widgetName - Name of the widget
 * viewType - Type of view (vertical, horizontal, grid, bar, map)
 * additionalParams - Additional parameters to track
 */
export const trackViewChange = (
    widgetName: string,
    viewType: GtagEventParams['view_type'],
    additionalParams: Partial<GtagEventParams> = {}
): void => {
    event({
        action: 'view_change',
        category: 'view_change',
        label: widgetName,
        widget_name: widgetName,
        view_type: viewType,
        ...additionalParams,
    })
}

/**
 * Track data point interactions
 * widgetName - Name of the widget
 * dataPointLabel - Label of the data point
 * additionalParams - Additional parameters to track
 */
export const trackDataPointInteraction = (
    widgetName: string,
    dataPointLabel: string,
    additionalParams: Partial<GtagEventParams> = {}
): void => {
    event({
        action: 'data_point_click',
        category: 'data_point',
        label: dataPointLabel,
        widget_name: widgetName,
        ...additionalParams,
    })
}

/**
 * Set user consent for analytics
 */
export const setConsent = (consent: boolean): void => {
    if (!GA_TRACKING_ID || typeof window === 'undefined') return

    window.gtag('consent', 'update', {
        analytics_storage: consent ? 'granted' : 'denied',
    })
}

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, unknown>): void => {
    if (!GA_TRACKING_ID || typeof window === 'undefined') return

    window.gtag('set', 'user_properties', properties)
}

// Add a verification function
export const verifyGA4Setup = async (): Promise<boolean> => {
    if (!GA_TRACKING_ID || typeof window === 'undefined') return false
    
    try {
        // Check if gtag is defined
        if (typeof window.gtag !== 'function') {
            console.error('GA4 gtag function not found')
            return false
        }

        // Check if dataLayer exists
        if (!Array.isArray(window.dataLayer)) {
            console.error('GA4 dataLayer not found')
            return false
        }

        // Send a test event
        window.gtag('event', 'ga4_verification', {
            event_category: 'system',
            event_label: 'GA4 Setup Verification',
            non_interaction: true
        })

        return true
    } catch (error) {
        console.error('GA4 verification failed:', error)
        return false
    }
}
