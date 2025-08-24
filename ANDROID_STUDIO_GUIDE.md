# 🚀 Guía para Android Studio - PocketPilot

## 📋 **Requisitos Previos**

### **1. Instalar Android Studio**
- Descarga desde: https://developer.android.com/studio
- Instala con todas las opciones por defecto
- Acepta las licencias de Android SDK

### **2. Configurar Android SDK**
- Abre Android Studio
- Ve a **File > Settings > Appearance & Behavior > System Settings > Android SDK**
- Instala:
  - **Android SDK Platform 34** (API Level 34)
  - **Android SDK Build-Tools 34.0.0**
  - **Android SDK Command-line Tools**

### **3. Configurar Variables de Entorno**
- **ANDROID_HOME**: `C:\Users\[TuUsuario]\AppData\Local\Android\Sdk`
- **JAVA_HOME**: `C:\Program Files\Android\Android Studio\jbr`

## 🔧 **Configuración del Proyecto**

### **1. Build del Proyecto Web**
```bash
npm run build
```

### **2. Sincronizar con Capacitor**
```bash
npx cap sync
```

### **3. Abrir en Android Studio**
```bash
npx cap open android
```

## 📱 **Estructura del Proyecto Android**

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── assets/
│   │   │   │   └── public/          # Tu app web compilada
│   │   │   ├── java/
│   │   │   │   └── com/pocketpilot/app/
│   │   │   │       └── MainActivity.java
│   │   │   └── res/
│   │   │       ├── drawable/
│   │   │       ├── layout/
│   │   │       ├── values/
│   │   │       └── mipmap/
│   │   └── AndroidManifest.xml
│   └── build.gradle
└── build.gradle
```

## 🎯 **Pasos para Ejecutar**

### **1. Abrir Android Studio**
- Ejecuta: `npx cap open android`
- O abre manualmente: `android/` en Android Studio

### **2. Configurar Emulador**
- **Tools > AVD Manager**
- **Create Virtual Device**
- Selecciona: **Pixel 7** (API 34)
- Descarga e instala la imagen del sistema

### **3. Ejecutar la App**
- **Run > Run 'app'** (F5)
- Selecciona tu emulador
- ¡La app se instalará y ejecutará!

## 🔄 **Flujo de Desarrollo**

### **Cada vez que hagas cambios:**

1. **Build del proyecto web:**
   ```bash
   npm run build
   ```

2. **Sincronizar con Android:**
   ```bash
   npx cap sync
   ```

3. **Recargar en Android Studio:**
   - **Build > Clean Project**
   - **Build > Rebuild Project**
   - **Run > Run 'app'**

## 📦 **Configuraciones Importantes**

### **1. Permisos (AndroidManifest.xml)**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### **2. Configuración de App (build.gradle)**
```gradle
android {
    compileSdk 34
    defaultConfig {
        applicationId "com.pocketpilot.app"
        minSdk 22
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
}
```

## 🎨 **Personalización**

### **1. Icono de la App**
- Reemplaza: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Tamaños: 48x48, 72x72, 96x96, 144x144, 192x192

### **2. Nombre de la App**
- Edita: `android/app/src/main/res/values/strings.xml`
```xml
<string name="app_name">PocketPilot</string>
```

### **3. Colores del Tema**
- Edita: `android/app/src/main/res/values/colors.xml`
```xml
<color name="colorPrimary">#0891b2</color>
<color name="colorPrimaryDark">#0e7490</color>
<color name="colorAccent">#0891b2</color>
```

## 🚀 **Generar APK**

### **1. APK de Debug**
- **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- Ubicación: `android/app/build/outputs/apk/debug/app-debug.apk`

### **2. APK de Release**
- **Build > Generate Signed Bundle / APK**
- Selecciona **APK**
- Crea un keystore o usa uno existente
- Selecciona **release** build variant

## 🔧 **Solución de Problemas**

### **Error: "SDK location not found"**
- Configura `ANDROID_HOME` en variables de entorno
- Reinicia Android Studio

### **Error: "Gradle sync failed"**
- **File > Invalidate Caches / Restart**
- **Build > Clean Project**

### **Error: "Device not found"**
- Verifica que el emulador esté ejecutándose
- Ejecuta: `adb devices` en terminal

### **App no carga**
- Verifica que `npx cap sync` se ejecutó después del build
- Revisa la consola de Android Studio para errores

## 📚 **Recursos Adicionales**

- [Documentación Capacitor](https://capacitorjs.com/docs)
- [Guía Android Studio](https://developer.android.com/studio)
- [Configuración Gradle](https://gradle.org/docs/)

## 🎉 **¡Listo para Desarrollar!**

Tu app PocketPilot está configurada para Android Studio. Ahora puedes:

- ✅ Desarrollar con hot reload
- ✅ Usar herramientas nativas de Android
- ✅ Generar APKs para distribución
- ✅ Debuggear con herramientas avanzadas
- ✅ Optimizar performance nativa

¡Happy coding! 🚀

