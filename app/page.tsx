'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { FiDollarSign, FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Chart } from 'primereact/chart'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Stats {
  income: number
  expenses: number
  balance: number
}

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  type: 'expense' | 'income'
  category: {
    name: string
    color: string
    icon: string
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<Stats>({
    income: 0,
    expenses: 0,
    balance: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [chartData, setChartData] = useState({})
  const [chartOptions, setChartOptions] = useState({})
  const toast = useRef<Toast>(null)

  useEffect(() => {
    if (session?.user) {
      loadData()
      loadCategories()
      initChart()
    }
  }, [session])

  const loadData = async () => {
    try {
      // Cargar transacciones
      const transResponse = await fetch('/api/transactions')
      if (!transResponse.ok) throw new Error('Error al cargar transacciones')
      const transData = await transResponse.json()
      setTransactions(transData)

      // Calcular estadísticas
      const income = transData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = Math.abs(transData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0))

      setStats({
        income,
        expenses,
        balance: income - expenses
      })

      updateChartData(income, expenses)
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los datos'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories'); // Asegúrate de que tu API soporte este endpoint
      if (!response.ok) throw new Error('Error al cargar categorías');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const initChart = () => {
    setChartOptions({
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `$${value}`
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    })
  }

  const updateChartData = (income: number, expenses: number) => {
    setChartData({
      labels: ['Ingresos', 'Gastos'],
      datasets: [
        {
          data: [income, expenses],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)'
          ],
          borderWidth: 1,
          barThickness: 50
        }
      ]
    })
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Bienvenido a Mi App de Finanzas
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Por favor, inicia sesión para comenzar a gestionar tus finanzas
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Toast ref={toast} />
      
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Balance Total</h2>
            <i className="pi pi-wallet text-blue-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            ${stats.balance.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Ingresos</h2>
            <i className="pi pi-arrow-up text-green-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${stats.income.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Gastos</h2>
            <i className="pi pi-arrow-down text-red-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            ${stats.expenses.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Últimas Transacciones
          </h2>
          {transactions.slice(0, 5).map(transaction => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <i className={`${transaction.category.icon} text-lg`} 
                   style={{ color: transaction.category.color }} />
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`font-semibold ${
                transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
              }`}>
                {transaction.type === 'expense' ? '-' : '+'}
                ${Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Resumen de Gastos
          </h2>
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
