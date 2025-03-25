import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/auth.config'

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

    const totalIngresos = transactions
      .filter(t => t.type === 'INGRESO')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalGastos = transactions
      .filter(t => t.type === 'GASTO')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIngresos - totalGastos

    return NextResponse.json({
      totalIngresos,
      totalGastos,
      balance
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener las estadísticas' }, { status: 500 })
  }
} 