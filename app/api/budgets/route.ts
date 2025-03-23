import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const data = await req.json();
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const budget = await prisma.budget.create({
            data: {
                name: data.name,
                amount: data.amount,
                type: data.type,
                categoryId: data.categoryId,
                period: data.period || 'monthly',
                userId: user.id
            },
            include: {
                category: true
            }
        });

        return NextResponse.json(budget);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Error al crear el presupuesto' }, { status: 500 });
    }
}

export async function GET() {
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

        const budgets = await prisma.budget.findMany({
            where: { userId: user.id },
            include: {
                category: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Obtener todas las transacciones del usuario
        const transactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            select: {
                amount: true,
                type: true,
                categoryId: true,
                date: true
            }
        });

        // Calcular el progreso para cada presupuesto
        const budgetsWithProgress = budgets.map(budget => {
            // Filtrar transacciones por categoría y tipo
            const categoryTransactions = transactions.filter(t => 
                t.categoryId === budget.categoryId && 
                t.type === budget.type
            );

            // Calcular el total gastado/ingresado
            const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

            // Calcular el progreso
            const progress = budget.amount > 0 ? (total / budget.amount) * 100 : 0;

            return {
                ...budget,
                progress,
                spent: total // Agregamos el total gastado/ingresado
            };
        });

        return NextResponse.json(budgetsWithProgress);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Error al obtener los presupuestos' }, { status: 500 });
    }
}
