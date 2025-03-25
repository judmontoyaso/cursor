import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getCategories, createCategory, deleteCategory } from '@/lib/db'
import prisma from '@/lib/prisma'

interface Category {
  name: string;
  color: string;
  icon: string;
  type: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (id && id !== 'categories') {
      // Obtener una categoría específica por ID
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
      }

      return NextResponse.json(category);
    } else {
      // Obtener todas las categorías
      const categories = await getCategories(session.user.id);
      return NextResponse.json(categories);
    }
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const category = await request.json();

    if (!category.name || !category.color || !category.icon || !category.type) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const createdCategory = await prisma.category.create({
      data: {
        ...category,
        userId: session.user.id,
      },
    });

    return NextResponse.json(createdCategory);
  } catch (error) {
    console.error('Error al crear categorías:', error);
    return NextResponse.json(
      { error: 'Error al crear categorías' },
      { status: 500 }
    );
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