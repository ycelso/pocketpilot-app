// Script para configurar autenticación móvil
const https = require('https');
const http = require('http');

console.log('🔧 Configurando autenticación móvil...');

// Función para obtener la IP pública
function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Función para verificar si el puerto está abierto
function checkPort(host, port) {
  return new Promise((resolve) => {
    const req = http.request({
      host: host,
      port: port,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  try {
    console.log('📡 Obteniendo IP pública...');
    const publicIP = await getPublicIP();
    console.log(`🌐 IP pública: ${publicIP}`);
    
    console.log('🔍 Verificando si el puerto 9002 está accesible...');
    const isPortOpen = await checkPort(publicIP, 9002);
    
    if (isPortOpen) {
      console.log('✅ Puerto 9002 está accesible desde internet');
      console.log(`🔗 URL para Google Cloud Console: https://${publicIP}:9002/dashboard`);
      console.log('\n📋 Pasos a seguir:');
      console.log('1. Ve a Google Cloud Console > APIs & Services > Credentials');
      console.log('2. Edita tu OAuth 2.0 Client ID');
      console.log(`3. Agrega esta URL autorizada: https://${publicIP}:9002/dashboard`);
      console.log('4. Ve a Supabase > Authentication > URL Configuration');
      console.log(`5. Agrega esta URL: https://${publicIP}:9002/dashboard`);
    } else {
      console.log('❌ Puerto 9002 no está accesible desde internet');
      console.log('💡 Necesitas configurar tu router para hacer port forwarding');
      console.log('   o usar un servicio de túnel como ngrok/localtunnel');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternativa: Usa un servicio de túnel');
    console.log('   npm install -g localtunnel');
    console.log('   lt --port 9002 --subdomain pocketpilot');
  }
}

main();

