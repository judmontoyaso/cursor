import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
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

        // Obtener todas las transacciones del usuario
        const transactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            orderBy: { date: 'asc' }
        });

        // Agrupar por mes y año
        const balanceMensual = transactions.reduce((acc, t) => {
            const date = new Date(t.date);
            const mes = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            
            if (!acc[mes]) {
                acc[mes] = { ingresos: 0, gastos: 0, date };
            }

            if (t.type === 'income') {
                acc[mes].ingresos += t.amount;
            } else {
                acc[mes].gastos += Math.abs(t.amount);
            }

            return acc;
        }, {} as Record<string, { ingresos: number; gastos: number; date: Date }>);

        // Convertir a array y ordenar por fecha
        const balanceArray = Object.entries(balanceMensual)
            .map(([mes, data]) => ({
                mes,
                ingresos: data.ingresos,
                gastos: data.gastos
            }))
            .sort((a, b) => {
                const dateA = new Date(a.mes);
                const dateB = new Date(b.mes);
                return dateA.getTime() - dateB.getTime();
            });

        return NextResponse.json(balanceArray);
    } catch (error) {
        console.error('Error fetching balance:', error);
        return NextResponse.json(
            { error: 'Error al obtener el balance mensual' },
            { status: 500 }
        );
    }
} 