import { Helmet } from 'react-helmet-async';
import Hero from '../components/sections/Hero';
import BrandBar from '../components/sections/BrandBar';
import ProductCategories from '../components/sections/ProductCategories';
import AboutSnapshot from '../components/sections/AboutSnapshot';
import WhyNavkar from '../components/sections/WhyNavkar';
import StatsSection from '../components/sections/StatsSection';
import Testimonials from '../components/sections/Testimonials';
import CTASection from '../components/sections/CTASection';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Navkar Engineering - Where Reliability Meets Innovation</title>
        <meta name="description" content="Navkar Engineering - Authorized dealership for Kaishan & Airmarshall. Trusted partner for Parker, Airnet, Tubacex & Trident. Precision industrial fluid power & compressed air solutions, Surat, Gujarat." />
        <meta property="og:title" content="Navkar Engineering - Where Reliability Meets Innovation" />
        <meta property="og:description" content="Authorized dealer for Kaishan & Airmarshall. We deal with Parker, Airnet, Tubacex & Trident. Industrial solutions for Gujarat and India." />
      </Helmet>
      <main>
        <Hero />
        <BrandBar />
        <ProductCategories />
        <AboutSnapshot />
        <WhyNavkar />
        <StatsSection />
        <Testimonials />
        <CTASection />
      </main>
    </>
  );
}
