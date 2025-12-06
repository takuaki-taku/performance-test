import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import './App.css'; // App.css をインポート
import { ToastContainer } from '@/components/common/Toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app">
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}