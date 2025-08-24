'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useGoogleAuth } from '@/hooks/use-google-auth';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24" {...props}>
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.355-11.174-7.943l-6.573,5.169C9.043,39.636,15.958,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.551,44,29.839,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
        </svg>
    )
}
  
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" {...props}>
            <path fill="#3F51B5" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"></path><path fill="#fff" d="M26.707,26.707v11.729h5.899V26.707h4.09l0.59-4.891h-4.68V18.32c0-1.283,0.6-1.932,2.012-1.932h2.589v-4.63h-3.95c-4.228,0-5.467,2.186-5.467,5.247v3.718h-2.96v4.891h2.96V26.707z"></path>
        </svg>
    )
}

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) {
                throw error;
            }
            
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: 'Error al iniciar sesión',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    const handlePasswordReset = async () => {
        if (!email) {
            toast({
                title: 'Correo necesario',
                description: 'Por favor, introduce tu correo electrónico para restablecer la contraseña.',
                variant: 'destructive',
            });
            return;
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            
            if (error) {
                throw error;
            }
            
            toast({
                title: 'Correo enviado',
                description: 'Revisa tu bandeja de entrada para restablecer la contraseña.',
                variant: 'success'
            });
        } catch (error: any) {
            toast({
                title: 'Error al enviar correo',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-2 text-foreground">
                <Wallet className="h-6 w-6" />
                <span className="font-bold text-lg">PocketPilot</span>
            </Link>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pt-12">
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="tu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Button variant="link" type="button" onClick={handlePasswordReset} className="p-0 h-auto text-xs">
                        ¿Olvidaste tu contraseña?
                    </Button>
                </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={signInWithGoogle} disabled={isGoogleLoading}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Google
            </Button>
            <Button variant="outline" onClick={() => toast({ 
                title: 'Próximamente', 
                description: 'El inicio de sesión con Facebook estará disponible pronto.',
                variant: 'info'
            })}>
                <FacebookIcon className="mr-2 h-4 w-4" />
                Facebook
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
