export const metadata = {
  title: "Seller Agreement | Journli",
  description:
    "Terms and conditions for creators who sell itineraries on the Journli marketplace.",
};

const sellerAgreementSections = [
  {
    title: "Agreement to These Terms",
    description:
      "This Seller Agreement (“Agreement”) applies when you list, price, or sell travel itineraries through Journli’s marketplace (“Marketplace”). By enabling paid listings or completing seller onboarding, you agree to this Agreement, our <a href='/legal/terms'>Terms of Service</a>, and our <a href='/legal/privacy'>Privacy Policy</a>. If you do not agree, do not sell on Journli.",
  },
  {
    title: "Eligibility",
    description:
      "To sell on Journli, you must have an active Journli account in good standing, be at least 18 years old (or the age of majority in your jurisdiction), and complete any required seller verification through our payment partner. You represent that you have the legal right to sell the content you list and that your listings comply with applicable laws in every country where buyers may access them.",
  },
  {
    title: "Seller Account & Stripe Connect",
    description:
      "Paid sales are processed through Stripe. You must connect and maintain a valid Stripe Connect account to receive payouts. You authorize Journli and Stripe to share information necessary to onboard you, process payments, prevent fraud, and comply with law. You are responsible for keeping your payout and tax information accurate and up to date in Stripe.",
  },
  {
    title: "Listings & Content Standards",
    description:
      "You are solely responsible for each itinerary you list for sale, including its accuracy, completeness, originality, pricing, and updates. Listings must not contain false, misleading, infringing, harmful, or illegal material. You must not sell content you do not own or have permission to license. Journli may review, reject, remove, or restrict listings that violate this Agreement or our Terms of Service.",
  },
  {
    title: "Pricing, Fees & Payouts",
    description:
      "You set the price for your paid itineraries unless otherwise stated in the product. Journli may charge platform, payment processing, or subscription-related fees disclosed at checkout, in your seller dashboard, or in plan details. Payout timing and availability depend on Stripe’s policies, your account status, chargebacks, refunds, and holds for fraud or policy review. Journli does not guarantee any minimum sales or earnings.",
  },
  {
    title: "License Granted to Buyers",
    description:
      "When a buyer purchases your itinerary, you grant them a personal, non-exclusive, non-transferable license to access and use that itinerary for their own travel planning. You retain ownership of your intellectual property. Buyers may not resell, redistribute, or publicly republish your paid content except as expressly permitted by Journli.",
  },
  {
    title: "Refunds & Chargebacks",
    description:
      "Refund and chargeback handling may be governed by Journli policies, Stripe rules, and applicable law. You agree to cooperate with reasonable refund investigations and dispute responses. Journli may debit, offset, or withhold amounts from your payouts to cover refunds, chargebacks, fees, or policy violations connected to your listings.",
  },
  {
    title: "Taxes",
    description:
      "You are responsible for determining, collecting, reporting, and remitting any taxes associated with your sales, unless Journli is required by law to collect and remit taxes on your behalf. Stripe may provide tax forms or reporting tools, but you remain responsible for your tax obligations.",
  },
  {
    title: "Prohibited Conduct",
    description:
      "You may not manipulate reviews or sales, engage in fraud, misrepresent itinerary contents, circumvent Marketplace fees, harass buyers, or use buyer information for unsolicited marketing. You may not list content that violates third-party rights, promotes unsafe or illegal activity, or otherwise breaches our Terms of Service.",
  },
  {
    title: "Suspension & Termination",
    description:
      "Journli may suspend or terminate your selling privileges immediately if you breach this Agreement, create risk for buyers or the platform, fail verification requirements, or receive excessive disputes or chargebacks. Termination does not relieve you of obligations that accrued before termination, including indemnification and payment of amounts owed.",
  },
  {
    title: "Disclaimer & Limitation of Liability",
    description:
      "Journli provides the Marketplace “as is.” We do not guarantee sales, buyer satisfaction, or uninterrupted payout processing. To the fullest extent permitted by law, Journli is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Marketplace. Our aggregate liability related to your seller account is limited as described in our Terms of Service.",
  },
  {
    title: "Indemnification",
    description:
      "You agree to indemnify and hold harmless Journli and its officers, directors, employees, and agents from claims, losses, and expenses (including reasonable legal fees) arising from your listings, sales, tax obligations, breach of this Agreement, or violation of third-party rights.",
  },
  {
    title: "Changes to This Agreement",
    description:
      "We may update this Agreement from time to time. Material changes will be posted on this page. Continued selling after changes become effective constitutes acceptance of the revised Agreement.",
  },
  {
    title: "Contact",
    description:
      "Questions about selling on Journli? Email us at <a href='mailto:info@journli.com'>info@journli.com</a>.",
  },
];

export default function SellerAgreementPage() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Seller Agreement</h2>
      <p>
        <strong>Effective Date:</strong> June 28, 2026
      </p>
      <p>
        This Agreement governs creators who sell itineraries on the{" "}
        <strong>Journli</strong> marketplace. Please read it carefully before
        listing paid content.
      </p>

      {sellerAgreementSections.map((section, index) => (
        <div key={section.title}>
          <h3 className="mt-6 font-semibold">
            {index + 1}. {section.title}
          </h3>
          <p dangerouslySetInnerHTML={{ __html: section.description }} />
        </div>
      ))}
    </section>
  );
}
