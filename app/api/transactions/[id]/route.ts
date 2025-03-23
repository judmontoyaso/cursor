import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const transaction = await prisma.transaction.update({
      where: {
        id: params.id
      },
      data: {
        description: data.description,
        amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
        date: new Date(data.date),
        categoryId: data.categoryId,
        type: data.type
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error al actualizar la transacción:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la transacción' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.transaction.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Transacción eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar la transacción:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la transacción' },
      { status: 500 }
    )
  }
} 