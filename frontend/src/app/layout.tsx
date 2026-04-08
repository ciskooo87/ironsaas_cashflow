import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#f7f8fa', color: '#101828' }}>{children}</body>
    </html>
  );
}
