import Script from 'next/script';

export const metadata = {
  title: 'GRO10X OS — Team & Management Mini App',
  description: 'Mobile Command Center for GRO10X Capital Team Members',
};

export default function TeamMiniAppLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0f1a2e', color: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
