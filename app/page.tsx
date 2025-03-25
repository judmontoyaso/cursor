'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useMemo } from 'react'
import { FiDollarSign, FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Chart } from 'primereact/chart'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { OverlayPanel } from 'primereact/overlaypanel'

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
    id: string
    name: string
    color: string
    icon: string
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  })
  const [showFilters, setShowFilters] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState({
    category: null as string | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
    selectedMonth: new Date()
  })
  const op = useRef<OverlayPanel>(null)
  const toast = useRef<Toast>(null)

  const calculateTotals = (transactions: Transaction[]) => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { 
      income, 
      expenses,
      balance: income - expenses 
    };
  };

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return [start, end]
  }

  const getDateRangeWithHours = (start: Date, end: Date) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
    return [startDate, endDate]
  }

  const resetFilters = () => {
    setSelectedCategory(null)
    setStartDate(null)
    setEndDate(null)
    setSelectedMonth(new Date())
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesCategory = !selectedCategory || transaction.category.id === selectedCategory;
      const transactionDate = new Date(transaction.date);
      
      let matchesDateRange = true;
      if (startDate && endDate) {
        const [start, end] = getDateRangeWithHours(startDate, endDate);
        matchesDateRange = transactionDate >= start && transactionDate <= end;
      } else if (selectedMonth) {
        const [start, end] = getMonthRange(selectedMonth);
        matchesDateRange = transactionDate >= start && transactionDate <= end;
      }
      
      return matchesCategory && matchesDateRange;
    });
  }, [transactions, selectedCategory, startDate, endDate, selectedMonth]);

  const filteredStats = useMemo(() => {
    return calculateTotals(filteredTransactions);
  }, [filteredTransactions]);

  const chartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value}`
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const chartData = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        data: [filteredStats.income, filteredStats.expenses],
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
  };

  useEffect(() => {
    if (session?.user) {
      loadData()
      loadCategories()
    }
  }, [session])

  const loadData = async () => {
    try {
      const transResponse = await fetch('/api/transactions')
      if (!transResponse.ok) throw new Error('Error al cargar transacciones')
      const transData = await transResponse.json()
      setTransactions(transData)
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
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            icon="pi pi-filter" 
            onClick={(e) => op.current?.toggle(e)}
            className="p-button-outlined"
          />
        </div>
      </div>

      <OverlayPanel ref={op} className="w-80">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <Calendar
              value={selectedMonth}
              onChange={(e) => {
                if (e.value) {
                  const date = new Date(e.value);
                  setSelectedMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                  setStartDate(null);
                  setEndDate(null);
                }
              }}
              view="month"
              dateFormat="mm/yy"
              className="w-full"
              showIcon
              maxDate={new Date()}
              showButtonBar
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rango Personalizado
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Desde</label>
                <Calendar
                  value={startDate}
                  onChange={(e) => {
                    if (e.value) {
                      const date = new Date(e.value);
                      date.setHours(0, 0, 0, 0);
                      setStartDate(date);
                    } else {
                      setStartDate(null);
                    }
                  }}
                  dateFormat="dd/mm/yy"
                  className="w-full"
                  showIcon
                  maxDate={endDate || new Date()}
                  showButtonBar
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                <Calendar
                  value={endDate}
                  onChange={(e) => {
                    if (e.value) {
                      const date = new Date(e.value);
                      date.setHours(23, 59, 59, 999);
                      setEndDate(date);
                    } else {
                      setEndDate(null);
                    }
                  }}
                  dateFormat="dd/mm/yy"
                  className="w-full"
                  showIcon
                  minDate={startDate || undefined}
                  maxDate={new Date()}
                  showButtonBar
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <Dropdown
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.value)}
              options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
              placeholder="Todas las categorías"
              className="w-full"
              showClear
            />
          </div>

          <div className="flex gap-2">
            <Button 
              label="Aplicar Filtros" 
              icon="pi pi-check" 
              onClick={() => {
                setAppliedFilters({
                  category: selectedCategory,
                  startDate,
                  endDate,
                  selectedMonth
                });
                op.current?.hide();
              }}
              className="flex-1"
            />
            <Button 
              label="Limpiar" 
              icon="pi pi-times" 
              onClick={() => {
                setSelectedCategory(null);
                setStartDate(null);
                setEndDate(null);
                setSelectedMonth(new Date());
                setAppliedFilters({
                  category: null,
                  startDate: null,
                  endDate: null,
                  selectedMonth: new Date()
                });
              }}
              className="p-button-outlined"
            />
          </div>
        </div>
      </OverlayPanel>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Balance Total</h2>
            <i className="pi pi-wallet text-blue-500 text-xl" />
          </div>
          <p className={`text-2xl font-bold ${filteredStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(filteredStats.balance).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Ingresos</h2>
            <i className="pi pi-arrow-up text-green-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${filteredStats.income.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Gastos</h2>
            <i className="pi pi-arrow-down text-red-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            ${filteredStats.expenses.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Últimas Transacciones
          </h2>
          {filteredTransactions.slice(0, 5).map(transaction => (
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
