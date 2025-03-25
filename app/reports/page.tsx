'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { Card } from 'primereact/card'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { TabView, TabPanel } from 'primereact/tabview'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { OverlayPanel } from 'primereact/overlaypanel'
import { formatCurrency } from '@/lib/utils'
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, Cell 
} from 'recharts'
import { ProgressBar } from 'primereact/progressbar'
import { Chart } from 'primereact/chart'

interface Transaction {
    id: string;
    amount: number;
    date: string;
    type: 'INGRESO' | 'GASTO';
    categoryId: string;
    category: {
        name: string;
        color: string;
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
    periodStart: string;
    periodEnd: string | null;
    spent: number;
    progress: number;
}

interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
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

interface BalanceData {
    mes: string;
    ingresos: number;
    gastos: number;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }[];
}

const getDateRangeWithHours = (start: Date, end: Date): [Date, Date] => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return [startDate, endDate];
};

const getMonthRange = (date: Date): [Date, Date] => {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return [startDate, endDate];
};

export default function ReportsPage() {
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    })
    const [showFilters, setShowFilters] = useState(false)
    const [appliedFilters, setAppliedFilters] = useState({
        category: null as string | null,
        startDate: null as Date | null,
        endDate: null as Date | null,
        selectedMonth: new Date()
    })
    const op = useRef<OverlayPanel>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [chartData, setChartData] = useState<ChartData>({
        labels: [],
        datasets: []
    })

    const calculateTotals = (transactions: Transaction[]) => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'INGRESO') {
                acc.income += t.amount;
            } else {
                acc.expense += Math.abs(t.amount);
            }
            return acc;
        }, { income: 0, expense: 0 });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reportsRes, categoriesRes] = await Promise.all([
                    fetch('/api/reports'),
                    fetch('/api/categories')
                ])

                if (!reportsRes.ok || !categoriesRes.ok) {
                    throw new Error('Error al cargar los datos')
                }

                const [reportsData, categoriesData] = await Promise.all([
                    reportsRes.json(),
                    categoriesRes.json()
                ])

                setReportData(reportsData)
                setCategories(categoriesData)
                fetchTransactions()
            } catch (error) {
                console.error('Error fetching data:', error)
                setError(error instanceof Error ? error.message : 'Error desconocido')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const fetchTransactions = async () => {
        try {
            const response = await fetch('/api/transactions');
            if (!response.ok) {
                throw new Error('Error al obtener las transacciones');
            }
            const data = await response.json();
            setTransactions(data);
            updateChartData(data);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const updateChartData = (transactions: Transaction[]) => {
        const categoryTotals = transactions.reduce((acc, transaction) => {
            const { category, amount, type } = transaction;
            if (!acc[category.name]) {
                acc[category.name] = {
                    total: 0,
                    color: category.color
                };
            }
            acc[category.name].total += type === 'GASTO' ? Math.abs(amount) : amount;
            return acc;
        }, {} as Record<string, { total: number; color: string }>);

        setChartData({
            labels: Object.keys(categoryTotals),
            datasets: [{
                label: 'Total por Categoría',
                data: Object.values(categoryTotals).map(v => v.total),
                backgroundColor: Object.values(categoryTotals).map(v => v.color),
                borderColor: Object.values(categoryTotals).map(v => v.color),
                borderWidth: 1
            }]
        });
    };

    const filteredData = useMemo(() => {
        if (!reportData) return null;

        const filterTransactions = (transactions: Transaction[]) => {
            return transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                const matchesCategory = !appliedFilters.category || transaction.category.id === appliedFilters.category;
                let matchesDateRange = true;

                if (appliedFilters.startDate && appliedFilters.endDate) {
                    const [start, end] = getDateRangeWithHours(appliedFilters.startDate, appliedFilters.endDate);
                    matchesDateRange = transactionDate >= start && transactionDate <= end;
                } else if (appliedFilters.selectedMonth) {
                    const [start, end] = getMonthRange(appliedFilters.selectedMonth);
                    matchesDateRange = transactionDate >= start && transactionDate <= end;
                }

                return matchesCategory && matchesDateRange;
            });
        };

        const filteredTransactions = filterTransactions(reportData.ultimasTransacciones);
        const filteredTotals = calculateTotals(filteredTransactions);

        // Calcular gastos por categoría
        const gastosPorCategoria = filteredTransactions
            .filter(t => t.type === 'GASTO')
            .reduce((acc, t) => {
                acc[t.category.name] = (acc[t.category.name] || 0) + Math.abs(t.amount);
                return acc;
            }, {} as Record<string, number>);

        // Calcular ingresos por categoría
        const ingresosPorCategoria = filteredTransactions
            .filter(t => t.type === 'INGRESO')
            .reduce((acc, t) => {
                acc[t.category.name] = (acc[t.category.name] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        // Filtrar y ordenar balance mensual
        const filteredBalanceMensual = Object.entries(reportData.balanceMensual)
            .filter(([date]) => {
                const balanceDate = new Date(date);
                if (appliedFilters.startDate && appliedFilters.endDate) {
                    const [start, end] = getDateRangeWithHours(appliedFilters.startDate, appliedFilters.endDate);
                    return balanceDate >= start && balanceDate <= end;
                } else if (appliedFilters.selectedMonth) {
                    const [start, end] = getMonthRange(appliedFilters.selectedMonth);
                    return balanceDate >= start && balanceDate <= end;
                }
                return true;
            })
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .reduce((acc, [date, data]) => {
                acc[date] = data;
                return acc;
            }, {} as Record<string, { income: number; expense: number }>);

        return {
            ...reportData,
            totales: filteredTotals,
            gastosPorCategoria,
            ingresosPorCategoria,
            balanceMensual: filteredBalanceMensual,
            ultimasTransacciones: filteredTransactions
        };
    }, [reportData, appliedFilters]);

    const balanceData = useMemo(() => {
        if (!reportData?.balanceMensual) return [];
        
        return Object.entries(reportData.balanceMensual)
            .map(([mes, data]) => ({
                mes,
                ingresos: data.income || 0,
                gastos: data.expense || 0
            }))
            .sort((a, b) => {
                const [mesA, yearA] = a.mes.split(' ');
                const [mesB, yearB] = b.mes.split(' ');
                const dateA = new Date(parseInt(yearA), new Date(Date.parse(mesA + ' 1 ' + yearA)).getMonth());
                const dateB = new Date(parseInt(yearB), new Date(Date.parse(mesB + ' 1 ' + yearB)).getMonth());
                return dateA.getTime() - dateB.getTime();
            });
    }, [reportData]);

    const gastosMensualesData = useMemo(() => {
        if (!filteredData?.ultimasTransacciones) return [];

        // Agrupar transacciones por mes y calcular gastos
        const gastosPorMes = filteredData.ultimasTransacciones
            .filter(t => t.type === 'GASTO')
            .reduce((acc, transaction) => {
                const fecha = new Date(transaction.date);
                const mes = fecha.toLocaleDateString('es-ES', { 
                    month: 'long',
                    year: 'numeric'
                });

                if (!acc[mes]) {
                    acc[mes] = {
                        mes,
                        gastos: 0,
                        fecha: fecha // Guardamos la fecha para ordenar correctamente
                    };
                }
                acc[mes].gastos += Math.abs(transaction.amount);
                return acc;
            }, {} as Record<string, { mes: string; gastos: number; fecha: Date }>);

        // Convertir a array y ordenar por fecha
        return Object.values(gastosPorMes)
            .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    }, [filteredData]);

    if (loading) {
        return <div className="p-4">Cargando reportes...</div>
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>
    }

    if (!filteredData) {
        return <div className="p-4">No hay datos disponibles</div>
    }

    const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    const gastosChartData = Object.entries(filteredData.gastosPorCategoria).map(([name, value]) => ({
        name,
        value
    }));

    const ingresosChartData = Object.entries(filteredData.ingresosPorCategoria).map(([name, value]) => ({
        name,
        value
    }));

    const presupuestosVsGastosData = filteredData.presupuestos.map(b => ({
        name: `${b.name} (${new Date(b.periodStart).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })})`,
        presupuesto: b.amount,
        gastos: b.spent
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-semibold">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const totalIngresos = filteredData.totales.income
    const totalGastos = filteredData.totales.expense

    const calculateCategoryTotals = (transactions: Transaction[]) => {
        const categoryTotals = transactions.reduce((acc, transaction) => {
            const categoryId = transaction.category.id;
            if (!acc[categoryId]) {
                acc[categoryId] = {
                    name: transaction.category.name,
                    icon: transaction.category.icon,
                    color: transaction.category.color,
                    total: 0
                };
            }
            acc[categoryId].total += transaction.type === 'GASTO' ? Math.abs(transaction.amount) : transaction.amount;
            return acc;
        }, {} as Record<string, { name: string; icon: string; color: string; total: number }>);

        return Object.values(categoryTotals).sort((a, b) => b.total - a.total);
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: (context: any) => {
                        return `${context.dataset.label}: ${formatCurrency(context.raw)}`
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: number) => formatCurrency(value),
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            }
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Reportes</h1>
                <div className="flex gap-2">
                    <Button 
                        icon="pi pi-filter" 
                        onClick={(e) => op.current?.toggle(e)}
                        className="p-button-outlined"
                    />
                </div>
            </div>

            <OverlayPanel ref={op} className="w-80">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mes
                        </label>
                        <Calendar
                            value={selectedMonth}
                            onChange={(e) => {
                                if (e.value) {
                                    const date = new Date(e.value);
                                    setSelectedMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                                    setStartDate(null);
                                    setEndDate(null);
                                }
                            }}
                            view="month"
                            dateFormat="mm/yy"
                            className="w-full"
                            showIcon
                            maxDate={new Date()}
                            showButtonBar
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rango Personalizado
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Desde</label>
                                <Calendar
                                    value={startDate}
                                    onChange={(e) => {
                                        if (e.value) {
                                            const date = new Date(e.value);
                                            date.setHours(0, 0, 0, 0);
                                            setStartDate(date);
                                        } else {
                                            setStartDate(null);
                                        }
                                    }}
                                    dateFormat="dd/mm/yy"
                                    className="w-full"
                                    showIcon
                                    maxDate={endDate || new Date()}
                                    showButtonBar
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                                <Calendar
                                    value={endDate}
                                    onChange={(e) => {
                                        if (e.value) {
                                            const date = new Date(e.value);
                                            date.setHours(23, 59, 59, 999);
                                            setEndDate(date);
                                        } else {
                                            setEndDate(null);
                                        }
                                    }}
                                    dateFormat="dd/mm/yy"
                                    className="w-full"
                                    showIcon
                                    minDate={startDate || undefined}
                                    maxDate={new Date()}
                                    showButtonBar
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoría
                        </label>
                        <Dropdown
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.value)}
                            options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                            placeholder="Todas las categorías"
                            className="w-full"
                            showClear
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button 
                            label="Aplicar Filtros" 
                            icon="pi pi-check" 
                            onClick={() => {
                                setAppliedFilters({
                                    category: selectedCategory,
                                    startDate,
                                    endDate,
                                    selectedMonth
                                });
                                op.current?.hide();
                            }}
                            className="flex-1"
                        />
                        <Button 
                            label="Limpiar" 
                            icon="pi pi-times" 
                            onClick={() => {
                                setSelectedCategory(null);
                                setStartDate(null);
                                setEndDate(null);
                                setSelectedMonth(new Date());
                                setAppliedFilters({
                                    category: null,
                                    startDate: null,
                                    endDate: null,
                                    selectedMonth: new Date()
                                });
                            }}
                            className="p-button-outlined"
                        />
                    </div>
                </div>
            </OverlayPanel>
            
            <TabView>
                {/* Pestaña de Resumen */}
                <TabPanel header="Resumen">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-700">Ingresos Totales</h2>
                                <i className="pi pi-arrow-up text-green-500 text-xl" />
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(filteredData.totales.income)}
                            </p>
                        </Card>

                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-700">Gastos Totales</h2>
                                <i className="pi pi-arrow-down text-red-500 text-xl" />
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(filteredData.totales.expense)}
                            </p>
                        </Card>

                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-700">Balance</h2>
                                <i className="pi pi-wallet text-blue-500 text-xl" />
                            </div>
                            <p className={`text-2xl font-bold ${filteredData.totales.income - filteredData.totales.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(filteredData.totales.income - filteredData.totales.expense)}
                            </p>
                        </Card>
                    </div>

                    <Card className="mb-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Tendencia de Ingresos y Gastos</h2>
                        <div className="h-[400px]">
                            {balanceData && balanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={balanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="mes" 
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                            interval={0}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => formatCurrency(value)}
                                            tick={{ fontSize: 12 }}
                                            width={120}
                                        />
                                        <Tooltip 
                                            formatter={(value: number) => formatCurrency(value)}
                                            labelFormatter={(label) => label}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="ingresos" 
                                            name="Ingresos"
                                            stroke="#4CAF50" 
                                            strokeWidth={2.5}
                                            dot={{ r: 4, strokeWidth: 2 }}
                                            activeDot={{ r: 6, strokeWidth: 2 }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="gastos" 
                                            name="Gastos"
                                            stroke="#F44336" 
                                            strokeWidth={2.5}
                                            dot={{ r: 4, strokeWidth: 2 }}
                                            activeDot={{ r: 6, strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No hay datos disponibles para mostrar</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </TabPanel>

                {/* Pestaña de Gastos */}
                <TabPanel header="Gastos">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Card className="shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Gastos por Categoría</h2>
                            <div className="h-[400px]">
                                {gastosChartData && gastosChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={gastosChartData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={150}
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                labelLine={true}
                                            >
                                                {gastosChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value: number) => formatCurrency(value)}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">No hay datos de gastos disponibles</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                        <Card className="shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Gastos Mensuales</h2>
                            <div className="h-[400px]">
                                {gastosMensualesData && gastosMensualesData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={gastosMensualesData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis 
                                                dataKey="mes" 
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                                interval={0}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis 
                                                tickFormatter={(value) => formatCurrency(value)}
                                                tick={{ fontSize: 12 }}
                                                width={120}
                                            />
                                            <Tooltip 
                                                formatter={(value: number) => formatCurrency(value)}
                                                labelFormatter={(label) => label}
                                            />
                                            <Bar 
                                                dataKey="gastos" 
                                                name="Gastos"
                                                fill="#FF6384"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">No hay datos de gastos disponibles</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </TabPanel>

                {/* Pestaña de Presupuestos */}
                <TabPanel header="Presupuestos">
                    <Card className="mb-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Presupuestos vs Gastos Reales</h2>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={presupuestosVsGastosData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis 
                                        tickFormatter={(value) => formatCurrency(value)}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="presupuesto" fill="#4BC0C0" />
                                    <Bar dataKey="gastos" fill="#FF6384" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    
                    <Card className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Presupuestos</h3>
                        <DataTable value={filteredData.presupuestos} className="w-full">
                            <Column field="name" header="Nombre" />
                            <Column field="category.name" header="Categoría" />
                            <Column 
                                field="startDate" 
                                header="Fecha Inicio" 
                                body={(rowData) => new Date(rowData.startDate).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            />
                            <Column 
                                field="endDate" 
                                header="Fecha Fin" 
                                body={(rowData) => rowData.endDate ? new Date(rowData.endDate).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Sin fecha fin'}
                            />
                            <Column field="amount" header="Presupuesto" body={(rowData) => formatCurrency(rowData.amount)} />
                            <Column field="spent" header="Gastado" body={(rowData) => formatCurrency(rowData.spent)} />
                            <Column 
                                field="progress" 
                                header="Progreso" 
                                body={(rowData) => (
                                    <div className="flex items-center gap-2">
                                        <ProgressBar 
                                            value={rowData.progress} 
                                            showValue={false}
                                            className="w-24"
                                            color={rowData.progress > 100 ? 'red' : 'blue'}
                                        />
                                        <span>{Math.round(rowData.progress)}%</span>
                                    </div>
                                )}
                            />
                        </DataTable>
                    </Card>
                </TabPanel>

                {/* Pestaña de Transacciones */}
                <TabPanel header="Últimas Transacciones">
                    <Card className="shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Últimas Transacciones</h2>
                        <DataTable 
                            value={filteredData.ultimasTransacciones} 
                            responsiveLayout="scroll"
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
                            />
                            <Column 
                                field="category.name" 
                                header="Categoría" 
                                body={(rowData) => (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                                          style={{ 
                                            backgroundColor: `${rowData.category.color}20`, 
                                            color: rowData.category.color,
                                            border: `1px solid ${rowData.category.color}`
                                          }}>
                                        <i className={`${rowData.category.icon} text-sm`}></i>
                                        {rowData.category.name}
                                    </span>
                                )}
                            />
                            <Column 
                                field="type" 
                                header="Tipo" 
                                body={(rowData) => (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        rowData.type === 'INGRESO' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {rowData.type === 'INGRESO' ? 'Ingreso' : 'Gasto'}
                                    </span>
                                )}
                            />
                            <Column 
                                field="amount" 
                                header="Monto" 
                                body={(rowData) => (
                                    <span className={`font-semibold ${
                                        rowData.type === 'GASTO' ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                        {formatCurrency(rowData.amount)}
                                    </span>
                                )}
                                sortable
                            />
                        </DataTable>
                    </Card>
                </TabPanel>
            </TabView>

            <Card className="mt-6 mb-4">
                <h2 className="text-xl font-semibold mb-4">Distribución por Categorías</h2>
                <Chart type="pie" data={chartData} />
            </Card>
        </div>
    )
} 