'use client'

import { usePathname } from 'next/navigation'
import { PanelMenu } from 'primereact/panelmenu'
import { MenuItem } from 'primereact/menuitem'
import { Button } from 'primereact/button'
import { useState } from 'react'

export default function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const items: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            className: pathname === '/' ? 'active-route' : '',
            command: () => window.location.href = '/'
        },
        {
            label: 'Transacciones',
            icon: 'pi pi-money-bill',
            className: pathname === '/transactions' ? 'active-route' : '',
            command: () => window.location.href = '/transactions'
        },
        {
            label: 'Categorías',
            icon: 'pi pi-tags',
            className: pathname === '/categories' ? 'active-route' : '',
            command: () => window.location.href = '/categories'
        },
        {
            label: 'Presupuestos',
            icon: 'pi pi-chart-pie',
            className: pathname === '/budgets' ? 'active-route' : '',
            command: () => window.location.href = '/budgets'
        },
        {
            label: 'Reportes',
            icon: 'pi pi-chart-bar',
            className: pathname === '/reports' ? 'active-route' : '',
            command: () => window.location.href = '/reports'
        }
    ]

    return (
        <div className={`transition-all duration-300 ease-in-out bg-white shadow-md flex flex-col ${isCollapsed ? 'w-16' : 'w-64'}`}>
            <div className="flex justify-end p-2">
                <Button
                    icon={isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    rounded
                    text
                    severity="secondary"
                />
            </div>
            <div className="p-4">
                {isCollapsed ? (
                    <div className="flex flex-col gap-4">
                        {items.map((item, index) => (
                            <Button
                                key={index}
                                icon={item.icon}
                                tooltip={item.label}
                                tooltipOptions={{ position: 'right' }}
                                onClick={() => item.command && item.command(null as any)}
                                rounded
                                text
                                className="w-8 h-8"
                            />
                        ))}
                    </div>
                ) : (
                    <PanelMenu model={items} className="w-full border-none" />
                )}
            </div>
            <style jsx global>{`
                .p-panelmenu .p-panelmenu-header > a {
                    padding: 1rem;
                    border: none;
                    background: transparent;
                }
                .p-panelmenu .p-panelmenu-header:not(.p-highlight):not(.p-disabled) > a:hover {
                    background: #f3f4f6;
                    color: #4f46e5;
                }
                .p-panelmenu .p-panelmenu-header.p-highlight > a {
                    background: transparent;
                    color: #4f46e5;
                }
                .active-route {
                    background: #f3f4f6 !important;
                    color: #4f46e5 !important;
                }
                .p-panelmenu .p-panelmenu-content {
                    display: none;
                }
            `}</style>
        </div>
    )
} 