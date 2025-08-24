import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

export default function Welcome() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="relative flex flex-col items-center text-center max-w-lg w-full">
        <div className="mb-8 animate-fade-in-scale">
          <Wallet className="w-32 h-32 text-primary" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold font-headline mb-4 animate-fade-in-up [animation-delay:0.2s]">
          Bienvenido a PocketPilot
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-md mb-10 animate-fade-in-up [animation-delay:0.4s]">
          Tu copiloto financiero inteligente. Toma el control de tus gastos, visualiza tus finanzas y alcanza tus metas.
        </p>

        <div className="w-full max-w-xs animate-fade-in-up [animation-delay:0.6s] space-y-4">
          <Button asChild size="lg" className="w-full text-lg py-7 rounded-full">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
           <Button asChild size="lg" variant="outline" className="w-full text-lg py-7 rounded-full">
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
