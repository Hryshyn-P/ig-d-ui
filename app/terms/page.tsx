import Link from "next/link";

export const metadata = { title: "Terms of Use — ReelSave" };

export default function TermsPage() {
  return (
    <main className="legal-page">
      <Link className="legal-back" href="/">← Back to ReelSave</Link>
      <h1>Terms of Use</h1>
      <p className="legal-updated">Last updated: July 21, 2026</p>

      <h2>Permitted use</h2>
      <p>Use ReelSave only for media you own, public-domain material, or content you have permission or a lawful right to download. You are responsible for complying with copyright law and platform terms.</p>

      <h2>Prohibited use</h2>
      <p>You must not attempt to access private accounts, bypass access controls, infringe intellectual property rights, automate abusive request volumes, distribute malware, or use the service for unlawful purposes.</p>

      <h2>Service availability</h2>
      <p>The service is provided on an “as available” basis. Instagram and hosting providers may change or restrict access without notice, so successful processing and uninterrupted availability are not guaranteed.</p>

      <h2>Third-party services</h2>
      <p>ReelSave is independent and is not affiliated with, endorsed by, or sponsored by Instagram or Meta. Links, media, and advertisements may be supplied by third parties under their own terms.</p>

      <h2>Changes</h2>
      <p>These terms may be updated when the service, advertising partners, or legal requirements change. The revision date above identifies the current version.</p>
    </main>
  );
}
