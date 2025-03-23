'use client'

import { useEffect, useState } from 'react'
import { Card } from 'primereact/card'
import { Chart } from 'primereact/chart'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { TabView, TabPanel } from 'primereact/tabview'
import { formatCurrency } from '@/lib/utils'

interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
    category: {
        name: string;
    };
}

interface Budget {
    id: string;
    name: string;
    amount: number;
    type: 'income' | 'expense';
    category: {
        name: string;
    };
}

interface ReportData {
    totales: {
        income: number;
        expense: number;
    };
    gastosPorCategoria: Record<string, number>;
    ingresosPorCategoria: Record<string, number>;
    balanceMensual: Record<string, { income: number; expense: number }>;
    ultimasTransacciones: Transaction[];
    presupuestos: Budget[];
}

export default function ReportsPage() {
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/reports')
                if (!response.ok) {
                    throw new Error('Error al cargar los reportes')
                }
                const data = await response.json()
                setReportData(data)
            } catch (error) {
                console.error('Error fetching reports:', error)
                setError(error instanceof Error ? error.message : 'Error desconocido')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return <div className="p-4">Cargando reportes...</div>
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>
    }

    if (!reportData) {
        return <div className="p-4">No hay datos disponibles</div>
    }

    const gastosChartData = {
        labels: Object.keys(reportData.gastosPorCategoria),
        datasets: [{
            data: Object.values(reportData.gastosPorCategoria),
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40'
            ]
        }]
    }

    const ingresosChartData = {
        labels: Object.keys(reportData.ingresosPorCategoria),
        datasets: [{
            data: Object.values(reportData.ingresosPorCategoria),
            backgroundColor: [
                '#4BC0C0',
                '#36A2EB',
                '#FFCE56',
                '#FF6384',
                '#9966FF',
                '#FF9F40'
            ]
        }]
    }

    const balanceChartData = {
        labels: Object.keys(reportData.balanceMensual),
        datasets: [
            {
                label: 'Ingresos',
                data: Object.values(reportData.balanceMensual).map(m => m.income),
                backgroundColor: '#4BC0C0'
            },
            {
                label: 'Gastos',
                data: Object.values(reportData.balanceMensual).map(m => m.expense),
                backgroundColor: '#FF6384'
            }
        ]
    }

    // Datos para el gráfico de líneas superpuestas
    const lineChartData = {
        labels: Object.keys(reportData.balanceMensual),
        datasets: [
            {
                label: 'Ingresos',
                data: Object.values(reportData.balanceMensual).map(m => m.income),
                borderColor: '#4BC0C0',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#4BC0C0',
                pointBorderColor: '#4BC0C0'
            },
            {
                label: 'Gastos',
                data: Object.values(reportData.balanceMensual).map(m => m.expense),
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#FF6384',
                pointBorderColor: '#FF6384'
            }
        ]
    }

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: number) => formatCurrency(value)
                }
            }
        }
    }

    // Datos para el gráfico de gastos por mes
    const gastosMensualesData = {
        labels: Object.keys(reportData.balanceMensual),
        datasets: [{
            label: 'Gastos',
            data: Object.values(reportData.balanceMensual).map(m => m.expense),
            backgroundColor: '#FF6384'
        }]
    }

    // Datos para la comparación de presupuestos vs gastos
    const presupuestosVsGastosData = {
        labels: reportData.presupuestos.map(b => b.name),
        datasets: [
            {
                label: 'Presupuesto',
                data: reportData.presupuestos.map(b => b.amount),
                backgroundColor: '#4BC0C0'
            },
            {
                label: 'Gastos Reales',
                data: reportData.presupuestos.map(b => {
                    const gastosCategoria = reportData.gastosPorCategoria[b.category.name] || 0;
                    return gastosCategoria;
                }),
                backgroundColor: '#FF6384'
            }
        ]
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Reportes</h1>
            
            <TabView>
                {/* Pestaña de Resumen */}
                <TabPanel header="Resumen">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Card>
                            <h2 className="text-xl font-semibold mb-4">Resumen</h2>
                            <div className="space-y-2">
                                <p>Ingresos Totales: {formatCurrency(reportData.totales.income)}</p>
                                <p>Gastos Totales: {formatCurrency(reportData.totales.expense)}</p>
                                <p className="font-bold">
                                    Balance: {formatCurrency(reportData.totales.income - reportData.totales.expense)}
                                </p>
                            </div>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Evolución de Ingresos y Gastos</h2>
                        <div style={{ height: '400px' }}>
                            <Chart 
                                type="line" 
                                data={lineChartData} 
                                options={lineChartOptions}
                            />
                        </div>
                    </Card>
                </TabPanel>

                {/* Pestaña de Gastos */}
                <TabPanel header="Gastos">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Card>
                            <h2 className="text-xl font-semibold mb-4">Gastos por Categoría</h2>
                            <Chart type="pie" data={gastosChartData} />
                        </Card>
                        <Card>
                            <h2 className="text-xl font-semibold mb-4">Gastos Mensuales</h2>
                            <Chart type="bar" data={gastosMensualesData} />
                        </Card>
                    </div>
                </TabPanel>

                {/* Pestaña de Presupuestos */}
                <TabPanel header="Presupuestos">
                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Presupuestos vs Gastos Reales</h2>
                        <Chart type="bar" data={presupuestosVsGastosData} />
                    </Card>
                </TabPanel>

                {/* Pestaña de Transacciones */}
                <TabPanel header="Últimas Transacciones">
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Últimas Transacciones</h2>
                        <DataTable value={reportData.ultimasTransacciones} responsiveLayout="scroll">
                            <Column field="date" header="Fecha" />
                            <Column field="category.name" header="Categoría" />
                            <Column field="type" header="Tipo" />
                            <Column 
                                field="amount" 
                                header="Monto" 
                                body={(rowData) => formatCurrency(rowData.amount)}
                            />
                        </DataTable>
                    </Card>
                </TabPanel>
            </TabView>
        </div>
    )
} 