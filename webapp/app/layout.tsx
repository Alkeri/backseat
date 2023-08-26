import './globals.css';
import '@radix-ui/themes/styles.css';

import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import Toast from './toast';
import { ClerkProvider } from '@clerk/nextjs';
import { Theme } from '@radix-ui/themes';

export const metadata = {
  title: 'Backseat',
  description: 'Manage your OSS projects wiht a backseat driver you love.'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className="h-full">
          <Theme>
            <Nav />
            {children}
            <Analytics />
            <Toast />
          </Theme>
        </body>
      </html>
    </ClerkProvider>
  );
}
