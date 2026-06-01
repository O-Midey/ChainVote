import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>ChainVote — On-chain voting</title>
        <meta name="description" content="Every vote is a transaction on Base. Immutable. Verifiable." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>
      <ErrorBoundary>
      <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
      </AuthProvider>
      </ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f1f28",
            color: "#f0ede8",
            border: "1px solid rgba(240,237,232,0.08)",
            borderRadius: "10px",
            fontSize: "13px",
          },
          success: { iconTheme: { primary: "#5a9e6f", secondary: "#1f1f28" } },
          error: { iconTheme: { primary: "#c85a54", secondary: "#1f1f28" } },
        }}
      />
    </>
  );
}
