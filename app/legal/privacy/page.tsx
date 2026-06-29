export const metadata = {
    title: "Privacy Policy | Journli",
  description:
    "Learn how Journli collects, uses, stores, and protects your personal information.",
};

const privacySections = [
  {
    title: "Introduction",
    description: `This Privacy Policy describes how <strong>Journli</strong> (“Journli,” “we,” “us,” or “our”) collects, uses, discloses, and protects information when you visit our website, create an account, build or share travel itineraries, purchase or sell content on our marketplace, or otherwise use our services (collectively, the “Service”).
    <br/><br/>
    By using the Service, you agree to the practices described in this Privacy Policy and our <a href="/legal/cookies">Cookie Policy</a>. If you do not agree, please do not use the Service.`,
  },
  {
    title: "Information We Collect",
    description: `We collect information in the following categories:
    <br/><br/>
    <strong>Account and profile information.</strong> When you register, we collect information such as your name, username, email address, and password (stored securely by our authentication provider). You may also provide a profile photo, bio, location, website, and social media links (for example Facebook, Instagram, X/Twitter, Pinterest, TikTok, or YouTube handles).
    <br/><br/>
    <strong>Itinerary and content you create.</strong> This includes trip titles, descriptions, day-by-day schedules, activities, notes, tags, pricing for paid listings, cover images, photo uploads, template choices, and permission settings that control who can view or edit your itineraries.
    <br/><br/>
    <strong>Usage and interaction data.</strong> We collect information about how you use the Service, such as itineraries you view, like, save, or purchase; accounts you follow or block; search activity; and engagement metrics associated with published itineraries (for example view counts).
    <br/><br/>
    <strong>Marketplace and billing information.</strong> If you purchase paid itineraries or subscribe to a paid plan, payment processing is handled by <strong>Stripe</strong>. We receive transaction-related information such as purchase status, subscription plan, Stripe customer and subscription identifiers, and amounts paid. We do not store full payment card numbers on our servers. If you sell on Journli, we also collect seller onboarding and payout-related information through Stripe Connect, including your connected account status and transaction records needed to operate the marketplace.
    <br/><br/>
    <strong>Communications and support.</strong> If you contact us, subscribe to our newsletter, submit feedback, or receive emails from us (such as purchase confirmations or password reset messages), we process the information you provide, including your email address and message content.
    <br/><br/>
    <strong>Technical and device information.</strong> We automatically collect certain technical data when you use the Service, including IP address, browser type, device information, pages visited, and session data needed to keep you signed in. See our <a href="/legal/cookies">Cookie Policy</a> for more detail.`,
  },
  {
    title: "How We Collect Information",
    description: `
    <ul style="margin:0.5rem 0 0;padding-left:1.25rem;">
      <li><strong>Directly from you</strong> when you sign up, edit your profile, create itineraries, upload images, adjust account settings, make purchases, connect a seller account, or submit forms (including newsletter signup and feedback).</li>
      <li><strong>Automatically</strong> through cookies, authentication sessions, server logs, and analytics tools when you browse or interact with the Service.</li>
      <li><strong>From service providers</strong> such as Stripe when you complete a payment or seller onboarding flow.</li>
      <li><strong>From other users</strong> when they interact with your public content (for example following your profile, saving your itinerary, or purchasing your listing).</li>
    </ul>`,
  },
  {
    title: "How We Use Your Information",
    description: `
    We use the information we collect to:
    <ul style="margin:0.5rem 0 0;padding-left:1.25rem;">
      <li>Create, authenticate, and maintain your account.</li>
      <li>Provide core features, including itinerary creation, sharing, collaboration permissions, profiles, search, saves, likes, and follows.</li>
      <li>Operate the marketplace, including listing paid itineraries, processing purchases, delivering purchased content, seller payouts, and seller dashboard reporting.</li>
      <li>Manage subscriptions and paid plans.</li>
      <li>Send transactional emails (for example purchase confirmations, password resets, and feedback notifications to our team).</li>
      <li>Send optional marketing or product updates when you subscribe to our newsletter or when you have not opted out of email notifications in your account settings.</li>
      <li>Improve, secure, and troubleshoot the Service, including fraud prevention and abuse detection.</li>
      <li>Enforce our <a href="/legal/terms">Terms of Service</a>, <a href="/legal/seller-agreement">Seller Agreement</a>, and other policies.</li>
      <li>Comply with legal obligations and respond to lawful requests.</li>
    </ul>`,
  },
  {
    title: "How We Share Information",
    description: `
    We do not sell your personal information.
    <br/><br/>
    We may share information in these circumstances:
    <ul style="margin:0.5rem 0 0;padding-left:1.25rem;">
      <li><strong>With other users,</strong> according to your settings. Public profiles, published itineraries, and content you choose to share may be visible to others on Journli. If you set your profile or itineraries to private or restricted, we limit visibility accordingly.</li>
      <li><strong>With collaborators,</strong> when you grant view or edit permissions to specific users.</li>
      <li><strong>With buyers and sellers,</strong> as needed to complete marketplace transactions (for example, delivering a purchased itinerary or notifying a seller of a sale).</li>
      <li><strong>With service providers</strong> that help us operate the Service, subject to contractual protections. See “Third-Party Service Providers” below.</li>
      <li><strong>For legal and safety reasons,</strong> if we believe disclosure is required by law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of Journli, our users, or others.</li>
      <li><strong>In connection with a business transaction,</strong> such as a merger, acquisition, financing, or sale of assets, subject to appropriate confidentiality obligations.</li>
    </ul>`,
  },
  {
    title: "Third-Party Service Providers",
    description: `
    We use trusted third parties to help run Journli. Depending on how you use the Service, these providers may process personal information on our behalf:
    <br/><br/>
    <ul style="margin:0.5rem 0 0;padding-left:1.25rem;">
      <li><strong>Supabase</strong> — authentication, database hosting, file storage for profile photos and itinerary images, and related infrastructure.</li>
      <li><strong>Stripe</strong> — payment processing, subscriptions, Connect accounts for sellers, fraud prevention, and payout administration.</li>
      <li><strong>Resend</strong> — transactional email delivery (for example password resets, purchase confirmations, and internal feedback notifications).</li>
      <li><strong>Vercel</strong> — website hosting, application delivery, and privacy-friendly analytics through Vercel Analytics.</li>
    </ul>
    <br/>
    These providers may only use your information as needed to perform services for us and are subject to their own privacy policies and security practices. Payment information you submit is handled directly by Stripe according to Stripe’s policies.`,
  },
  {
    title: "Cookies, Local Storage & Similar Technologies",
    description: `
    We use cookies and similar technologies to keep you signed in, remember preferences, protect the Service, and understand how it is used. Supabase authentication may store session cookies or local storage entries required for login and account security.
    <br/><br/>
  For more information, including how to manage cookies in your browser, see our <a href="/legal/cookies">Cookie Policy</a>. Disabling certain cookies may limit your ability to sign in or use some features.`,
  },
  {
    title: "User-Generated Content & Visibility",
    description: `
    Journli is a platform for creating and sharing travel content. Information you post — including itinerary text, images, comments in feedback forms, and profile details — may be stored in our database and, depending on your settings, displayed to other users.
    <br/><br/>
    You can control some visibility through account settings, including making your profile private, restricting who can view or edit specific itineraries, and choosing whether itineraries are public, creator-only, or limited to selected users. Even if you delete your account, certain content you shared publicly may remain visible in cached, backup, or third-party systems for a limited period, or where other users have lawfully saved copies.`,
  },
  {
    title: "Social Features, Blocking & Permissions",
    description: `
    If you use social features, we process follow relationships, blocked-user lists, likes, saves, and permission grants you create. Blocking another user limits interaction between accounts according to our product rules. We use this information to enforce your preferences and keep the community safe.`,
  },
  {
    title: "Email & Communications",
    description: `
    We may send you:
    <ul style="margin:0.5rem 0 0;padding-left:1.25rem;">
      <li><strong>Transactional emails</strong> related to your account or purchases (for example password resets and purchase confirmations).</li>
      <li><strong>Newsletter or promotional emails</strong> if you subscribe through our footer form or similar signup flows.</li>
      <li><strong>Product or account notifications</strong> when enabled in your settings.</li>
    </ul>
    <br/>
    You can manage email notification preferences in <strong>Account Settings</strong>. You may unsubscribe from marketing emails using the link in those messages, where provided. Transactional messages may still be sent when necessary to provide the Service.`,
  },
  {
    title: "Analytics",
    description: `
    We use <strong>Vercel Analytics</strong> to understand aggregate usage of the Service (such as page views and performance). This helps us improve reliability and user experience. We do not use analytics data to sell your personal information.`,
  },
  {
    title: "Data Storage, Security & Retention",
    description: `
    Your information is stored using cloud infrastructure operated by our service providers, primarily in the United States. We use administrative, technical, and organizational measures designed to protect personal information, including access controls, encrypted connections (HTTPS), and authenticated access to production systems.
    <br/><br/>
    No method of transmission or storage is completely secure. You are responsible for maintaining the confidentiality of your password and account credentials.
    <br/><br/>
    We retain personal information for as long as your account is active or as needed to provide the Service, resolve disputes, enforce agreements, comply with legal obligations, and maintain appropriate business records (for example tax, payment, and fraud-prevention records). When you delete your account, we delete or anonymize associated profile data where feasible, though some information may persist in backups for a limited time or where retention is required by law or legitimate business need.`,
  },
  {
    title: "Account Deletion & Data Requests",
    description: `
    You may update much of your profile information at any time in <strong>Account Settings</strong>. You may delete your account from Account Settings; this removes your user profile from Journli and deletes your authentication record through our systems.
    <br/><br/>
    Some information may survive deletion where required for legal compliance, fraud prevention, dispute resolution, or where other users have independently saved or purchased content. Marketplace transaction records may be retained as needed for accounting, tax, and payout purposes.
    <br/><br/>
    To request access, correction, or deletion of personal information, or to ask a privacy question, contact us at <a href="mailto:info@journli.com">info@journli.com</a>. We may need to verify your identity before fulfilling certain requests.`,
  },
  {
    title: "Your Privacy Rights",
    description: `
    Depending on where you live, you may have rights regarding your personal information, such as the right to access, correct, delete, restrict, or object to certain processing, and the right to data portability. California residents may have additional rights under the CCPA/CPRA, including the right to know what personal information we collect and how it is used, and the right to opt out of the sale or sharing of personal information. We do not sell personal information.
    <br/><br/>
    If you are in the European Economic Area, United Kingdom, or Switzerland, you may also have rights under applicable data protection laws, including the right to lodge a complaint with a supervisory authority.
    <br/><br/>
    To exercise applicable rights, email <a href="mailto:info@journli.com">info@journli.com</a>. We will respond as required by law.`,
  },
  {
    title: "Children’s Privacy",
    description: `
    Journli is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided us personal information, contact us at <a href="mailto:info@journli.com">info@journli.com</a> and we will take appropriate steps to delete it.
    <br/><br/>
    Users must meet the eligibility requirements in our <a href="/legal/terms">Terms of Service</a>.`,
  },
  {
    title: "International Users",
    description: `
    Journli is operated from the United States. If you access the Service from outside the United States, you understand that your information may be transferred to, stored in, and processed in the United States and other countries where our service providers operate, which may have different data protection laws than your country.`,
  },
  {
    title: "Changes to This Privacy Policy",
    description: `
    We may update this Privacy Policy from time to time. When we do, we will revise the “Last Updated” date at the top of this page. If changes are material, we may provide additional notice (for example by email or a prominent notice on the Service). Your continued use of Journli after changes become effective means you accept the updated policy.`,
  },
  {
    title: "Contact Us",
    description: `
    If you have questions or concerns about this Privacy Policy or our data practices, contact us at:
    <br/><br/>
    <strong>Journli</strong><br/>
    Email: <a href="mailto:info@journli.com">info@journli.com</a>`,
  },
];
  
  export default function PrivacyPolicyPage() {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
      <p>
        <strong>Last Updated:</strong> June 28, 2026
      </p>
      <p className="mt-4">
        At <strong>Journli</strong>, your privacy matters to us. This policy
        explains what we collect, why we collect it, and the choices you have.
      </p>

      {privacySections.map((section, index) => (
        <div key={section.title}>
          <h3 className="mt-6 font-semibold">
            {index + 1}. {section.title}
          </h3>
          <div dangerouslySetInnerHTML={{ __html: section.description }} />
        </div>
      ))}
      </section>
    );
  }
  