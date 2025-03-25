import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getCategories, createCategory, deleteCategory } from '@/lib/db'
import { prisma } from '@/lib/prisma'

interface Category {
  name: string;
  color: string;
  icon: string;
  type: string;
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener las categorías' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const category = await prisma.category.create({
      data
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear la categoría' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id, name, color, icon, type } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'El ID de la categoría es requerido' },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, color, icon, type },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la categoría' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'El ID de la categoría es requerido' },
        { status: 400 }
      )
    }

    await deleteCategory(id)
    return NextResponse.json({ message: 'Categoría eliminada' })
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    )
  }
} 