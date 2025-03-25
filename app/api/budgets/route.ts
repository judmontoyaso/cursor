import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth.config';

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
        if (!data.name || !data.amount || !data.type || !data.categoryId || !data.startDate) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Crear el presupuesto
        const budget = await prisma.budget.create({
            data: {
                name: data.name,
                amount: data.amount,
                type: data.type,
                categoryId: data.categoryId,
                userId: user.id,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null
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
                startDate: 'desc'
            }
        });

        const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
            const startDate = new Date(budget.startDate);
            const endDate = budget.endDate ? new Date(budget.endDate) : new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

            const transactions = await prisma.transaction.findMany({
                where: {
                    userId: user.id,
                    categoryId: budget.categoryId,
                    type: budget.type,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            const spent = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
            const progress = (spent / budget.amount) * 100;

            return {
                ...budget,
                spent,
                progress
            };
        }));

        return NextResponse.json(budgetsWithProgress);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Error al obtener los presupuestos' }, { status: 500 });
    }
}
