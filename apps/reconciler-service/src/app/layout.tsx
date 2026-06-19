export const metadata = {
  title: 'reconciler-service',
  description: 'Outbox reconciler microservice',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
