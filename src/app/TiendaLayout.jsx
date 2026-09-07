import { Outlet } from "react-router-dom";
import TiendaNavbar from "../layout/TiendaNavbar";
import Footer from "../layout/Footer";

export default function TiendaLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1b1f27] text-slate-100 font-sans">
      <TiendaNavbar />
      
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}