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

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: 'expense' | 'income'
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
  const [visible, setVisible] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    date: new Date(),
    type: 'expense',
    categoryId: ''
  })
  const toast = useRef<Toast>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    loadTransactions()
    loadCategories()
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (!response.ok) throw new Error('Error al cargar las transacciones')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar las transacciones' })
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      date: new Date(transaction.date),
      type: transaction.type,
      categoryId: transaction.category.id
    })
    setVisible(true)
  }

  const handleSubmit = async () => {
    if (!formData.description || !formData.categoryId) {
      toast.current?.show({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor complete todos los campos' })
      return
    }

    try {
      const url = `/api/transactions${editingTransaction ? `/${editingTransaction.id}` : ''}`
      const method = editingTransaction ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error(`Error al ${editingTransaction ? 'actualizar' : 'crear'} la transacción`)
      
      await loadTransactions()
      setVisible(false)
      resetForm()
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Éxito', 
        detail: `Transacción ${editingTransaction ? 'actualizada' : 'creada'} correctamente` 
      })
    } catch (error) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: `Error al ${editingTransaction ? 'actualizar' : 'crear'} la transacción` 
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Error al eliminar la transacción')
      
      await loadTransactions()
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Transacción eliminada' })
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al eliminar la transacción' })
    }
  }

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      date: new Date(),
      type: 'expense',
      categoryId: ''
    })
    setEditingTransaction(null)
  }

  const confirmDelete = (id: string) => {
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar esta transacción?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No, cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(id),
    })
  }

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

  const amountBodyTemplate = (rowData: Transaction) => (
    <span className={`font-semibold ${rowData.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
      {rowData.type === 'expense' ? '-' : '+'}{formatCurrency(Math.abs(rowData.amount))}
    </span>
  )

  const actionBodyTemplate = (rowData: Transaction) => (
    <div className="flex gap-2 justify-end">
      <Button 
        icon="pi pi-pencil" 
        rounded 
        text 
        className="p-button-sm"
        onClick={() => handleEdit(rowData)}
      />
      <Button 
        icon="pi pi-trash" 
        rounded 
        text 
        severity="danger"
        className="p-button-sm"
        onClick={() => confirmDelete(rowData.id)}
      />
    </div>
  )

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <Button label="Nueva Transacción" icon="pi pi-plus" onClick={() => setVisible(true)} />
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
          body={amountBodyTemplate}
          sortable
        />
        <Column 
          body={actionBodyTemplate}
          style={{ width: '100px' }}
        />
      </DataTable>

      <Dialog 
        visible={visible} 
        onHide={() => {
          setVisible(false)
          resetForm()
        }}
        header={editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
        modal 
        className="p-fluid"
      >
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="field">
            <label className="font-medium mb-2 block">Tipo</label>
            <div className="flex gap-2">
              <Button 
                label="Gasto" 
                icon="pi pi-arrow-down" 
                severity={formData.type === 'expense' ? 'danger' : 'secondary'}
                outlined={formData.type !== 'expense'}
                onClick={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
              />
              <Button 
                label="Ingreso" 
                icon="pi pi-arrow-up" 
                severity={formData.type === 'income' ? 'success' : 'secondary'}
                outlined={formData.type !== 'income'}
                onClick={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
              />
            </div>
          </div>

          <div className="field">
            <label className="font-medium mb-2 block">Descripción</label>
            <InputText
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej: Compra de supermercado"
            />
          </div>

          <div className="field">
            <label className="font-medium mb-2 block">Categoría</label>
            <Dropdown
              value={formData.categoryId}
              options={categories.filter(cat => cat.type === formData.type)}
              onChange={(e) => setFormData({ ...formData, categoryId: e.value })}
              optionLabel="name"
              optionValue="id"
              placeholder="Selecciona una categoría"
              itemTemplate={(option) => (
                <div className="flex items-center gap-2">
                  <i className={`${option.icon} text-sm`} style={{ color: option.color }}></i>
                  <span>{option.name}</span>
                </div>
              )}
            />
          </div>

          <div className="field">
            <label className="font-medium mb-2 block">Monto</label>
            <InputNumber
              value={formData.amount}
              onValueChange={(e) => setFormData({ ...formData, amount: e.value || 0 })}
              mode="currency"
              currency="COP"
              locale="es-CO"
              minFractionDigits={0}
              maxFractionDigits={0}
              className="w-full"
              required
            />
          </div>

          <div className="field">
            <label className="font-medium mb-2 block">Fecha</label>
            <Calendar
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.value || new Date() })}
              showIcon
              dateFormat="dd/mm/yy"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            outlined 
            onClick={() => {
              setVisible(false)
              resetForm()
            }} 
          />
          <Button 
            label={editingTransaction ? 'Actualizar' : 'Guardar'} 
            icon="pi pi-check" 
            onClick={handleSubmit} 
          />
        </div>
      </Dialog>
    </div>
  )
} 