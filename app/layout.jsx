import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import ProductsLoader from '@/components/ProductsLoader'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { AuthProvider } from '@/app/providers/AuthProvider'
import "./globals.css";
import { assets } from '@/assets/assets'

export const metadata = {
    title: "Aura Clothings - Premium Fashion Store",
    description: "Aura Clothings is your one stop for all kinds of premium fashion clothing. Explore exquisite designs in dresses, outfits, and more with free shipping worldwide, T&C apply.",
    keywords: "clothing, fashion, premium fashion, online clothing store, auraclothings",
    icons: {
        icon: '/assets/auraclothings.jpg'
    },
    openGraph: {
        type: 'website',
        url: 'https://auraclothings.com',
        title: 'Aura Clothings - Premium Fashion',
        description: 'Discover exquisite fashion designs at Aura Clothings',
        siteName: 'Aura Clothings',
        images: [
            {
                url: 'https://auraclothings.com/logo.png',
                width: 1200,
                height: 630,
                alt: 'Aura Clothings'
            }
        ]
    },
    metadataBase: new URL('https://auraclothings.com')
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Google Tag Manager */}
                <script dangerouslySetInnerHTML={{__html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K5DV6MLK');`}} />
                {/* End Google Tag Manager */}
                
                <link rel="icon" href={assets.pandcjewellery.src} />
                <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
                <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />
            </head>
            <body className="font-amoria antialiased">
                {/* Google Tag Manager (noscript) */}
                <noscript>
                    <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K5DV6MLK"
                    height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe>
                </noscript>
                {/* End Google Tag Manager (noscript) */}
                
                <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
                <AuthProvider>
                    <StoreProvider>
                        <Toaster />
                        <ProductsLoader />
                        {children}
                    </StoreProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
