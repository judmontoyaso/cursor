'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Calendar } from 'primereact/calendar'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Card } from 'primereact/card'
import TransactionForm from '../components/TransactionForm'
import type { TransactionFormData } from '../components/TransactionForm'

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: 'INGRESO' | 'GASTO'
  categoryId: string
  category: {
    id: string
    name: string
    color: string
    icon: string
    type: 'expense' | 'income'
  }
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
  type: 'expense' | 'income'
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionFormData | null>(null)
  const toast = useRef<Toast>(null)

  useEffect(() => {
    fetchTransactions()
    loadCategories()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (!response.ok) throw new Error('Error al obtener las transacciones')
      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Error al cargar las categorías')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar las categorías' })
    }
  }

  const handleSubmit = async (formData: TransactionFormData) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description,
          amount: formData.amount,
          date: formData.date.toISOString(),
          type: formData.type,
          categoryId: formData.categoryId
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear la transacción')
      }

      const newTransaction = await response.json()
      setTransactions([...transactions, newTransaction])
      setShowForm(false)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Error al eliminar la transacción')
      
      setTransactions(transactions.filter(t => t.id !== id))
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const amountTemplate = (rowData: Transaction) => {
    const amount = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(rowData.amount)
    
    return <span className={rowData.type === 'INGRESO' ? 'text-green-500' : 'text-red-500'}>
      {amount}
    </span>
  }

  const actionTemplate = (rowData: Transaction) => (
    <Button
      icon="pi pi-trash"
      className="p-button-danger p-button-text"
      onClick={() => handleDelete(rowData.id)}
    />
  )

  const categoryBodyTemplate = (rowData: Transaction) => (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style={{ 
            backgroundColor: `${rowData.category?.color}20`, 
            color: rowData.category?.color,
            border: `1px solid ${rowData.category?.color}`
          }}>
      <i className={`${rowData.category?.icon} text-sm`}></i>
      {rowData.category?.name}
    </span>
  )

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <Button
          label="Nueva Transacción"
          icon="pi pi-plus"
          onClick={() => setShowForm(true)}
        />
      </div>

      <DataTable 
        value={transactions} 
        paginator 
        rows={10} 
        className="shadow-sm"
        stripedRows
        sortField="date"
        sortOrder={-1}
      >
        <Column 
          field="date" 
          header="Fecha" 
          body={(rowData) => new Date(rowData.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} 
          sortable
        />
        <Column 
          field="description" 
          header="Descripción" 
          sortable
        />
        <Column 
          field="category" 
          header="Categoría" 
          body={categoryBodyTemplate}
          sortable
        />
        <Column 
          field="amount" 
          header="Monto" 
          body={amountTemplate}
          sortable
        />
        <Column 
          body={actionTemplate}
          style={{ width: '100px' }}
        />
      </DataTable>

      <Dialog 
        visible={showForm} 
        onHide={() => setShowForm(false)}
        header="Nueva Transacción"
      >
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          initialData={selectedTransaction}
        />
      </Dialog>
    </div>
  )
} 