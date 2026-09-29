import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CyberGuard | AI-Powered Cyber Threat & Phishing SOC',
  description: 'AI-Powered Cyber Threat, Phishing & Digital Impersonation Detection and Response System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="cyber-grid fixed inset-0 pointer-events-none opacity-40 z-0" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
