'use client';

import { useEffect } from 'react';

export default function MobileRedirectPage() {
  useEffect(() => {
    const handleMobileRedirect = () => {
      try {
        console.log('🔍 Mobile redirect page iniciada');
        console.log('🔍 URL completa:', window.location.href);
        
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
          console.log('🔍 Tokens encontrados en hash');
        }
        
        if (accessToken) {
          console.log('✅ Token encontrado en mobile redirect, redirigiendo a app...');
          
          // Construir la URL del deep link
          const deepLinkUrl = `pocketpilot://dashboard?access_token=${accessToken}&refresh_token=${refreshToken || ''}`;
          
          console.log('🔗 Intentando abrir deep link:', deepLinkUrl);
          
          // Intentar múltiples métodos para abrir la app
          try {
            // Método 1: window.location.href
            window.location.href = deepLinkUrl;
            
            // Método 2: Intentar con window.open después de un delay
            setTimeout(() => {
              try {
                window.open(deepLinkUrl, '_self');
              } catch (e) {
                console.log('❌ window.open falló:', e);
              }
            }, 1000);
            
            // Método 3: Intentar con location.replace después de otro delay
            setTimeout(() => {
              try {
                window.location.replace(deepLinkUrl);
              } catch (e) {
                console.log('❌ location.replace falló:', e);
              }
            }, 2000);
            
          } catch (e) {
            console.log('❌ Error al intentar abrir deep link:', e);
          }
          
          // Fallback: mostrar mensaje al usuario
          setTimeout(() => {
            document.body.innerHTML = `
              <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif; background: #f8f9fa; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto;">
                  <h2 style="color: #0891b2; margin-bottom: 20px;">¡Autenticación exitosa!</h2>
                  <p style="margin-bottom: 20px; color: #666;">Si la app no se abrió automáticamente, toca el siguiente enlace:</p>
                  <a href="${deepLinkUrl}" style="display: inline-block; background: #0891b2; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; margin: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    🔗 Abrir PocketPilot
                  </a>
                  <p style="margin-top: 20px; color: #666; font-size: 14px;">
                    También puedes cerrar esta pestaña y abrir la app manualmente.
                  </p>
                  <div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px; font-size: 12px; color: #666;">
                    <strong>Debug info:</strong><br>
                    Token encontrado: ${accessToken ? 'Sí' : 'No'}<br>
                    User Agent: ${navigator.userAgent.substring(0, 50)}...
                  </div>
                </div>
              </div>
            `;
          }, 3000);
        } else {
          console.log('❌ No se encontró token en mobile redirect');
          document.body.innerHTML = `
            <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif; background: #f8f9fa; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto;">
                <h2 style="color: #ef4444; margin-bottom: 20px;">Error de autenticación</h2>
                <p style="margin-bottom: 20px; color: #666;">No se pudo completar la autenticación. Por favor, intenta nuevamente.</p>
                <a href="/login" style="display: inline-block; background: #0891b2; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Volver al Login
                </a>
                <div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px; font-size: 12px; color: #666;">
                  <strong>Debug info:</strong><br>
                  URL: ${window.location.href}<br>
                  User Agent: ${navigator.userAgent.substring(0, 50)}...
                </div>
              </div>
            </div>
          `;
        }
      } catch (error) {
        console.error('❌ Error en mobile redirect:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        document.body.innerHTML = `
          <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif; background: #f8f9fa; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto;">
              <h2 style="color: #ef4444; margin-bottom: 20px;">Error</h2>
              <p style="margin-bottom: 20px; color: #666;">Ocurrió un error durante la autenticación. Por favor, intenta nuevamente.</p>
              <a href="/login" style="display: inline-block; background: #0891b2; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Volver al Login
              </a>
              <div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px; font-size: 12px; color: #666;">
                <strong>Error:</strong> ${errorMessage}
              </div>
            </div>
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
      textAlign: 'center',
      background: '#f8f9fa'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '300px'
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
        <h2 style={{ color: '#0891b2', marginBottom: '10px' }}>Completando autenticación...</h2>
        <p style={{ color: '#666' }}>Te estamos redirigiendo a la app.</p>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

