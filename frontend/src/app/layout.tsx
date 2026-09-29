import type { Metadata } from 'next';
import { Orbitron, JetBrains_Mono, Share_Tech_Mono } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '600', '700', '900'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  variable: '--font-share-tech-mono',
  weight: ['400'],
  display: 'swap',
});

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
    <html
      lang="en"
      className={`dark ${orbitron.variable} ${jetbrainsMono.variable} ${shareTechMono.variable}`}
    >
      <body className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0] font-mono antialiased selection:bg-[#00ff88]/30 selection:text-[#00ff88]">
        {/* Ambient CRT Scanline Overlay */}
        <div className="scanline-overlay pointer-events-none" aria-hidden="true" />
        {/* Subtle Cyber Circuit / Grid Background */}
        <div className="cyber-grid fixed inset-0 pointer-events-none opacity-25 z-0" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

