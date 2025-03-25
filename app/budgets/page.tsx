'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { formatCurrency } from '@/lib/utils'
import { InputNumber } from 'primereact/inputnumber'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Toast } from 'primereact/toast'

interface Category {
    id: string
    name: string
    type: string
}

interface Budget {
    id: string
    name: string
    amount: number
    type: string
    categoryId: string
    progress: number
    spent: number
    startDate: Date
    endDate?: Date
    date: string
    isMonthBudget: boolean
    category: {
        id: string
        name: string
        color: string
        icon: string
        type: 'expense' | 'income'
    }
}

export default function BudgetPage() {
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [showDialog, setShowDialog] = useState(false)
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
    const [newBudget, setNewBudget] = useState({
        name: '',
        amount: '',
        type: 'expense',
        categoryId: '',
        startDate: new Date(),
        endDate: null as Date | null
    })
    const toast = useRef<Toast>(null)

    useEffect(() => {
        fetchBudgets()
        fetchCategories()
    }, [])

    const fetchBudgets = async () => {
        try {
            const response = await fetch('/api/budgets')
            if (!response.ok) throw new Error('Error al cargar presupuestos')
            const data = await response.json()
            setBudgets(data)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories')
            if (!response.ok) throw new Error('Error al cargar categorías')
            const data = await response.json()
            setCategories(data)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const showToast = (severity: 'success' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingBudget 
                ? `/api/budgets/${editingBudget.id}`
                : '/api/budgets'
            
            const method = editingBudget ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newBudget,
                    amount: parseFloat(newBudget.amount),
                    startDate: newBudget.startDate.toISOString(),
                    endDate: newBudget.endDate ? newBudget.endDate.toISOString() : null
                }),
            })

            if (!response.ok) throw new Error('Error al guardar presupuesto')
            
            await fetchBudgets()
            handleCloseDialog()
            showToast(
                'success',
                'Éxito',
                editingBudget ? 'Presupuesto actualizado correctamente' : 'Presupuesto creado correctamente'
            )
        } catch (error) {
            console.error('Error:', error)
            showToast(
                'error',
                'Error',
                editingBudget ? 'Error al actualizar el presupuesto' : 'Error al crear el presupuesto'
            )
        }
    }

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget)
        setNewBudget({
            name: budget.name,
            amount: budget.amount.toString(),
            type: budget.type,
            categoryId: budget.categoryId,
            startDate: new Date(budget.startDate),
            endDate: budget.endDate ? new Date(budget.endDate) : null
        })
        setShowDialog(true)
    }

    const handleDelete = async (budget: Budget) => {
        confirmDialog({
            message: '¿Estás seguro de que deseas eliminar este presupuesto?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const response = await fetch(`/api/budgets/${budget.id}`, {
                        method: 'DELETE',
                    })

                    if (!response.ok) throw new Error('Error al eliminar presupuesto')
                    
                    await fetchBudgets()
                    showToast('success', 'Éxito', 'Presupuesto eliminado correctamente')
                } catch (error) {
                    console.error('Error:', error)
                    showToast('error', 'Error', 'Error al eliminar el presupuesto')
                }
            }
        })
    }

    const handleCloseDialog = () => {
        setShowDialog(false)
        setEditingBudget(null)
        setNewBudget({
            name: '',
            amount: '',
            type: 'expense',
            categoryId: '',
            startDate: new Date(),
            endDate: null
        })
    }

    const actionBodyTemplate = (rowData: Budget) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="info"
                    onClick={() => handleEdit(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    onClick={() => handleDelete(rowData)}
                />
            </div>
        )
    }

    const progressBodyTemplate = (rowData: Budget) => {
        const progress = (rowData.spent / rowData.amount) * 100;
        return (
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: progress > 100 ? '#ef4444' : '#22c55e'
                        }}
                    />
                </div>
                <span className="text-sm font-medium">
                    {progress.toFixed(1)}%
                </span>
            </div>
        );
    }

    const dateBodyTemplate = (rowData: Budget) => {
        if (rowData.endDate) {
            return `${new Date(rowData.startDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })} - ${new Date(rowData.endDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })}`;
        }
        return new Date(rowData.startDate).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    const categoryBodyTemplate = (rowData: Budget) => (
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Presupuestos</h1>
                <Button 
                    label="Nuevo Presupuesto" 
                    icon="pi pi-plus" 
                    onClick={() => setShowDialog(true)}
                />
            </div>

            <Card>
                <DataTable value={budgets} responsiveLayout="scroll">
                    <Column field="name" header="Nombre" sortable />
                    <Column 
                        field="category.name" 
                        header="Categoría" 
                        body={categoryBodyTemplate}
                    />
                    <Column 
                        field="amount" 
                        header="Monto" 
                        body={(rowData) => formatCurrency(rowData.amount)}
                        sortable
                    />
                    <Column 
                        field="spent" 
                        header="Gastado" 
                        body={(rowData) => formatCurrency(rowData.spent)}
                        sortable
                    />
                    <Column 
                        field="progress" 
                        header="Progreso" 
                        body={progressBodyTemplate}
                        sortable
                    />
                    <Column 
                        field="startDate" 
                        header="Período" 
                        body={dateBodyTemplate}
                        sortable
                    />
                    <Column body={actionBodyTemplate} header="Acciones" />
                </DataTable>
            </Card>

            <Dialog 
                visible={showDialog} 
                onHide={handleCloseDialog}
                header={editingBudget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
                className="w-full max-w-md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2">Nombre</label>
                        <InputText
                            value={newBudget.name}
                            onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                            className="w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Monto</label>
                        <InputNumber
                            value={newBudget.amount ? parseFloat(newBudget.amount) : null}
                            onValueChange={(e) => setNewBudget({ ...newBudget, amount: e.value?.toString() || '' })}
                            mode="currency"
                            currency="COP"
                            locale="es-CO"
                            minFractionDigits={0}
                            maxFractionDigits={0}
                            className="w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Tipo</label>
                        <Dropdown
                            value={newBudget.type}
                            onChange={(e) => setNewBudget({ ...newBudget, type: e.value })}
                            options={[
                                { label: 'Gasto', value: 'expense' },
                                { label: 'Ingreso', value: 'income' }
                            ]}
                            className="w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Categoría</label>
                        <Dropdown
                            value={newBudget.categoryId}
                            onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.value })}
                            options={categories
                                .filter(cat => cat.type === newBudget.type)
                                .map(cat => ({ label: cat.name, value: cat.id }))}
                            className="w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Fecha Inicio</label>
                        <Calendar
                            value={newBudget.startDate}
                            onChange={(e) => setNewBudget({ ...newBudget, startDate: e.value as Date })}
                            dateFormat="dd/mm/yy"
                            className="w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Fecha Fin (Opcional)</label>
                        <Calendar
                            value={newBudget.endDate}
                            onChange={(e) => setNewBudget({ ...newBudget, endDate: e.value as Date })}
                            dateFormat="dd/mm/yy"
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button 
                            label="Cancelar" 
                            icon="pi pi-times" 
                            onClick={handleCloseDialog}
                            className="p-button-text"
                        />
                        <Button 
                            label={editingBudget ? "Actualizar" : "Guardar"} 
                            icon="pi pi-check" 
                            type="submit"
                        />
                    </div>
                </form>
            </Dialog>

            <ConfirmDialog />
        </div>
    )
} 