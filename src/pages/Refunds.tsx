import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Refunds() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Refund Eligibility</h2>
              <p>We offer refunds under the following conditions:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Refund requests must be made within 7 days of purchase</li>
                <li>For subscription services, refunds are only available for unused portions</li>
                <li>One-time purchases (human reviews) are refundable if the service was not delivered</li>
                <li>Technical issues that prevent service usage may qualify for full refunds</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Subscription Refunds</h2>
              <p>For monthly and yearly subscriptions:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Monthly subscriptions: Refundable within 7 days if less than 3 essays were generated</li>
                <li>Yearly subscriptions: Pro-rated refunds available within 30 days of purchase</li>
                <li>Cancellations take effect at the end of the current billing period</li>
                <li>No refunds for partial months or years after the refund window</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Human Review Refunds</h2>
              <p>For individual human review purchases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Full refund if review is not delivered within 72 hours</li>
                <li>Partial refund if review quality does not meet our standards</li>
                <li>No refund if review is completed and delivered as promised</li>
                <li>Quality disputes will be reviewed case-by-case</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Non-Refundable Items</h2>
              <p>The following are not eligible for refunds:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Essays that have been downloaded or copied</li>
                <li>Services used beyond the refund eligibility period</li>
                <li>Refund requests made after account termination</li>
                <li>Disputes arising from academic integrity violations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Refund Process</h2>
              <p>To request a refund:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact our support team at refunds@splennet.com</li>
                <li>Provide your account email and reason for the refund request</li>
                <li>Include any relevant documentation or screenshots</li>
                <li>Allow 5-7 business days for review and processing</li>
                <li>Approved refunds will be processed to the original payment method</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Processing Time</h2>
              <p>Refund processing times vary by payment method:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Credit cards: 5-10 business days</li>
                <li>PayPal: 3-5 business days</li>
                <li>Bank transfers: 7-14 business days</li>
                <li>Digital wallets: 1-3 business days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Dispute Resolution</h2>
              <p>If you disagree with a refund decision, you may:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request a review by our customer service manager</li>
                <li>Provide additional documentation supporting your claim</li>
                <li>Escalate to our executive team for final review</li>
                <li>Contact your payment provider for chargeback procedures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
              <p>For refund requests and questions:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email: refunds@splennet.com</li>
                <li>Support Portal: Available in your account dashboard</li>
                <li>Response time: Within 24 hours during business days</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}