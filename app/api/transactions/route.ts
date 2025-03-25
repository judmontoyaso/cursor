import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth.config'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/lib/db'
import { Session } from "next-auth";
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener las transacciones' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId: session.user.id
      },
      include: { category: true }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear la transacción' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()
    if (!data.id) {
      return NextResponse.json(
        { error: 'ID de transacción no proporcionado' },
        { status: 400 }
      )
    }

    const transaction = await updateTransaction({
      ...data,
      date: new Date(data.date),
      userId: session.user.id
    })
    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error al actualizar transacción:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la transacción' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de transacción no proporcionado' },
        { status: 400 }
      )
    }

    await deleteTransaction(id, session.user.id)
    return NextResponse.json({ message: 'Transacción eliminada' })
  } catch (error) {
    console.error('Error al eliminar transacción:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la transacción' },
      { status: 500 }
    )
  }
} 