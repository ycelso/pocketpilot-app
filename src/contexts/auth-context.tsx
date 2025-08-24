
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Manejar token de acceso en la URL (para autenticación móvil)
    const handleAccessToken = async () => {
      if (typeof window !== 'undefined') {
        // Verificar si estamos en un esquema de deep linking (pocketpilot://)
        const currentUrl = window.location.href;
        console.log('🔍 URL actual:', currentUrl);
        
        if (currentUrl.startsWith('pocketpilot://')) {
          console.log('🔍 Detectado esquema pocketpilot://, procesando...');
          
          try {
            // Extraer parámetros de la URL del deep link
            const url = new URL(currentUrl);
            const accessToken = url.searchParams.get('access_token');
            const refreshToken = url.searchParams.get('refresh_token');
            
            if (accessToken) {
              console.log('✅ Token encontrado en deep link, estableciendo sesión...');
              
              // Establecer la sesión manualmente
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
              
              if (error) {
                console.error('❌ Error estableciendo sesión:', error);
              } else {
                console.log('✅ Sesión establecida correctamente desde deep link');
                setSession(data.session);
                setUser(data.user);
                
                // Limpiar la URL y redirigir al dashboard
                window.history.replaceState({}, document.title, '/dashboard');
                window.location.href = '/dashboard';
              }
            }
          } catch (error) {
            console.error('❌ Error procesando deep link:', error);
          }
        } else {
          // Manejo original para URLs con hash
          const hash = window.location.hash;
          if (hash.includes('access_token')) {
            console.log('🔍 Detectado access_token en URL hash, procesando...');
            
            try {
              // Extraer el token de la URL
              const params = new URLSearchParams(hash.substring(1));
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken) {
                console.log('✅ Token encontrado, estableciendo sesión...');
                
                // Establecer la sesión manualmente
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                });
                
                if (error) {
                  console.error('❌ Error estableciendo sesión:', error);
                } else {
                  console.log('✅ Sesión establecida correctamente');
                  setSession(data.session);
                  setUser(data.user);
                  
                  // Limpiar la URL y redirigir solo si no estamos ya en dashboard
                  window.history.replaceState({}, document.title, '/dashboard');
                  if (!window.location.pathname.includes('/dashboard')) {
                    window.location.href = '/dashboard';
                  }
                }
              }
            } catch (error) {
              console.error('❌ Error procesando token:', error);
            }
          }
        }
      }
    };

    // Obtener sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    // Procesar token primero, luego obtener sesión
    handleAccessToken().then(() => {
      getInitialSession();
    });

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Estado de autenticación cambiado:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Auto-redirect después de autenticación exitosa (solo si no estamos ya en dashboard)
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ Usuario autenticado, verificando redirección...');
          // Solo redirigir si no estamos ya en el dashboard
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard')) {
            console.log('🔄 Redirigiendo al dashboard...');
            // Comentado temporalmente para debug
            // setTimeout(() => {
            //   window.location.href = '/dashboard';
            // }, 100);
          } else {
            console.log('📍 Ya estamos en dashboard, no redirigir');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
