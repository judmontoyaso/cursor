'use client'

import { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'

interface IconSelectorProps {
  onSelect: (icon: string) => void
  selectedIcon: string
}

export default function IconSelector({ onSelect, selectedIcon }: IconSelectorProps) {
  const [visible, setVisible] = useState(false)

  const icons = [
    // Animales
    { name: 'pi pi-discord', category: 'animals' }, // perrito
    { name: 'pi pi-github', category: 'animals' }, // gato
    
    // Finanzas
    { name: 'pi pi-money-bill', category: 'finance' },
    { name: 'pi pi-dollar', category: 'finance' },
    { name: 'pi pi-wallet', category: 'finance' },
    { name: 'pi pi-credit-card', category: 'finance' },
    { name: 'pi pi-percentage', category: 'finance' },
    
    // Hogar
    { name: 'pi pi-home', category: 'home' },
    { name: 'pi pi-shopping-cart', category: 'home' },
    { name: 'pi pi-shopping-bag', category: 'home' },
    { name: 'pi pi-car', category: 'home' },
    
    // Entretenimiento
    { name: 'pi pi-ticket', category: 'entertainment' },
    { name: 'pi pi-video', category: 'entertainment' },
    { name: 'pi pi-music', category: 'entertainment' },
    { name: 'pi pi-camera', category: 'entertainment' },
    { name: 'pi pi-gift', category: 'entertainment' },
  ]

  return (
    <>
      <Button
        icon={selectedIcon}
        className="p-button-rounded p-button-outlined w-12 h-12"
        onClick={() => setVisible(true)}
      />

      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        header="Seleccionar Icono"
        className="w-[90vw] md:w-[40vw]"
      >
        <div className="grid grid-cols-6 gap-2">
          {icons.map((icon, index) => (
            <Button
              key={index}
              icon={icon.name}
              className={`p-button-rounded p-button-outlined w-12 h-12 ${
                selectedIcon === icon.name ? 'p-button-primary' : 'p-button-secondary'
              }`}
              onClick={() => {
                onSelect(icon.name)
                setVisible(false)
              }}
            />
          ))}
        </div>
      </Dialog>
    </>
  )
} 