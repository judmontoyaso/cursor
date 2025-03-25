import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    { name: 'Alquiler', icon: 'pi pi-home', type: 'EXPENSE', color: '#FF5733' },
    { name: 'Comida', icon: 'pi pi-utensils', type: 'EXPENSE', color: '#FFC300' },
    { name: 'Transporte', icon: 'pi pi-car', type: 'EXPENSE', color: '#DAF7A6' },
    { name: 'Entretenimiento', icon: 'pi pi-film', type: 'EXPENSE', color: '#C70039' },
    { name: 'Salario', icon: 'pi pi-briefcase', type: 'INCOME', color: '#581845' },
    { name: 'Inversiones', icon: 'pi pi-chart-line', type: 'INCOME', color: '#900C3F' },
    { name: 'Otros', icon: 'pi pi-plus', type: 'INCOME', color: '#FF5733' },
  ]

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    })
  }

  console.log('Categorías predeterminadas creadas.')
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
