'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { FiLogIn, FiLogOut } from 'react-icons/fi'

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">Mi App de Finanzas</h1>
          </div>
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session?.user ? (
              <div className="flex items-center space-x-4">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Usuario'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-gray-700">{session.user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <FiLogOut />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <FiLogIn />
                <span>Iniciar sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 