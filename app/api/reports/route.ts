import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth.config';

type TransactionType = 'income' | 'expense';

interface MonthlyBalance {
    income: number;
    expense: number;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Obtener todas las transacciones del usuario con un solo query
        const transactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            include: {
                category: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Calcular totales
        const totales = transactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.income += t.amount
            } else {
                acc.expense += Math.abs(t.amount)
            }
            return acc
        }, { income: 0, expense: 0 })

        // Calcular gastos por categoría
        const gastosPorCategoria = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category.name] = (acc[t.category.name] || 0) + Math.abs(t.amount)
                return acc
            }, {} as Record<string, number>)

        // Calcular ingresos por categoría
        const ingresosPorCategoria = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => {
                acc[t.category.name] = (acc[t.category.name] || 0) + t.amount
                return acc
            }, {} as Record<string, number>)

        // Calcular balance mensual
        const balanceMensual = transactions.reduce((acc, t) => {
            const date = new Date(t.date)
            const mes = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
            
            if (!acc[mes]) {
                acc[mes] = { 
                    income: 0, 
                    expense: 0,
                    date: date // Agregamos la fecha para ordenamiento
                }
            }

            if (t.type === 'income') {
                acc[mes].income += t.amount
            } else {
                acc[mes].expense += Math.abs(t.amount)
            }

            return acc
        }, {} as Record<string, { income: number; expense: number; date: Date }>)

        // Ordenar balance mensual por fecha
        const balanceMensualOrdenado = Object.entries(balanceMensual)
            .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
            .reduce((acc, [key, value]) => {
                acc[key] = value
                return acc
            }, {} as Record<string, { income: number; expense: number; date: Date }>)

        // Obtener presupuestos
        const presupuestos = await prisma.budget.findMany({
            where: { userId: user.id },
            include: {
                category: true
            },
            orderBy: {
                startDate: 'desc'
            }
        })

        // Calcular gastos reales para cada presupuesto
        const presupuestosConGastos = await Promise.all(presupuestos.map(async (presupuesto) => {
            const gastos = await prisma.transaction.findMany({
                where: {
                    userId: user.id,
                    categoryId: presupuesto.categoryId,
                    type: 'expense',
                    date: {
                        gte: new Date(presupuesto.startDate),
                        lte: presupuesto.endDate ? new Date(presupuesto.endDate) : new Date()
                    }
                }
            })

            const gastosTotales = gastos.reduce((sum, t) => sum + Math.abs(t.amount), 0)
            const progreso = (gastosTotales / presupuesto.amount) * 100

            return {
                ...presupuesto,
                spent: gastosTotales,
                progress: progreso,
                startDate: presupuesto.startDate.toISOString(),
                endDate: presupuesto.endDate?.toISOString() || null
            }
        }))

        return NextResponse.json({
            totales,
            gastosPorCategoria,
            ingresosPorCategoria,
            balanceMensual: balanceMensualOrdenado,
            ultimasTransacciones: transactions.slice(0, 5),
            presupuestos: presupuestosConGastos
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Error al obtener los reportes' }, { status: 500 });
    }
} 