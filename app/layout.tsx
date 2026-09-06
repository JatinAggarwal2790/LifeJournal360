import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Life Journal 360',
  description: 'User-authenticated personal reflection and journaling application with AI insights powered by Gemini and isolated cloud storage in Firestore.',
  openGraph: {
    title: 'Life Journal 360',
    description: 'User-authenticated personal reflection and journaling application with AI insights powered by Gemini and isolated cloud storage in Firestore.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Life Journal 360',
    description: 'User-authenticated personal reflection and journaling application with AI insights powered by Gemini and isolated cloud storage in Firestore.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
