import "./globals.css";

export const metadata = {
  title: "Vada AI Tutor",
  description: "A tutor that thinks with you.",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


