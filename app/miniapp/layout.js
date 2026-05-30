import Script from 'next/script';

export const metadata = {
  title: 'Partnership Harmony',
  description: 'Cycle tracking Mini App',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function MiniAppLayout({ children }) {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
