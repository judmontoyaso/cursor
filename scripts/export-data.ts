import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  const categories = await prisma.category.findMany()
  const transactions = await prisma.transaction.findMany()
  const budgets = await prisma.budget.findMany()
  const accounts = await prisma.account.findMany()
  const sessions = await prisma.session.findMany()

  console.log(JSON.stringify({
    users,
    categories,
    transactions,
    budgets,
    accounts,
    sessions
  }, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 