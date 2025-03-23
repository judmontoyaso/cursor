import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/lib/db'
import { Session } from "next-auth";
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error al obtener las transacciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener las transacciones' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Debug

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log('User found:', user); // Debug

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const data = await req.json();
    console.log('Data received:', data); // Debug

    // Validar que todos los campos necesarios estén presentes
    if (!data.amount || !data.type || !data.categoryId || !data.description || !data.date) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(data.amount),
        type: data.type,
        categoryId: data.categoryId,
        description: data.description,
        date: new Date(data.date),
        userId: user.id
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error completo:', error);
    return NextResponse.json({ 
      error: 'Error al crear la transacción',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
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