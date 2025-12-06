import 'bootstrap/dist/css/bootstrap.min.css';
import '../globals.css';
import '../App.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app">
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

