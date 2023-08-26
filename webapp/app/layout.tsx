import './globals.css';
import '@radix-ui/themes/styles.css';

import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import Toast from './toast';
import { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Theme } from '@radix-ui/themes';

export const metadata = {
  title: 'Next.js 13 + PlanetScale + NextAuth + Tailwind CSS',
  description:
    'A user admin dashboard configured with Next.js, PlanetScale, NextAuth, Tailwind CSS, TypeScript, ESLint, and Prettier.'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full bg-gray-50">
        <body className="h-full">
          <Theme>
            <Suspense>
              <Nav />
            </Suspense>
            {children}
            <Analytics />
            <Toast />
          </Theme>
        </body>
      </html>
    </ClerkProvider>
  );
}
