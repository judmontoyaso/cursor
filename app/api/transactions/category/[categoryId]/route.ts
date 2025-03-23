import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        categoryId: params.categoryId,
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        category: true, // Incluimos la información de la categoría
      },
    })

    // Formatear las transacciones para la respuesta
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      categoryName: transaction.category.name,
      categoryColor: transaction.category.color,
      categoryIcon: transaction.category.icon,
    }))
    
    return NextResponse.json(formattedTransactions)
  } catch (error) {
    console.error('Error al cargar las transacciones:', error)
    return NextResponse.json(
      { error: 'Error al cargar las transacciones' },
      { status: 500 }
    )
  }
} 