import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../components/AuthProvider';
import Navigation from '../components/Navigation';
import { ToastProvider } from '../components/Toast';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import LeadBot from '../components/LeadBot';

export const metadata = {
  title: 'GRO10X Capital Ecosystem — Invest Smarter. Earn Verified Yields.',
  description: 'The Next-Generation Private Equity & SME Yield Investment Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
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
