import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { Simulator } from "@/components/landing/Simulator";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { LeadForm } from "@/components/landing/LeadForm";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HeroCarousel />
        <Simulator />
        <HowItWorks />
        <Testimonials />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
