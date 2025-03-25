import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth.config'

export async function GET(request, { params }) {
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

        const budget = await prisma.budget.findUnique({
            where: { id: params.id },
            include: {
                category: true
            }
        })

        if (!budget) {
            return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
        }

        if (budget.userId !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        return NextResponse.json(budget)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Error al obtener el presupuesto' }, { status: 500 })
    }
}

export async function PUT(request, { params }) {
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

        const data = await request.json()
        const budget = await prisma.budget.findUnique({
            where: { id: params.id }
        })

        if (!budget) {
            return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
        }

        if (budget.userId !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const updatedBudget = await prisma.budget.update({
            where: { id: params.id },
            data: {
                name: data.name,
                amount: data.amount,
                type: data.type,
                categoryId: data.categoryId,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null
            },
            include: {
                category: true
            }
        })

        return NextResponse.json(updatedBudget)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Error al actualizar el presupuesto' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
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

        const budget = await prisma.budget.findUnique({
            where: { id: params.id }
        })

        if (!budget) {
            return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
        }

        if (budget.userId !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        await prisma.budget.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Presupuesto eliminado exitosamente' })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Error al eliminar el presupuesto' }, { status: 500 })
    }
} 