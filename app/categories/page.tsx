'use client'

import { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { ColorPicker } from 'primereact/colorpicker'
import { Toast } from 'primereact/toast'
import { Dropdown } from 'primereact/dropdown'
import { useRef } from 'react'
import IconSelector from '../components/IconSelector'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'

interface Category {
  id: string
  name: string
  color: string
  icon: string
  type: string // 'income' o 'expense'
}

// Lista de íconos disponibles
const iconOptions = [
  { label: 'Casa', value: 'pi pi-home' },
  { label: 'Dinero', value: 'pi pi-money-bill' },
  { label: 'Trabajo', value: 'pi pi-briefcase' },
  { label: 'Comida', value: 'pi pi-utensils' },
  { label: 'Transporte', value: 'pi pi-car' },
  // Agrega más íconos según sea necesario
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const toast = useRef<Toast>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [transactions, setTransactions] = useState([])
  const [showTransactions, setShowTransactions] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    icon: 'pi pi-tag',
    type: 'expense'
  })

  const typeOptions = [
    { label: 'Gasto', value: 'expense' },
    { label: 'Ingreso', value: 'income' }
  ]

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Error al cargar las categorías')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar las categorías' })
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/transactions/category/${categoryId}`)
      if (!response.ok) throw new Error('Error al cargar las transacciones')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Error al cargar las transacciones de la categoría' 
      })
    }
  }

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear la categoría');
      }

      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      setVisible(false);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }

      setCategories(categories.filter(cat => cat.id !== categoryId));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = async (data: CategoryFormData) => {
    try {
      const response = await fetch(`/api/categories/${selectedCategory?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la categoría');
      }

      const updatedCategory = await response.json();
      setCategories(categories.map(cat => 
        cat.id === selectedCategory?.id ? updatedCategory : cat
      ));
      setSelectedCategory(null);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const confirmDelete = (id: string) => {
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar esta categoría? Si tiene transacciones asociadas, no podrá ser eliminada.',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No, cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(id),
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#000000',
      icon: 'pi pi-tag',
      type: 'expense'
    })
    setEditingCategory(null)
  }

  const openNew = () => {
    resetForm()
    setVisible(true)
  }

  const editCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type
    })
    setVisible(true)
  }

  const CategoryCard = ({ category }: { category: Category }) => (
    <div 
      onClick={() => {
        setSelectedCategory(category)
        loadTransactions(category.id)
        setShowTransactions(true)
      }}
      className="w-1/3 p-4 mb-4 rounded-lg shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all duration-200 bg-white group"
      style={{ borderLeft: `4px solid ${category.color}` }}
    >
      <i className={`${category.icon} text-2xl`} style={{ color: category.color }}></i>
      <span className="font-medium flex-grow">{category.name}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          icon="pi pi-pencil" 
          className="p-button-rounded p-button-text p-button-sm !p-2" 
          onClick={(e) => {
            e.stopPropagation()
            editCategory(category)
          }} 
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-rounded p-button-text p-button-danger p-button-sm !p-2" 
          onClick={(e) => {
            e.stopPropagation()
            confirmDelete(category.id)
          }} 
        />
      </div>
    </div>
  )

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button label="Nueva Categoría" icon="pi pi-plus" onClick={openNew} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Categorías de Gastos</h2>
          <div className="flex flex-col space-y-4">
            {loading ? (
              <p>Cargando...</p>
            ) : (
              categories
                .filter(category => category.type === 'expense')
                .map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Categorías de Ingresos</h2>
          <div className="flex flex-col space-y-4">
            {loading ? (
              <p>Cargando...</p>
            ) : (
              categories
                .filter(category => category.type === 'income')
                .map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))
            )}
          </div>
        </div>
      </div>

      <Dialog 
        visible={visible} 
        onHide={() => setVisible(false)}
        header={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        modal 
        className="p-fluid"
      >
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="field">
            <label htmlFor="name" className="font-medium mb-2 block">Nombre</label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
              placeholder="Ej: Alimentación"
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <div>
              <IconSelector
                selectedIcon={formData.icon}
                onSelect={(icon) => setFormData({ ...formData, icon })}
              />
            </div>
            <div>
              <ColorPicker
                value={formData.color.replace('#', '')}
                onChange={(e) => setFormData({ ...formData, color: '#' + e.value })}
                className="w-12 h-12"
              />
            </div>
          </div>

          <div className="field">
            <Dropdown
              value={formData.type}
              options={typeOptions}
              onChange={(e) => setFormData({ ...formData, type: e.value })}
              placeholder="Selecciona el tipo"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setVisible(false)} />
          <Button label="Guardar" icon="pi pi-check" onClick={() => handleSubmit(formData)} />
        </div>
      </Dialog>

      <Dialog
        visible={showTransactions}
        onHide={() => setShowTransactions(false)}
        header={
          <div className="flex items-center gap-2">
            <i className={`${selectedCategory?.icon} text-xl`} style={{ color: selectedCategory?.color }}></i>
            <span>Transacciones - {selectedCategory?.name}</span>
          </div>
        }
        modal
        style={{ width: '80vw' }}
      >
        <DataTable 
          value={transactions} 
          paginator 
          rows={10} 
          className="mt-4"
          emptyMessage="No hay transacciones para esta categoría"
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
            field="categoryName" 
            header="Categoría" 
            body={(rowData) => (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                    style={{ 
                      backgroundColor: `${rowData.categoryColor}20`, 
                      color: rowData.categoryColor,
                      border: `1px solid ${rowData.categoryColor}`
                    }}>
                <i className={`${rowData.categoryIcon} text-sm`}></i>
                {rowData.categoryName}
              </span>
            )}
            sortable
          />
          <Column 
            field="amount" 
            header="Monto" 
            sortable
            body={(rowData) => (
              <span className={`font-semibold ${rowData.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(rowData.amount).toFixed(2)}
              </span>
            )} 
          />
        </DataTable>
      </Dialog>
    </div>
  )
} 