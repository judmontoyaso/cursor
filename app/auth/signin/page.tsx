'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'

function SignInForm() {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'
    const error = searchParams.get('error') || ''

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data) => {
        try {
            const res = await signIn('credentials', {
                redirect: true,
                email: data.email,
                password: data.password,
                callbackUrl
            })

            if (!res?.ok) {
                toast.error('Credenciales inválidas')
            }
        } catch (error) {
            toast.error(error.message || 'Ocurrió un error al iniciar sesión')
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
                    <p className="mt-2 text-gray-600">Ingresa a tu cuenta de Finn</p>
                </div>

                {error && (
                    <div className="p-4 text-sm text-white bg-red-500 rounded-md">
                        {error === 'CredentialsSignin'
                            ? 'Credenciales inválidas'
                            : 'Ocurrió un error al iniciar sesión'}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Correo electrónico
                        </label>
                        <div className="mt-1">
                            <InputText
                                id="email"
                                type="email"
                                className="w-full"
                                {...register('email', {
                                    required: 'Este campo es requerido',
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                        message: 'Ingresa un correo electrónico válido'
                                    }
                                })}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Contraseña
                        </label>
                        <div className="mt-1">
                            <Password
                                id="password"
                                toggleMask
                                className="w-full"
                                inputClassName="w-full"
                                feedback={false}
                                {...register('password', {
                                    required: 'Este campo es requerido',
                                    minLength: {
                                        value: 6,
                                        message: 'La contraseña debe tener al menos 6 caracteres'
                                    }
                                })}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            label={isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
                            disabled={isSubmitting}
                            className="w-full"
                        />
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <a
                        href="/register"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        ¿No tienes cuenta? Regístrate
                    </a>
                </div>
            </div>
        </div>
    )
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <SignInForm />
        </Suspense>
    )
} 