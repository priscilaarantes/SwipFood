import React from 'react'

export default function Header() {
  return (
    <>
      {/* Navbar fixa no topo com visual moderno e acadêmico */}
      <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-indigo-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-200">
              🎓
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                AcademiStack
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                Node.js + React
              </span>
            </div>
          </div>

          <a
            href="#formulario"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-95 transition shadow-md shadow-indigo-200 hover:shadow-indigo-300"
          >
            Testar Sistema
          </a>
        </div>
      </header>

      {/* Espaçamento do navbar fixo */}
      <div className="h-16"></div>
    </>
  )
}
