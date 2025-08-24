'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Declaración de tipos para Capacitor
declare global {
  interface Window {
    Capacitor?: any;
  }
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      console.log('🚀 Iniciando autenticación con Google (Supabase)...');

      // Detectar si estamos en un WebView de Capacitor
      const isCapacitor = typeof window !== 'undefined' && window.Capacitor;
      console.log('📱 ¿Es Capacitor?', isCapacitor);

              // Configurar opciones de autenticación
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: isCapacitor 
              ? 'https://pocketpilot-ycels.loca.lt/mobile-redirect' // Para Android WebView (usando localtunnel)
              : `${window.location.origin}/dashboard`, // Para navegador
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

      if (error) {
        console.error('❌ Error en autenticación Google:', error);
        toast({
          title: 'Error con Google',
          description: error.message || 'Error al iniciar sesión con Google',
          variant: 'destructive',
        });
      } else {
        console.log('✅ Autenticación iniciada:', data);
        toast({
          title: 'Autenticación iniciada',
          description: isCapacitor 
            ? 'Completa el proceso en el navegador que se abrió'
            : 'Completa el proceso en la ventana que se abrió',
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('❌ Error inesperado:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error durante la autenticación',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isLoading
  };
}
