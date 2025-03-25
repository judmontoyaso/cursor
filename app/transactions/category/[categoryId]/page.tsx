'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from 'primereact/card'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { formatCurrency } from '@/lib/utils'

interface Transaction {
    id: string
    description: string
    amount: number
    date: string
    type: 'expense' | 'income'
    category: {
        name: string
        color: string
        icon: string
    }
}

export default function CategoryTransactionsPage() {
    const params = useParams()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [category, setCategory] = useState<{ name: string; color: string; icon: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [transactionsRes, categoryRes] = await Promise.all([
                    fetch(`/api/transactions/category/${params.categoryId}`),
                    fetch(`/api/categories/${params.categoryId}`)
                ])

                if (!transactionsRes.ok || !categoryRes.ok) {
                    throw new Error('Error al cargar los datos')
                }

                const [transactionsData, categoryData] = await Promise.all([
                    transactionsRes.json(),
                    categoryRes.json()
                ])

                setTransactions(transactionsData)
                setCategory(categoryData)
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [params.categoryId])

    if (loading) {
        return <div className="p-4">Cargando...</div>
    }

    if (!category) {
        return <div className="p-4">Categoría no encontrada</div>
    }

    const amountBodyTemplate = (rowData: Transaction) => (
        <span className={`font-semibold ${rowData.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
            {rowData.type === 'expense' ? '-' : '+'}{formatCurrency(Math.abs(rowData.amount))}
        </span>
    )

    return (
        <div className="p-4">
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <i className={`${category.icon} text-2xl`} style={{ color: category.color }}></i>
                    <h1 className="text-2xl font-bold">Transacciones de {category.name}</h1>
                </div>

                <DataTable value={transactions} responsiveLayout="scroll">
                    <Column 
                        field="date" 
                        header="Fecha" 
                        body={(rowData) => new Date(rowData.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    />
                    <Column field="description" header="Descripción" />
                    <Column 
                        field="amount" 
                        header="Monto" 
                        body={amountBodyTemplate}
                    />
                </DataTable>
            </Card>
        </div>
    )
} 