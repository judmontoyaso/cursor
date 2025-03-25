'use client'

import { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { ColorPicker } from 'primereact/colorpicker'
import IconSelector from './IconSelector'

interface CategoryFormData {
  name: string
  type: 'INGRESO' | 'GASTO'
  color: string
  icon: string
}

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void
  initialData?: CategoryFormData
}

export default function CategoryForm({ onSubmit, initialData }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(initialData || {
    name: '',
    type: 'GASTO',
    color: '#000000',
    icon: 'pi pi-wallet'
  })

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
        <label htmlFor="type" className="font-medium">
          Tipo
        </label>
        <Dropdown
          id="type"
          value={formData.type}
          options={[
            { label: 'Gasto', value: 'GASTO' },
            { label: 'Ingreso', value: 'INGRESO' }
          ]}
          onChange={(e) => setFormData({ ...formData, type: e.value })}
          placeholder="Selecciona un tipo"
          className="w-full"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="color" className="font-medium">
          Color
        </label>
        <div>
          <ColorPicker
            value={formData.color}
            onChange={(e) => {
              const colorValue = typeof e.value === 'string' 
                ? e.value 
                : `#${e.value.r.toString(16).padStart(2, '0')}${e.value.g.toString(16).padStart(2, '0')}${e.value.b.toString(16).padStart(2, '0')}`;
              setFormData({ ...formData, color: colorValue });
            }}
          />
        </div>
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

      <Button
        type="submit"
        label={initialData ? 'Actualizar Categoría' : 'Crear Categoría'}
        icon="pi pi-check"
        className="w-full"
      />
    </form>
  )
} 