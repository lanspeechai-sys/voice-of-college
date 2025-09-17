import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AcademicIntegrity() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Academic Integrity Guidelines</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Our Commitment to Academic Integrity</h2>
              <p>
                Splennet is committed to supporting students in creating authentic, original college application essays 
                that reflect their genuine experiences, thoughts, and aspirations. We believe in empowering students 
                to tell their own stories while providing AI assistance as a writing tool.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. How Our AI Works</h2>
              <p>Our AI essay generation process:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Uses your personal responses and experiences as the foundation</li>
                <li>Helps structure and articulate your authentic story</li>
                <li>Preserves your unique voice and perspective</li>
                <li>Creates original content based on your specific inputs</li>
                <li>Does not copy or plagiarize from existing essays or sources</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Student Responsibilities</h2>
              <p>When using Splennet, students are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing truthful and accurate personal information</li>
                <li>Reviewing and personalizing all AI-generated content</li>
                <li>Ensuring the final essay reflects their authentic voice</li>
                <li>Understanding their institution's specific academic integrity policies</li>
                <li>Making any necessary disclosures as required by their school</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Ethical Use Guidelines</h2>
              <p>We encourage ethical use of our platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Use as a writing assistant</strong>: Treat AI as a tool to help organize and express your thoughts</li>
                <li><strong>Maintain authenticity</strong>: Ensure the final essay genuinely represents you</li>
                <li><strong>Review and revise</strong>: Always review AI-generated content and make it your own</li>
                <li><strong>Be transparent</strong>: Follow your institution's guidelines about AI assistance disclosure</li>
                <li><strong>Seek guidance</strong>: Consult with counselors or teachers when in doubt</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. What We Don't Do</h2>
              <p>Splennet does not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create essays without student input or personal information</li>
                <li>Copy content from existing essays or online sources</li>
                <li>Encourage misrepresentation of student experiences</li>
                <li>Provide essays that can be submitted without review and personalization</li>
                <li>Guarantee admission to any institution</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Institution-Specific Policies</h2>
              <p>
                Different colleges and universities have varying policies regarding AI assistance in application materials. 
                We strongly recommend that students:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Review their target schools' specific policies on AI assistance</li>
                <li>Contact admissions offices directly if policies are unclear</li>
                <li>Make appropriate disclosures when required</li>
                <li>Err on the side of transparency when in doubt</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Best Practices for Students</h2>
              <p>To maintain academic integrity while using Splennet:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li><strong>Start with your story</strong>: Provide detailed, honest responses about your experiences</li>
                <li><strong>Review thoroughly</strong>: Read through the generated essay multiple times</li>
                <li><strong>Personalize extensively</strong>: Add your own touches, examples, and voice</li>
                <li><strong>Fact-check everything</strong>: Ensure all details accurately reflect your experiences</li>
                <li><strong>Seek feedback</strong>: Have trusted advisors review your final essay</li>
                <li><strong>Follow school guidelines</strong>: Comply with your institution's specific requirements</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. AI Detection and Authenticity</h2>
              <p>
                Our AI is designed to create essays that feel natural and human-written. However, we emphasize that 
                the goal is not to deceive, but to help students express their authentic selves more effectively. 
                The essays should genuinely reflect the student's experiences and perspective.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Reporting Concerns</h2>
              <p>
                If you have concerns about academic integrity or notice misuse of our platform, please contact us at 
                integrity@splennet.com. We take these matters seriously and will investigate all reports.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Educational Purpose</h2>
              <p>
                Splennet is designed as an educational tool to help students learn effective essay writing techniques, 
                understand what makes compelling application essays, and develop their own writing skills. We encourage 
                students to use our platform as a learning opportunity rather than a replacement for their own effort and creativity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p>
                For questions about academic integrity or ethical use of our platform, please contact us at 
                integrity@splennet.com or through our support portal.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}