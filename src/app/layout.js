import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../components/AuthProvider';
import Navigation from '../components/Navigation';
import { ToastProvider } from '../components/Toast';
import LeadBot from '../components/LeadBot';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  metadataBase: new URL('https://capital.gro10x.com'),
  title: {
    default: 'GRO10X Capital — Bangladesh Revenue-Share & Private Equity Platform',
    template: '%s | GRO10X Capital',
  },
  description: "Invest from ৳5 Lakh in verified, high-growth SME and franchise campaigns in Bangladesh. Asset-backed, isolated legal SPVs, and monthly audited payouts.",
  keywords: [
    'Private Equity Bangladesh',
    'SME Investment Bangladesh',
    'Revenue Share Investment',
    'Asset Backed Yields',
    'ORO Roasters Investment',
    'GRO10X Capital',
    'High Yield Investment Bangladesh'
  ],
  authors: [{ name: 'GRO10X Capital Team' }],
  creator: 'GRO10X Capital',
  publisher: 'GRO10X Capital',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://capital.gro10x.com',
    siteName: 'GRO10X Capital',
    title: 'GRO10X Capital — Invest Smarter. Earn Verified Yields.',
    description: "Bangladesh's First Revenue-Share & Asset-Backed SME Investment Platform.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GRO10X Capital — Asset-Backed SME Yield Platform',
    description: 'Invest from ৳5 Lakh in verified high-growth campaigns with monthly cash payouts.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FinancialProduct',
  name: 'GRO10X Capital SME Yield Platform',
  description: 'Asset-backed private equity and revenue share investments for retail and institutional investors.',
  provider: {
    '@type': 'Organization',
    name: 'GRO10X Capital',
    url: 'https://capital.gro10x.com',
  },
  areaServed: 'Bangladesh',
  category: 'Private Equity & Revenue Share',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-inter">
        <ToastProvider>
          <AuthProvider>
            <Navigation />
            <main style={{ paddingTop: '70px', minHeight: 'calc(100vh - 70px)' }}>
              {children}
            </main>
            <LeadBot />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
