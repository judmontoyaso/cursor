import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Primero verificar si hay transacciones asociadas
    const transactionsCount = await prisma.transaction.count({
      where: {
        categoryId: params.id
      }
    })

    if (transactionsCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la categoría porque tiene transacciones asociadas' },
        { status: 400 }
      )
    }

    // Si no hay transacciones, proceder con la eliminación
    await prisma.category.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Categoría eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar la categoría:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    )
  }
} 