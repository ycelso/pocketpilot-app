'use client';

import { useEffect } from 'react';

export default function MobileRedirectPage() {
  useEffect(() => {
    const handleMobileRedirect = () => {
      try {
        // Obtener los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        
        console.log('🔍 Mobile redirect page - URL params:', urlParams.toString());
        console.log('🔍 Mobile redirect page - Hash:', hash);
        
        // Extraer tokens del hash si están ahí
        let accessToken = urlParams.get('access_token');
        let refreshToken = urlParams.get('refresh_token');
        
        if (hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.substring(1));
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
        }
        
        if (accessToken) {
          console.log('✅ Token encontrado en mobile redirect, redirigiendo a app...');
          
          // Construir la URL del deep link
          const deepLinkUrl = `pocketpilot://dashboard?access_token=${accessToken}&refresh_token=${refreshToken || ''}`;
          
          console.log('🔗 Intentando abrir deep link:', deepLinkUrl);
          
          // Intentar abrir la app con el deep link
          window.location.href = deepLinkUrl;
          
          // Fallback: mostrar mensaje al usuario
          setTimeout(() => {
            document.body.innerHTML = `
              <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
                <h2>¡Autenticación exitosa!</h2>
                <p>Si la app no se abrió automáticamente, toca el siguiente enlace:</p>
                <a href="${deepLinkUrl}" style="display: inline-block; background: #0891b2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px;">
                  Abrir PocketPilot
                </a>
                <p style="margin-top: 20px; color: #666; font-size: 14px;">
                  También puedes cerrar esta pestaña y abrir la app manualmente.
                </p>
              </div>
            `;
          }, 2000);
        } else {
          console.log('❌ No se encontró token en mobile redirect');
          document.body.innerHTML = `
            <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
              <h2>Error de autenticación</h2>
              <p>No se pudo completar la autenticación. Por favor, intenta nuevamente.</p>
            </div>
          `;
        }
      } catch (error) {
        console.error('❌ Error en mobile redirect:', error);
        document.body.innerHTML = `
          <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Error</h2>
            <p>Ocurrió un error durante la autenticación. Por favor, intenta nuevamente.</p>
          </div>
        `;
      }
    };

    // Ejecutar después de que la página cargue
    setTimeout(handleMobileRedirect, 1000);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #0891b2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
      </div>
      <h2>Completando autenticación...</h2>
      <p>Te estamos redirigiendo a la app.</p>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

