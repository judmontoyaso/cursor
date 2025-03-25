import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth.config'

export async function PUT(request, { params }) {
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
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
    }

    if (transaction.userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
        categoryId: data.categoryId,
        type: data.type
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al actualizar la transacción' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
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

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
    }

    if (transaction.userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.transaction.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Transacción eliminada exitosamente' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al eliminar la transacción' }, { status: 500 })
  }
} 