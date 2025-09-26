import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal | Journli",
  description: "Privacy Policy, Terms of Service, and Cookie Policy for Journli.",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Legal Information</h1>
      <div className="prose prose-gray dark:prose-invert">{children}</div>
    </main>
  );
}
