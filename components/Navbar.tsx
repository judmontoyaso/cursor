'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { FiLogIn, FiLogOut } from 'react-icons/fi'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Mi App de Finanzas</h1>
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || ''}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-gray-700">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 px-4 py-2 text-sm text-red-600 hover:text-red-800"
                >
                  <FiLogOut />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="flex items-center space-x-1 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <FiLogIn />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 