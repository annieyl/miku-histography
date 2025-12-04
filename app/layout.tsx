import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "miku histography :D",
  description: "interactive vocaloid history timeline, western-biased",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
