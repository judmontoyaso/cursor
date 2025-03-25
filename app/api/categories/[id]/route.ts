import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth.config'

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
        const category = await prisma.category.findUnique({
            where: { id: params.id }
        })

        if (!category) {
            return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
        }

        if (category.userId !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const updatedCategory = await prisma.category.update({
            where: { id: params.id },
            data: {
                name: data.name,
                color: data.color,
                icon: data.icon
            }
        })

        return NextResponse.json(updatedCategory)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Error al actualizar la categoría' }, { status: 500 })
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

        const category = await prisma.category.findUnique({
            where: { id: params.id }
        })

        if (!category) {
            return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
        }

        if (category.userId !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Verificar si hay transacciones asociadas a esta categoría
        const transactionCount = await prisma.transaction.count({
            where: { categoryId: params.id }
        })

        if (transactionCount > 0) {
            return NextResponse.json(
                { error: 'No se puede eliminar una categoría con transacciones asociadas' },
                { status: 400 }
            )
        }

        // Verificar si hay presupuestos asociados a esta categoría
        const budgetCount = await prisma.budget.count({
            where: { categoryId: params.id }
        })

        if (budgetCount > 0) {
            return NextResponse.json(
                { error: 'No se puede eliminar una categoría con presupuestos asociados' },
                { status: 400 }
            )
        }

        await prisma.category.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Categoría eliminada exitosamente' })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Error al eliminar la categoría' }, { status: 500 })
    }
} 