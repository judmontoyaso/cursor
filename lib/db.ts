import prisma from './prisma'

export async function getTransactions(userId?: string) {
  try {
    console.log('Obteniendo transacciones...')
    const transactions = await prisma.transaction.findMany({
      where: userId ? { userId } : undefined,
      orderBy: {
        date: 'desc'
      },
      include: {
        category: true
      }
    })
    console.log('Transacciones obtenidas:', transactions)
    return transactions
  } catch (error) {
    console.error('Error en getTransactions:', error)
    throw error
  }
}

export async function createTransaction(data: {
  date: Date
  amount: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  userId?: string
}) {
  try {
    console.log('Creando transacción con datos:', data)
    const transaction = await prisma.transaction.create({
      data: {
        date: data.date,
        amount: data.amount,
        description: data.description,
        type: data.type,
        categoryId: data.categoryId,
        userId: data.userId || 'default-user'
      }
    })
    console.log('Transacción creada:', transaction)
    return transaction
  } catch (error) {
    console.error('Error en createTransaction:', error)
    throw error
  }
}

export async function getCategories(userId?: string) {
  try {
    console.log('Obteniendo categorías...')
    const categories = await prisma.category.findMany({
      where: userId ? { userId } : undefined,
      orderBy: {
        name: 'asc'
      }
    })
    console.log('Categorías obtenidas:', categories)
    return categories
  } catch (error) {
    console.error('Error en getCategories:', error)
    throw error
  }
}

export async function createCategory(data: {
  name: string;
  color: string;
  icon?: string;
  type?: TransactionType;
  userId?: string;
}) {
  try {
    console.log('Creando categoría con datos:', data);
    const category = await prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon || 'FiTag', // Icono por defecto
        type: data.type || 'EXPENSE', // Tipo por defecto
        userId: data.userId || 'default-user', // ID de usuario por defecto
      },
    });
    console.log('Categoría creada exitosamente:', category);
    return category;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    console.log('Eliminando categoría con ID:', id)
    await prisma.category.delete({
      where: { id }
    })
    console.log('Categoría eliminada')
  } catch (error) {
    console.error('Error en deleteCategory:', error)
    throw error
  }
}

export async function getMonthlyStats(userId?: string) {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [income, expenses] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        },
        userId: userId
      },
      _sum: {
        amount: true
      }
    }),
    prisma.transaction.aggregate({
      where: {
        type: 'EXPENSE',
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        },
        userId: userId
      },
      _sum: {
        amount: true
      }
    })
  ])

  return {
    income: income._sum.amount || 0,
    expenses: expenses._sum.amount || 0,
    balance: (income._sum.amount || 0) - (expenses._sum.amount || 0)
  }
}

export async function getExpensesByCategory() {
  return prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      type: 'EXPENSE',
      date: {
        gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
      }
    },
    _sum: {
      amount: true
    },
    include: {
      category: true
    }
  })
}

export async function updateTransaction(data: {
  id: string
  date: Date
  amount: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  userId: string
}) {
  try {
    console.log('Actualizando transacción:', data)
    const transaction = await prisma.transaction.update({
      where: {
        id: data.id,
        userId: data.userId
      },
      data: {
        date: data.date,
        amount: data.amount,
        description: data.description,
        type: data.type,
        categoryId: data.categoryId
      },
      include: {
        category: true
      }
    })
    console.log('Transacción actualizada:', transaction)
    return transaction
  } catch (error) {
    console.error('Error en updateTransaction:', error)
    throw error
  }
}

export async function deleteTransaction(id: string, userId: string) {
  try {
    console.log('Eliminando transacción:', id)
    const transaction = await prisma.transaction.delete({
      where: {
        id,
        userId
      }
    })
    console.log('Transacción eliminada:', transaction)
    return transaction
  } catch (error) {
    console.error('Error en deleteTransaction:', error)
    throw error
  }
} 