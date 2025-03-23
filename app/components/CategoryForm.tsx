'use client'

import { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import IconSelector from './IconSelector'

interface CategoryFormProps {
  onSubmit: (category: any) => void
  initialData?: any
}

export default function CategoryForm({ onSubmit, initialData }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    icon: initialData?.icon || 'pi pi-tag',
    type: initialData?.type || 'expense'
  })

  const typeOptions = [
    { label: 'Gasto', value: 'expense' },
    { label: 'Ingreso', value: 'income' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="name" className="font-medium">
          Nombre de la Categoría
        </label>
        <InputText
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Alimentación"
          required
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium">Icono</label>
        <div className="flex items-center space-x-2">
          <IconSelector
            selectedIcon={formData.icon}
            onSelect={(icon) => setFormData({ ...formData, icon })}
          />
          <span className="text-sm text-gray-500">
            Icono seleccionado: <i className={formData.icon}></i>
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="type" className="font-medium">
          Tipo
        </label>
        <Dropdown
          id="type"
          value={formData.type}
          options={typeOptions}
          onChange={(e) => setFormData({ ...formData, type: e.value })}
          placeholder="Selecciona un tipo"
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        label={initialData ? 'Actualizar Categoría' : 'Crear Categoría'}
        icon="pi pi-check"
        className="w-full"
      />
    </form>
  )
} 