import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
    

interface BudgetFormProps {
    budgets: any[]; // Cambia 'any' por el tipo adecuado si lo conoces
    setBudgets: React.Dispatch<React.SetStateAction<any[]>>; // Cambia 'any' por el tipo adecuado si lo conoces
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budgets, setBudgets }) => {
    const { data: session } = useSession();
    const [type, setType] = useState('');
    const [amount, setAmount] = useState<number | null>(0);
    const [description, setDescription] = useState('');
    const toast = useRef<Toast>(null); // Asegúrate de que la referencia sea del tipo correcto

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            alert('Debes estar autenticado para agregar un presupuesto.');
            return;
        }

        const userId = session.user.id;

        const response = await fetch('/api/budgets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, type, amount, description }),
        });

        if (response.ok) {
            const budget = await response.json();
            console.log('Presupuesto creado:', budget);
            setBudgets((prevBudgets) => [...prevBudgets, budget]);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Presupuesto agregado correctamente', life: 3000 });
            setType('');
            setAmount(0);
            setDescription('');
        } else {
            console.error('Error al crear el presupuesto');
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el presupuesto', life: 3000 });
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <form onSubmit={handleSubmit}>
                <div className="p-field">
                    <label htmlFor="type">Tipo:</label>
                    <InputText
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                    />
                </div>
                <div className="p-field">
                    <label htmlFor="amount">Monto:</label>
                    <InputNumber
                        id="amount"
                        value={amount}
                        onValueChange={(e) => setAmount(e.value || 0)}
                        required
                    />
                </div>
                <div className="p-field">
                    <label htmlFor="description">Descripción:</label>
                    <InputTextarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <Button label="Agregar Presupuesto" type="submit" />
            </form>
        </>
    );
};

export default BudgetForm;
