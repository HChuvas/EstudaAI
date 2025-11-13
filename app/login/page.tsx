// app/login/page.tsx
import Link from 'next/link';
import { Background } from '../components/background';

export default function Login() {
  return (
    <Background>
      <main className="w-full max-w-md flex flex-col justify-center items-center mx-auto h-full">
        <div className="mb-8 w-full">
          <h2 className="text-[#494949] text-4xl font-bold text-center mb-16 ">
            Login
          </h2>
          
          <input 
            type="email" 
            placeholder="E-mail" 
            className=" text-[#494949] w-full border-2 border-[#818181] rounded-lg px-4 py-3 mb-6  focus:outline-none focus:border-[#494949]"
          />
          
          <input 
            type="password" 
            placeholder="Senha" 
            className="text-[#494949] w-full border-2 border-[#818181] rounded-lg px-4 py-3 mb-8 font-montserrat focus:outline-none focus:border-[#494949]"
          />
          
          <button className="w-full bg-[#098842] text-white rounded-lg px-4 py-3 font-bold border border-[#3B3434] hover:bg-[#087c3a] transition-colors">
            Entrar
          </button>
        </div>

        <div className="text-center w-full">
          <p className="mb-4">
            <Link href="/forgot-password" className="text-[#494949] text-sm font-montserrat hover:text-[#098842] transition-colors">
              Esqueceu a senha?
            </Link>
          </p>

          <p className="text-[#494949] text-sm ">
            Ainda não possui uma conta?{' '}
            <Link href="/cadastro" className="text-[#098842] font-bold hover:text-[#087c3a] transition-colors">
              Cadastre-se
            </Link>
          </p>
        </div>
      </main>
    </Background>
  );
}