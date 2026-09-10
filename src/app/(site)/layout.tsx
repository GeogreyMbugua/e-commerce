"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import { AuthProvider } from "@/providers/AuthProvider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import CartHydrator from "@/components/Cart/CartHydrator";
import MobileBottomNav from "@/components/Store/MobileBottomNav";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const isAuthSurface = pathname === "/signin" || pathname === "/signup";
  const useFocusedShell = isAdmin || isAuthSurface;

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link
          rel="icon"
          href={`${basePath}/images/logo/vintage.png`}
          type="image/png"
        />
      </head>
      <body>
        {loading ? (
          <PreLoader />
        ) : (
          <>
            <ReduxProvider>
              <AuthProvider>
                <CartHydrator />
                <CartModalProvider>
                  <ModalProvider>
                    <PreviewSliderProvider>
                      {useFocusedShell ? (
                        children
                      ) : (
                        <>
                          <Header />
                          <div className="pb-20 lg:pb-0">
                            {children}
                            <Footer />
                          </div>

                          <QuickViewModal />
                          <CartSidebarModal />
                          <PreviewSliderModal />
                          <MobileBottomNav />
                        </>
                      )}
                    </PreviewSliderProvider>
                  </ModalProvider>
                </CartModalProvider>
              </AuthProvider>
            </ReduxProvider>
            {!useFocusedShell ? <ScrollToTop /> : null}
          </>
        )}
      </body>
    </html>
  );
}
