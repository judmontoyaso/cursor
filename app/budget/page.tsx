"use client";

import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { ProgressBar } from 'primereact/progressbar'
import { Chart } from 'primereact/chart'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { TabView, TabPanel } from 'primereact/tabview'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: string
}

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  type: 'expense' | 'saving'
  categoryId: string
  category: Category
  period: 'monthly' | 'yearly'
  createdAt: string
  updatedAt: string
}

interface FormData {
  name: string
  amount: number
  type: 'expense' | 'saving'
  categoryId: string
  period: 'monthly' | 'yearly'
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [visible, setVisible] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const toast = useRef<Toast>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    amount: 0,
    type: 'expense',
    categoryId: '',
    period: 'monthly'
  })

  const typeOptions = [
    { label: 'Gasto', value: 'expense' },
    { label: 'Ahorro', value: 'saving' }
  ]

  const periodOptions = [
    { label: 'Mensual', value: 'monthly' },
    { label: 'Anual', value: 'yearly' }
  ]

  useEffect(() => {
    loadBudgets()
    loadCategories()
  }, [])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/budgets')
      if (!response.ok) throw new Error('Error al cargar los presupuestos')
      const data = await response.json()
      setBudgets(data)
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los presupuestos'
      })
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
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Error al cargar las categorías' 
      })
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Advertencia', 
        detail: 'Por favor complete todos los campos' 
      })
      return
    }

    try {
      const url = editingBudget ? `/api/budgets/${editingBudget.id}` : '/api/budgets'
      const method = editingBudget ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Error al guardar el presupuesto')
      
      await loadBudgets()
      setVisible(false)
      resetForm()
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Éxito', 
        detail: `Presupuesto ${editingBudget ? 'actualizado' : 'creado'} correctamente` 
      })
    } catch (error) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Error al guardar el presupuesto' 
      })
    }
  }

  const confirmDelete = (id: string) => {
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar este presupuesto?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No, cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(id)
    })
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Error al eliminar el presupuesto')
      
      await loadBudgets()
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Éxito', 
        detail: 'Presupuesto eliminado correctamente' 
      })
    } catch (error) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Error al eliminar el presupuesto' 
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      type: 'expense',
      categoryId: '',
      period: 'monthly'
    })
    setEditingBudget(null)
  }

  const progressBodyTemplate = (rowData: Budget) => {
    const percentage = (rowData.spent / rowData.amount) * 100
    const status = percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'success'
    
    return (
      <div className="w-full">
        <div className="flex justify-between mb-1">
          <span className="text-sm">${rowData.spent} / ${rowData.amount}</span>
          <span className="text-sm">{percentage.toFixed(1)}%</span>
        </div>
        <ProgressBar 
          value={percentage} 
          className={`h-2 ${status}`}
          showValue={false}
        />
      </div>
    )
  }

  const categoryBodyTemplate = (rowData: Budget) => (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
          style={{ 
            backgroundColor: `${rowData.category?.color}20`, 
            color: rowData.category?.color,
            border: `1px solid ${rowData.category?.color}`
          }}>
      <i className={`${rowData.category?.icon} text-sm`}></i>
      {rowData.category?.name}
    </span>
  )

  const handleEdit = (rowData: Budget) => {
    setEditingBudget(rowData);
    setFormData({
      name: rowData.name,
      amount: rowData.amount,
      type: rowData.type as 'expense' | 'saving',
      categoryId: rowData.categoryId,
      period: rowData.period as 'monthly' | 'yearly'
    });
    setVisible(true);
  };

  const actionBodyTemplate = (rowData: Budget) => (
    <div className="flex gap-2 justify-end">
      <Button 
        icon="pi pi-pencil" 
        rounded 
        text 
        onClick={() => handleEdit(rowData)}
      />
      <Button 
        icon="pi pi-trash" 
        rounded 
        text 
        severity="danger"
        onClick={() => confirmDelete(rowData.id)}
      />
    </div>
  )

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        <Button label="Nuevo Presupuesto" icon="pi pi-plus" onClick={() => setVisible(true)} />
      </div>

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        <TabPanel header="Gastos Mensuales">
          <DataTable 
            value={budgets.filter(b => b.type === 'expense' && b.period === 'monthly')} 
            className="shadow-sm"
            stripedRows
          >
            <Column field="name" header="Nombre" sortable />
            <Column field="category" header="Categoría" body={categoryBodyTemplate} sortable />
            <Column field="amount" header="Presupuestado" sortable body={(rowData) => `$${rowData.amount.toFixed(2)}`} />
            <Column header="Progreso" body={progressBodyTemplate} />
            <Column body={actionBodyTemplate} style={{ width: '100px' }} />
          </DataTable>
        </TabPanel>
        
        <TabPanel header="Ahorros">
          <DataTable 
            value={budgets.filter(b => b.type === 'saving')} 
            className="shadow-sm"
            stripedRows
          >
            <Column field="name" header="Nombre" sortable />
            <Column field="category" header="Categoría" body={categoryBodyTemplate} sortable />
            <Column field="amount" header="Meta" sortable body={(rowData) => `$${rowData.amount.toFixed(2)}`} />
            <Column header="Progreso" body={progressBodyTemplate} />
            <Column body={actionBodyTemplate} style={{ width: '100px' }} />
          </DataTable>
        </TabPanel>
      </TabView>

      <Dialog 
        visible={visible} 
        onHide={() => {
          setVisible(false)
          resetForm()
        }}
        header={editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        modal 
        className="p-fluid"
      >
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="field">
            <label className="font-medium mb-2 block">Tipo</label>
            <Dropdown
              value={formData.type}
              options={typeOptions}
              onChange={(e) => setFormData({ ...formData, type: e.value })}
              placeholder="Selecciona el tipo"
              className="w-full"
            />
          </div>

          <div className="field">
            <label className="font-medium mb-2 block">Nombre</label>
            <InputText
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Gastos de alimentación"
            />
          </div>

          <div className="field">
            <label className="font-medium mb-2 block">Categoría</label>
            <Dropdown
              value={formData.categoryId}
              options={categories}
              onChange={(e) => setFormData({ ...formData, categoryId: e.value })}
              optionLabel="name"
              optionValue="id"
              placeholder="Selecciona una categoría"
              filter
              itemTemplate={(option) => (
                <div className="flex items-center gap-2">
                  <i className={`${option.icon} text-sm`} style={{ color: option.color }}></i>
                  <span>{option.name}</span>
                </div>
              )}
            />
          </div>

          <div className="field">
            <label className="font-medium mb-2 block">
              {formData.type === 'expense' ? 'Monto Presupuestado' : 'Meta de Ahorro'}
            </label>
            <InputNumber
              value={formData.amount}
              onValueChange={(e) => setFormData({ ...formData, amount: e.value || 0 })}
              mode="currency"
              currency="USD"
              locale="es-ES"
            />
          </div>

          <div className="field">
            <label className="font-medium mb-2 block">Periodicidad</label>
            <Dropdown
              value={formData.period}
              options={periodOptions}
              onChange={(e) => setFormData({ ...formData, period: e.value })}
              placeholder="Selecciona la periodicidad"
              className="w-full"
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
            label={editingBudget ? 'Actualizar' : 'Guardar'} 
            icon="pi pi-check" 
            onClick={handleSubmit} 
          />
        </div>
      </Dialog>
    </div>
  )
}
