import { Suspense } from 'react'
import { Navigation } from '@/components/navigation'
import { HeroSection } from '@/components/hero-section'
import { InteractiveDemoSection } from '@/components/interactive-demo-section'
import { FeaturesSection } from '@/components/features-section'
import { HowItWorksSection } from '@/components/how-it-works-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { PricingSection } from '@/components/pricing-section'
import { FAQSection } from '@/components/faq-section'
import { Footer } from '@/components/footer'
import { SkipLink } from '@/components/accessibility/skip-link'
import { LazySection } from '@/components/performance/lazy-section'

// Loading component for suspense boundaries
function SectionLoader() {
  return (
    <div className="py-16 sm:py-20 lg:py-24 flex items-center justify-center">
      <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      <SkipLink />
      <Navigation />
      <main id="main-content" role="main">
        {/* Above the fold - load immediately */}
        <HeroSection />

        {/* Essential sections only - simplified for minimal design */}
        <Suspense fallback={<SectionLoader />}>
          <LazySection>
            <InteractiveDemoSection />
          </LazySection>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <LazySection>
            <FeaturesSection />
          </LazySection>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <LazySection>
            <PricingSection />
          </LazySection>
        </Suspense>

      </main>
      <Footer />
    </div>
  );
}
