import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../components/AuthProvider';
import Navigation from '../components/Navigation';
import { ToastProvider } from '../components/Toast';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: 'GRO10X Capital Ecosystem',
  description: 'The Next-Generation Private Equity Ecosystem',
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
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
