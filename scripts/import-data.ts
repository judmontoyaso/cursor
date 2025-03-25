import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'))

  // Importar usuarios
  for (const user of data.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image
      }
    })
  }

  // Importar categorías
  for (const category of data.categories) {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        type: category.type,
        color: category.color,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        userId: category.userId
      }
    })
  }

  // Importar transacciones
  for (const transaction of data.transactions) {
    await prisma.transaction.create({
      data: {
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        type: transaction.type,
        categoryId: transaction.categoryId,
        userId: transaction.userId
      }
    })
  }

  // Importar presupuestos
  for (const budget of data.budgets) {
    await prisma.budget.create({
      data: {
        id: budget.id,
        name: budget.name,
        amount: budget.amount,
        type: budget.type,
        categoryId: budget.categoryId,
        userId: budget.userId,
        startDate: budget.startDate,
        endDate: budget.endDate,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt
      }
    })
  }

  // Importar cuentas
  for (const account of data.accounts) {
    await prisma.account.create({
      data: {
        id: account.id,
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state
      }
    })
  }

  console.log('Datos importados correctamente')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 