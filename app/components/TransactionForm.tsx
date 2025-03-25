'use client'

import { useState, useEffect } from 'react'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'

interface Category {
  id: string
  name: string
  color: string
  icon: string
  type: 'INGRESO' | 'GASTO'
}

interface TransactionFormData {
  description: string
  amount: number
  date: Date
  type: 'INGRESO' | 'GASTO'
  categoryId: string
}

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void
  onCancel: () => void
  initialData?: TransactionFormData
}

export default function TransactionForm({ onSubmit, onCancel, initialData }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<TransactionFormData>(initialData || {
    description: '',
    amount: 0,
    date: new Date(),
    type: 'GASTO',
    categoryId: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Error al obtener las categorías')
      }
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4 mb-4">
        <Button
          type="button"
          label="Gasto"
          icon="pi pi-arrow-down"
          severity={formData.type === 'GASTO' ? 'danger' : 'secondary'}
          outlined={formData.type !== 'GASTO'}
          onClick={() => setFormData({ ...formData, type: 'GASTO', categoryId: '' })}
          className="flex-1"
        />
        <Button
          type="button"
          label="Ingreso"
          icon="pi pi-arrow-up"
          severity={formData.type === 'INGRESO' ? 'success' : 'secondary'}
          outlined={formData.type !== 'INGRESO'}
          onClick={() => setFormData({ ...formData, type: 'INGRESO', categoryId: '' })}
          className="flex-1"
        />
      </div>

      <div className="field">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <InputText
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ej: Compra de supermercado"
          className="w-full"
          required
        />
      </div>

      <div className="field">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría
        </label>
        <Dropdown
          value={formData.categoryId}
          options={categories
            .filter(cat => cat.type === formData.type)
            .map(cat => ({ 
              label: cat.name, 
              value: cat.id,
              icon: cat.icon,
              color: cat.color
            }))}
          onChange={(e) => setFormData({ ...formData, categoryId: e.value })}
          placeholder="Selecciona una categoría"
          className="w-full"
          required
          itemTemplate={(option) => (
            <div className="flex items-center gap-2">
              <i className={option.icon} style={{ color: option.color }}></i>
              <span>{option.label}</span>
            </div>
          )}
        />
      </div>

      <div className="field">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monto
        </label>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha
        </label>
        <Calendar
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.value || new Date() })}
          showIcon
          dateFormat="dd/mm/yy"
          className="w-full"
          required
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          outlined
          onClick={onCancel}
        />
        <Button
          type="submit"
          label={initialData ? 'Actualizar' : 'Guardar'}
          icon="pi pi-check"
        />
      </div>
    </form>
  )
} 