import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import CategoriesSection from "@/components/CategoriesSection";
import { getBanner } from '@/lib/banner'

export const metadata = {
    title: "Aura Clothings - Premium Fashion Store | Shop Dresses, Jeans & T-Shirts",
    description: "Discover exquisite fashion designs at Aura Clothings. Premium dresses, jeans, t-shirts, and accessories with free worldwide shipping. Explore our latest collections today.",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        }
    },
    alternates: {
        canonical: 'https://pandcjewellery.com/'
    },
    openGraph: {
        url: 'https://pandcjewellery.com/',
        title: 'P&C Jewellery - Premium Jewelry Store',
        description: 'Discover exquisite jewelry designs',
    }
};

export default async function Home() {
    const banner = await getBanner()
    
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'P&C Jewellery',
        url: 'https://pandcjewellery.com/',
        logo: 'https://pandcjewellery.com/logo.png',
        description: 'Premium jewelry store offering exquisite designs in earrings, necklaces, and more.',
        image: 'https://pandcjewellery.com/logo.png',
        sameAs: [
            'https://www.facebook.com/pandcjewellery',
            'https://www.instagram.com/pandcjewellery',
            'https://www.twitter.com/pandcjewellery'
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-XXXX-XXXX',
            contactType: 'Customer Service'
        },
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'IN'
        }
    };

    return (
        <>
            {/* Organization Schema - HOMEPAGE ONLY */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <div>
                <CategoriesSection />
                <Hero initial={banner} />
                <LatestProducts />
                <BestSelling />
                <OurSpecs />
                <Newsletter />
            </div>
        </>
    );
}
