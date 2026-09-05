import { useEffect, useState } from "react";
import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import Footer from "../layout/Footer";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const location = useLocation();

  useEffect(() => {
    const esDesktop = window.innerWidth >= 768;

    setSidebarOpen(esDesktop);

    const manejarResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener(
      "resize",
      manejarResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        manejarResize
      );
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location]);

  return (
    <div
      className="
        h-screen
        flex flex-col
        bg-[#1b1f27]
        overflow-hidden
        font-sans
        text-slate-100
      "
    >
      <Navbar
        onToggleSidebar={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <div
        className="
          flex flex-1
          relative
          overflow-hidden
          min-h-0
        "
      >
        <Sidebar
          isOpen={sidebarOpen}
        />

        <div
          className="
            flex-1
            flex flex-col
            min-w-0
            overflow-hidden
          "
        >
          <main
            className="
              flex-1
              overflow-y-auto
              p-4 md:p-6
              bg-[#1b1f27]
            "
          >
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="
            fixed
            inset-0
            bg-black/50
            backdrop-blur-[2px]
            z-20
            md:hidden
          "
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}
    </div>
  );
}