'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FaWhatsapp } from "react-icons/fa"
import { IoMdArrowBack } from "react-icons/io"
import { LuEye, LuEyeOff } from "react-icons/lu"
import { Toaster, toast } from "sonner"

type FormInput = {
    name: string
    email: string
    password: string
    confirmPassword: string
}

export default function CreateAccount() {
    const router = useRouter()
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormInput>()

    // STATES
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false)
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // FUNCTIONS
    function onSubmit(data: FormInput) {
        console.log(data)
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            toast.success('Successfully')
        }, 3000);

        
    }
    
    return (
        <>
            <Toaster richColors duration={5000} position="top-right" closeButton />
            <div className="h-full flex items-center justify-center mt-24">
                <div className="rounded-2xl p-10 max-w-[27rem] w-11/12 flex flex-col justify-center bg-white shadow-lg relative">
                    <button 
                        className="absolute -left-3 -top-3 p-2 rounded-full border-2 border-teal-600 bg-teal-600 text-white font-semibold hover:bg-teal-700 duration-300"
                        onClick={() => router.push('/auth/login')}
                    >
                        <IoMdArrowBack />
                    </button>
                    <div className='flex flex-row gap-1 justify-center items-center'>
                        <span className='text-teal-600 text-[3rem]'>
                            <FaWhatsapp />
                        </span>
                        <h1 className='text-2xl uppercase'>Whats#<span className='text-teal-600'>App</span></h1>
                    </div>
                    <span className="text-center text-lg mt-5 inline-block">
                        Create your WhatsApp account to start your journey.
                    </span>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col mt-6 gap-6">
                            <div className="flex flex-col gap-1">
                                <label className="uppercase text-xs font-semibold">Name</label>
                                <input
                                    type="text"
                                    className={`text-lg border border-slate-300 rounded-2xl py-3 px-4 p font-medium bg-slate-50 focus:bg-white focus:outline-none ${errors.name ? 'focus:border-red-600' : 'focus:border-teal-600'}`}
                                    {...register('name', { required: 'Name is required' })}
                                />
                                {errors.name && <span className="text-red-600 text-sm">{errors.name?.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="uppercase text-xs font-semibold">E-mail</label>
                                <input
                                    type="email"
                                    className={`text-lg border border-slate-300 rounded-2xl py-3 px-4 p font-medium bg-slate-50 focus:bg-white focus:outline-none ${errors.email ? 'focus:border-red-600' : 'focus:border-teal-600'}`}
                                    {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } })}
                                />
                                {errors.email && <span className="text-red-600 text-sm">{errors.email?.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="uppercase text-xs font-semibold">Password</label>
                                <div className='relative'>
                                    <input
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        className={`w-full text-lg border border-zinc-300 rounded-2xl py-3 pl-4 pr-10 p font-medium bg-zinc-50 focus:bg-white focus:outline-none ${errors.password ? 'focus:border-red-600' : 'focus:border-teal-600'}`}
                                        {...register('password', { required: 'Password is required' })}
                                    />
                                    <button className='absolute inset-y-0 right-0 text-slate-400 px-4 text-lg' onClick={() => setIsPasswordVisible(value => !value)}>
                                        {
                                            isPasswordVisible ? 
                                            <LuEye /> :
                                            <LuEyeOff />
                                        } 
                                    </button>
                                </div>
                                {errors.password && <span className="text-red-600 text-sm">{errors.password?.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="uppercase text-xs font-semibold">Confirm Password</label>
                                <div className='relative'>
                                    <input
                                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                                        className={`w-full text-lg border border-zinc-300 rounded-2xl py-3 pl-4 pr-10 p font-medium bg-zinc-50 focus:bg-white focus:outline-none ${errors.confirmPassword ? 'focus:border-red-600' : 'focus:border-teal-600'}`}
                                        {...register('confirmPassword', {
                                            required: 'Confirm Password is required',
                                            validate: (val: string) => { 
                                                if (watch('password') !== val) {
                                                    return 'Your passwords do not match'
                                                }
                                            }
                                        })}
                                    />
                                    <button className='absolute inset-y-0 right-0 text-slate-400 px-4 text-lg' onClick={() => setIsConfirmPasswordVisible(value => !value)}>
                                        {
                                            isConfirmPasswordVisible ? 
                                            <LuEye /> :
                                            <LuEyeOff />
                                        } 
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="text-red-600 text-sm">{errors.confirmPassword?.message}</span>}
                            </div>
                        </div>
                        {
                            !isLoading ? (
                                <button
                                    type="submit"
                                    className="mt-7 text-lg rounded-md bg-teal-600 w-full py-3 text-white font-semibold hover:bg-teal-700 duration-300"
                                >
                                    Register
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="mt-7 text-lg text-center rounded-md bg-teal-700 w-full py-3 text-white font-semibold"
                                >
                                    <svg aria-hidden="true" role="status" className="inline w-5 h-5 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                    </svg>
                                    Loading...
                                </button>
                            )
                        }
                    </form>
                </div>
            </div>
        </>
    )
}