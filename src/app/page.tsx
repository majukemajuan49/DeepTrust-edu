import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="mx-auto max-w-lg px-6 text-center">
        {/* Logo Container */}
        <div className="mx-auto mb-6 flex justify-center">
          <div className="inline-flex items-center justify-center bg-white w-20 h-20 rounded-full shadow-xl">
            <img
              src="/logo.png?v=2"
              alt="DeepTrust Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>

        <h1 className="mb-2 text-4xl font-bold text-white">DeepTrust</h1>
        <p className="mb-8 text-slate-400">
          Platform simulasi edukasi untuk literasi verifikasi deepfake scam
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/play"
            className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            🎮 Mulai Simulasi
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-6 py-3 text-lg font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            📊 Dashboard Dosen
          </Link>
        </div>
      </div>
    </div>
  );
}
