import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Por favor ingrese sus credenciales')
                }

                try {
                    // @ts-ignore - Usar any para evitar errores de tipo
                    const user: any = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    })

                    if (!user) {
                        throw new Error('Usuario no encontrado')
                    }

                    // @ts-ignore - Evitar error de tipo con password
                    const isValid = user.password ? await bcrypt.compare(credentials.password, user.password) : false

                    if (!isValid) {
                        throw new Error('Contraseña incorrecta')
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    }
                } catch (error) {
                    console.error('Error en authorize:', error)
                    return null
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/login'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        }
    }
} 