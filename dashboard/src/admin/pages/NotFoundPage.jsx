import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, AlertCircle } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white text-zinc-900 p-4 select-none relative overflow-hidden">
      <div className="relative z-10 max-w-lg w-full text-center space-y-6 bg-white border border-black/10 p-8 sm:p-10 rounded-2xl shadow-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Error 404 • Admin Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
            Page Not Found
          </h1>
          <p className="text-black/60 text-sm sm:text-base leading-relaxed">
            The page or resource you are looking for might have been removed, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-black bg-black/[0.04] hover:bg-black/[0.08] border border-black/15 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
