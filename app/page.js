import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/landing/Hero";
import Capabilities from "@/components/landing/Capabilities";
import ServicesCarousel from "@/components/landing/ServicesCarousel";
import Stats from "@/components/landing/Stats";
import CebuMap from "@/components/landing/CebuMap";
import HowItWorks from "@/components/landing/HowItWorks";
import CtaBand from "@/components/landing/CtaBand";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Capabilities />
        <ServicesCarousel />
        <Stats />
        <CebuMap />
        <HowItWorks />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
