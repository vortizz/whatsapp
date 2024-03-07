'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa'
import { LuEye, LuEyeOff } from 'react-icons/lu'

export default function Login() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const router = useRouter()

    return (
        <div className="h-full flex items-center justify-center mt-24">
            <div className="rounded-2xl p-10 max-w-[27rem] w-11/12 flex flex-col justify-center bg-white shadow-lg">
                <div className='flex flex-row gap-1 justify-center items-center'>
                    <span className='text-teal-600 text-[3rem]'>
                        <FaWhatsapp />
                    </span>
                    <h1 className='text-2xl uppercase'>Whats#<span className='text-teal-600'>App</span></h1>
                </div>
                <span className="text-center text-lg mt-5">Create or access your WhatsApp account to text your friends.</span>
                <div className="flex flex-col gap-1 mt-6">
                    <label className="uppercase text-xs font-semibold">E-mail</label>
                    <input type="email" className="text-lg border border-slate-300 rounded-2xl py-3 px-4 p font-medium bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1 mt-6">
                    <label className="uppercase text-xs font-semibold">Password</label>
                    <div className='relative'>
                        <input type={isPasswordVisible ? 'text' : 'password'} className="w-full text-lg border border-zinc-300 rounded-2xl py-3 pl-4 pr-10 p font-medium bg-zinc-50 focus:bg-white focus:border-teal-600 focus:outline-none"/>
                        <button className='absolute inset-y-0 right-0 text-slate-400 px-4 text-lg' onClick={() => setIsPasswordVisible(value => !value)}>
                            {
                                isPasswordVisible ? 
                                <LuEye /> :
                                <LuEyeOff />
                            } 
                        </button>
                    </div>
                    
                    <button className="ml-auto font-semibold text-teal-700 hover:underline duration-300">
                        Forgot my password
                    </button>
                </div>
                <button
                    className="mt-8 text-lg rounded-md bg-teal-600 w-full py-3 text-white font-semibold hover:bg-teal-700 duration-300"
                >
                    Login
                </button>
                <button
                    className="mt-4 text-lg rounded-md border-2 border-teal-600 w-full py-3 text-teal-600 font-semibold hover:bg-teal-600 hover:text-white duration-300"
                    onClick={() => router.push('/auth/create-account')}
                >
                    Create an account
                </button>
            </div>
        </div>  
    )
}