'use client';
import Link from 'next/link';
import { Background } from '../components/background';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Cadastro() {
      const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações no frontend
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      // Redirecionar para login após cadastro bem-sucedido
      router.push('/login?message=Conta criada com sucesso!');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    return (
        <Background>
            <main className="w-full max-w-md block flex-col justify-center items-center">
                <div className="mb-8 w-full">
                    <h2 className="text-[#494949] text-4xl font-bold text-center mb-16 font-montserrat">
                        Cadastro
                    </h2>
                    
                    <input 
                        type="text" 
                        placeholder="Nome completo"
                        className=" text-[#494949] w-full border-2 border-[#494949] rounded-lg px-4 py-3 mb-6 font-montserrat focus:outline-none focus:border-[#494949]"
                    />
                    
                    <input
                        type="email"    
                        placeholder="E-mail" 
                        className=" text-[#494949] w-full border-2 border-[#494949] rounded-lg px-4 py-3 mb-6 font-montserrat focus:outline-none focus:border-[#494949]"
                    />  
                    
                    <input 
                        type="password" 
                        placeholder="Senha" 
                        className=" text-[#494949] w-full border-2 border-[#494949] rounded-lg px-4 py-3 mb-8 font-montserrat focus:outline-none focus:border-[#494949]"
                    /> 
                    <input 
                        type="password" 
                        placeholder="Confirmar senha" 
                        className="text-[#494949] w-full border-2 border-[#494949] rounded-lg px-4 py-3 mb-8 font-montserrat focus:outline-none focus:border-[#494949]"
                    /> 
                    
                    <button className="w-full bg-[#098842] text-white rounded-lg px-4 py-3 font-montserrat font-bold border border-[#3B3434] hover:bg-[#087c3a] transition-colors">
                        Cadastrar
                    </button>
                </div>
                
                <div className="text-center w-full">
                    <p className="text-[#494949] text-sm font-montserrat">
                        Já possui uma conta?{' '}
                        <Link href="page.tsx" className="text-[#098842] font-bold hover:text-[#087c3a] transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </main>
        </Background>
    );
}