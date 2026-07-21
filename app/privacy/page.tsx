import Link from "next/link";

export const metadata = { title: "Privacy Policy — ReelSave" };

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link className="legal-back" href="/">← Back to ReelSave</Link>
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: July 21, 2026</p>

      <h2>Information you provide</h2>
      <p>When you submit an Instagram URL or public username, it is sent to our processing service solely to locate the requested public media. Do not submit private links, credentials, or personal information.</p>

      <h2>Technical information</h2>
      <p>Our hosting providers may process limited technical information such as IP address, browser type, timestamps, request status, and security logs to operate and protect the service.</p>

      <h2>Browser storage and advertising</h2>
      <p>We use essential local storage to remember your privacy selection. Advertising and analytics scripts remain blocked unless you consent to the corresponding category. Advertising partners may then process device identifiers, IP address, browser information, and interactions according to their own privacy policies.</p>

      <h2>Your choices</h2>
      <p>You may reject optional processing or withdraw consent at any time using “Privacy settings” in the footer. Clearing browser storage also resets your saved choice.</p>

      <h2>Data retention</h2>
      <p>ReelSave does not intentionally create a download history or permanently store downloaded media. Short-lived operational logs may be retained by infrastructure providers for reliability, abuse prevention, and security.</p>

      <h2>Third-party services</h2>
      <p>Instagram media and advertising content are delivered by third parties. Their handling of information is governed by their respective policies. ReelSave is not affiliated with Instagram or Meta.</p>

      <h2>Contact</h2>
      <p>Provide a public support or privacy contact before launching advertising campaigns so visitors can submit privacy requests.</p>
    </main>
  );
}
