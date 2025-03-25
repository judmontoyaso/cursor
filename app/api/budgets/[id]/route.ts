import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const data = await request.json()
    const budget = await prisma.budget.update({
      where: {
        id: params.id
      },
      data: {
        name: data.name,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        period: data.period,
        userId: user.id
      },
      include: {
        category: true
      }
    })
    
    return NextResponse.json(budget)
  } catch (error) {
    console.error('Error updating budget:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el presupuesto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.budget.delete({
      where: {
        id: params.id
      }
    })
    
    return NextResponse.json({ message: 'Presupuesto eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el presupuesto' },
      { status: 500 }
    )
  }
} 