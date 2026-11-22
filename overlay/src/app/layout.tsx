import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { Showcase } from "@/components/Showcase";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const TITLE = "FlatJai 揾樓仔: find a home in Hong Kong, without the guesswork";
const DESCRIPTION =
  "An AI agent that finds students a home in Hong Kong: real listings with the true monthly and move-in cost, " +
  "the commute to campus by bus and MTR, and why each fits. Free and public on GitHub; runs on your own machine.";

export const metadata: Metadata = {
  metadataBase: new URL("https://flatjai.github.io"),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "FlatJai",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { title: "FlatJai" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "FlatJai",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "FlatJai: find a home in Hong Kong, without the guesswork" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.png"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
  colorScheme: "dark",
};

// The page never talks to a backend here. This runs before the app loads: any request to the
// (placeholder) API answers with an empty list, so the app's chat list stays quietly empty.
const NO_BACKEND = `(() => {
  const api = "https://api.flatjai.invalid";
  const real = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith(api)) return Promise.resolve(new Response("[]", { headers: { "Content-Type": "application/json" } }));
    return real(input, init);
  };
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_BACKEND }} />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
        <Showcase />
      </body>
    </html>
  );
}
