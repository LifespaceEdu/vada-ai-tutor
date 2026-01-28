import "./globals.css";

export const metadata = {
  title: "Indigenous-Centered Tutor",
  description: "Semi-Socratic AI tutor centering Indigenous and marginalized perspectives.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

