import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type TransactionType = 'income' | 'expense';

interface MonthlyBalance {
    income: number;
    expense: number;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Obtener todas las transacciones del usuario
        const transactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            include: {
                category: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Calcular totales por tipo
        const totales = transactions.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + t.amount;
            return acc;
        }, {} as Record<TransactionType, number>);

        // Calcular gastos por categoría
        const gastosPorCategoria = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category.name] = (acc[t.category.name] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        // Calcular ingresos por categoría
        const ingresosPorCategoria = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => {
                acc[t.category.name] = (acc[t.category.name] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        // Calcular balance mensual
        const balanceMensual = transactions.reduce((acc, t) => {
            const mes = new Date(t.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            if (!acc[mes]) {
                acc[mes] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                acc[mes].income += t.amount;
            } else {
                acc[mes].expense += t.amount;
            }
            return acc;
        }, {} as Record<string, MonthlyBalance>);

        // Obtener presupuestos del usuario
        const presupuestos = await prisma.budget.findMany({
            where: { userId: user.id },
            include: {
                category: true
            }
        });

        return NextResponse.json({
            totales,
            gastosPorCategoria,
            ingresosPorCategoria,
            balanceMensual,
            ultimasTransacciones: transactions.slice(0, 5),
            presupuestos
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Error al obtener los reportes' }, { status: 500 });
    }
} 