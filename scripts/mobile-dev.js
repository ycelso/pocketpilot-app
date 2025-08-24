#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PocketPilot Mobile Development Script');
console.log('=====================================\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completado\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    return false;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

// Verificar que estamos en el directorio correcto
if (!checkFileExists('package.json') || !checkFileExists('capacitor.config.ts')) {
  console.error('❌ No se encontró package.json o capacitor.config.ts');
  console.error('   Asegúrate de estar en el directorio raíz del proyecto');
  process.exit(1);
}

// Verificar que Android Studio está configurado
if (!checkFileExists('android')) {
  console.error('❌ No se encontró el directorio android/');
  console.error('   Ejecuta: npx cap add android');
  process.exit(1);
}

// Proceso principal
console.log('🔄 Iniciando proceso de build y sync...\n');

// 1. Build del proyecto web
if (!runCommand('npm run build', 'Build del proyecto web')) {
  process.exit(1);
}

// 2. Sync con Capacitor
if (!runCommand('npx cap sync', 'Sincronización con Capacitor')) {
  process.exit(1);
}

// 3. Abrir Android Studio
console.log('📱 Abriendo Android Studio...');
try {
  execSync('npx cap open android', { stdio: 'inherit' });
  console.log('✅ Android Studio abierto\n');
} catch (error) {
  console.log('⚠️  Android Studio no se pudo abrir automáticamente');
  console.log('   Abre manualmente la carpeta android/ en Android Studio\n');
}

console.log('🎉 ¡Proceso completado!');
console.log('\n📋 Próximos pasos:');
console.log('   1. En Android Studio, espera a que se complete el Gradle sync');
console.log('   2. Configura un emulador (Tools > AVD Manager)');
console.log('   3. Ejecuta la app (Run > Run \'app\')');
console.log('\n🔄 Para futuros cambios:');
console.log('   npm run build:mobile');
console.log('\n📚 Consulta ANDROID_STUDIO_GUIDE.md para más detalles');

