export const metadata = {
    title: "Terms of Service | Journli",
    description: "The rules and guidelines for using Journli.",
  };
  
  export default function TermsOfServicePage() {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
        <p><strong>Effective Date:</strong> October 1, 2025</p>
        <p>By using <strong>Journli</strong>, you agree to these Terms. Please read them carefully.</p>
  
        <h3 className="mt-6 font-semibold">1. Using Our Service</h3>
        <ul>
          <li>Users must be 16 years or older.</li>
          <li>Provide accurate account information.</li>
          <li>Do not use the platform for unlawful or harmful activity.</li>
        </ul>
  
        <h3 className="mt-6 font-semibold">2. User Content</h3>
        <p>You own your content but grant us a license to host and display it. You’re responsible for what you share.</p>
  
        <h3 className="mt-6 font-semibold">3. Termination</h3>
        <p>We may suspend accounts that violate these terms. You may delete your account anytime.</p>
  
        <h3 className="mt-6 font-semibold">4. Changes</h3>
        <p>We may update these terms. Continued use means acceptance of updates.</p>
  
        <h3 className="mt-6 font-semibold">5. Contact</h3>
        <p>For legal questions: <a href="mailto:info@journli.com">info@journli.com</a></p>
      </section>
    );
  }
  