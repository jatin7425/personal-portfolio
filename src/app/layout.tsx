import type { Metadata } from "next";
import { Bricolage_Grotesque, Albert_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-sans",
  display: "swap",
});

const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jatin Vishwakarma — Backend Engineer",
  description:
    "Jatin Vishwakarma — backend-leaning full-stack engineer from Valsad, India. Python, FastAPI, Node.js, PostgreSQL, Docker, AWS. Projects, experience, and developer blog.",
  keywords: [
    "Jatin Vishwakarma",
    "Backend Engineer",
    "Python Developer",
    "FastAPI",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "Software Engineer",
    "Valsad",
    "India",
  ],
  authors: [{ name: "Jatin Vishwakarma" }],
  creator: "Jatin Vishwakarma",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://github.com/jatin7425",
    title: "Jatin Vishwakarma — Backend Engineer",
    description:
      "Backend-leaning full-stack engineer. Developing scalable APIs, payment flows, RBAC systems and data pipelines with Python, Node.js, PostgreSQL and Docker.",
    siteName: "Jatin Vishwakarma Portfolio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${albertSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
