import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/auth.config'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const transactions = await prisma.transaction.findMany({
            where: { userId: session.user.id },
            include: { category: true }
        })

        const balance = transactions.reduce((acc, transaction) => {
            return acc + (transaction.type === 'INGRESO' ? transaction.amount : -transaction.amount)
        }, 0)

        return NextResponse.json({ balance })
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener el balance' }, { status: 500 })
    }
} 