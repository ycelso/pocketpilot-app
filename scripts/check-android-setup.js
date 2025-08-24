#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 Android Setup Checker');
console.log('========================\n');

function checkCommand(command) {
  try {
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function getAndroidHome() {
  // Intentar diferentes ubicaciones comunes
  const possiblePaths = [
    process.env.ANDROID_HOME,
    path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
    path.join(os.homedir(), 'Library', 'Android', 'sdk'), // macOS
    '/usr/local/android-sdk', // Linux
    'C:\\Android\\Sdk' // Windows alternativa
  ];

  for (const path of possiblePaths) {
    if (path && fs.existsSync(path)) {
      return path;
    }
  }
  return null;
}

function checkJavaHome() {
  const javaHome = process.env.JAVA_HOME;
  if (javaHome && fs.existsSync(javaHome)) {
    return javaHome;
  }
  return null;
}

console.log('📋 Verificando configuración...\n');

// 1. Verificar ANDROID_HOME
const androidHome = getAndroidHome();
if (androidHome) {
  console.log(`✅ ANDROID_HOME encontrado: ${androidHome}`);
} else {
  console.log('❌ ANDROID_HOME no encontrado');
  console.log('   Configura la variable de entorno ANDROID_HOME');
}

// 2. Verificar JAVA_HOME
const javaHome = checkJavaHome();
if (javaHome) {
  console.log(`✅ JAVA_HOME encontrado: ${javaHome}`);
} else {
  console.log('❌ JAVA_HOME no encontrado');
  console.log('   Configura la variable de entorno JAVA_HOME');
}

// 3. Verificar ADB
if (checkCommand('adb version')) {
  console.log('✅ ADB disponible');
} else {
  console.log('❌ ADB no disponible');
  console.log('   Asegúrate de que %ANDROID_HOME%\\platform-tools esté en el PATH');
}

// 4. Verificar Android Studio
const studioPaths = [
  'C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe',
  'C:\\Program Files (x86)\\Android\\Android Studio\\bin\\studio64.exe',
  '/Applications/Android Studio.app/Contents/MacOS/studio', // macOS
  '/usr/local/android-studio/bin/studio.sh' // Linux
];

let studioFound = false;
for (const studioPath of studioPaths) {
  if (fs.existsSync(studioPath)) {
    console.log(`✅ Android Studio encontrado: ${studioPath}`);
    studioFound = true;
    break;
  }
}

if (!studioFound) {
  console.log('❌ Android Studio no encontrado');
  console.log('   Descarga desde: https://developer.android.com/studio');
}

// 5. Verificar proyecto Android
const androidPath = path.join(process.cwd(), 'android');
if (fs.existsSync(androidPath)) {
  console.log('✅ Proyecto Android encontrado');
} else {
  console.log('❌ Proyecto Android no encontrado');
  console.log('   Ejecuta: npx cap add android');
}

console.log('\n📱 Verificando dispositivos...');

// 6. Verificar dispositivos conectados
try {
  const devices = execSync('adb devices', { encoding: 'utf8' });
  const lines = devices.split('\n').filter(line => line.trim());
  
  if (lines.length > 1) {
    console.log('✅ Dispositivos encontrados:');
    lines.slice(1).forEach(line => {
      if (line.trim()) {
        console.log(`   ${line}`);
      }
    });
  } else {
    console.log('❌ No se encontraron dispositivos');
    console.log('   Inicia un emulador o conecta un dispositivo físico');
  }
} catch (error) {
  console.log('❌ No se pudo verificar dispositivos');
  console.log('   Asegúrate de que ADB esté configurado correctamente');
}

console.log('\n🔧 Recomendaciones:');

if (!androidHome) {
  console.log('1. Configura ANDROID_HOME en variables de entorno');
  console.log('   Valor sugerido: C:\\Users\\[TuUsuario]\\AppData\\Local\\Android\\Sdk');
}

if (!javaHome) {
  console.log('2. Configura JAVA_HOME en variables de entorno');
  console.log('   Valor sugerido: C:\\Program Files\\Android\\Android Studio\\jbr');
}

if (!checkCommand('adb version')) {
  console.log('3. Agrega al PATH: %ANDROID_HOME%\\platform-tools');
}

if (!studioFound) {
  console.log('4. Instala Android Studio desde: https://developer.android.com/studio');
}

console.log('\n📋 Comandos útiles:');
console.log('   npm run build:mobile    # Build y sync');
console.log('   npm run android:open    # Abrir Android Studio');
console.log('   npm run mobile:dev      # Script completo');

console.log('\n📚 Documentación:');
console.log('   ANDROID_SETUP_GUIDE.md  # Guía de configuración');
console.log('   ANDROID_STUDIO_GUIDE.md # Guía de desarrollo');

console.log('\n🎯 Para resolver el error de instalación:');
console.log('1. Configura las variables de entorno');
console.log('2. Reinicia la terminal');
console.log('3. Crea un nuevo emulador en Android Studio');
console.log('4. Ejecuta: npm run build:mobile');
console.log('5. Instala la app desde Android Studio');

console.log('\n¡Sigue la guía ANDROID_SETUP_GUIDE.md para más detalles! 🚀');

