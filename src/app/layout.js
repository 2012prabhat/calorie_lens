import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserProvider } from "@/context/UserContext";
import ReduxProvider from "@/components/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Calorie Lens — Smart AI Nutrition & Calorie Tracking",
  description: "Snap a photo of your meal to get instant, accurate macro breakdowns and insights powered by Gemini AI.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-y-scroll`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ReduxProvider>
            <UserProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: "rgba(15, 23, 42, 0.9)",
                    color: "#f8fafc",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "1rem",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    padding: "12px 18px",
                  },
                  success: {
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#0f172a",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#0f172a",
                    },
                  },
                }}
              />
              {children}
            </UserProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
