export default function Footer() {
  return (
    <footer
      className="
        shrink-0
        px-4 md:px-6
        py-3
        text-center
        text-xs
        text-slate-500
        border-t border-slate-800
        bg-[#171a21]
      "
    >
      © {new Date().getFullYear()} PixelWorks — Plataforma de videojuegos
    </footer>
  );
}