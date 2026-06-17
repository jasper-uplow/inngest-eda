import './global.css';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'Microservices Store',
  description: 'Product catalog and purchase flow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
