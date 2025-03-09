import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import './App.css'; // App.css をインポート

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app">{children}</body>
    </html>
  );
}