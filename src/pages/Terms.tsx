import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using EssayAI, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <p>EssayAI provides AI-powered essay writing assistance for college applications. Our service helps students create authentic, personalized essays while preserving their unique voice and story.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and truthful information in your responses</li>
                <li>Use the service for legitimate educational purposes</li>
                <li>Respect intellectual property rights</li>
                <li>Maintain the confidentiality of your account credentials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Academic Integrity</h2>
              <p>While our AI generates essays based on your personal experiences and responses, you are responsible for ensuring compliance with your institution's academic integrity policies. We recommend reviewing and personalizing all generated content.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Payment and Refunds</h2>
              <p>Subscription fees are charged in advance. Refunds may be provided within 7 days of purchase for unused services, subject to our refund policy.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent mb-4">6. Limitation of Liability</h2>
              <p>EssayAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
              <p>For questions about these Terms of Service, please contact us at legal@essayai.com</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}