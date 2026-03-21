export const metadata = {
  title: "Muay Thai Bag Tracker",
  description: "Heavy bag training tracker for tall fighters",
  manifest: "/manifest.json",
  themeColor: "#F8F7F4",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MT Bag",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body style={{ margin: 0, background: "#F8F7F4", fontFamily: "'Outfit', sans-serif" }}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').then(reg => {
                  reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                      if (newWorker.state === 'activated') {
                        window.location.reload();
                      }
                    });
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
