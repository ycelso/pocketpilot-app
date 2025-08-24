# 🔧 Guía de Configuración Android Studio - Solución de Errores

## 🚨 **Error Actual:**
```
Install canceled by user - com.pocketpilot.app
```

## 📋 **Paso 1: Configurar Variables de Entorno**

### **En Windows:**
1. **Abre Variables de Entorno del Sistema:**
   - Presiona `Win + R`
   - Escribe `sysdm.cpl`
   - Ve a **Opciones avanzadas > Variables de entorno**

2. **Agrega estas variables:**
   ```
   ANDROID_HOME = C:\Users\[TuUsuario]\AppData\Local\Android\Sdk
   JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
   ```

3. **Modifica PATH:**
   Agrega estas rutas al PATH:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

### **Verificar Configuración:**
```bash
# Reinicia la terminal y ejecuta:
echo %ANDROID_HOME%
echo %JAVA_HOME%
adb version
```

## 📱 **Paso 2: Configurar Emulador**

### **1. Crear Nuevo Emulador:**
- Abre Android Studio
- **Tools > AVD Manager**
- **Create Virtual Device**
- Selecciona: **Pixel 7** (API 34)
- **Next > Download** (API 34)
- **Finish**

### **2. Configurar Emulador:**
- **Edit** en el emulador creado
- **Show Advanced Settings**
- **Memory and Storage:**
  - RAM: 4096 MB
  - VM Heap: 512 MB
  - Internal Storage: 8192 MB
- **Emulated Performance:**
  - Graphics: Hardware - GLES 2.0
  - Boot option: Cold boot

## 🔧 **Paso 3: Limpiar y Rebuild**

### **1. En Android Studio:**
```
Build > Clean Project
Build > Rebuild Project
```

### **2. En Terminal:**
```bash
# Limpiar build anterior
npm run build:mobile

# Verificar que el emulador esté ejecutándose
adb devices
```

## 🚀 **Paso 4: Instalar la App**

### **1. Ejecutar Emulador:**
- En AVD Manager, haz clic en **Play** ▶️
- Espera a que el emulador se inicie completamente

### **2. Instalar App:**
- En Android Studio: **Run > Run 'app'**
- Selecciona tu emulador
- **OK**

### **3. Si sigue fallando:**
```bash
# Instalar manualmente
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔍 **Paso 5: Verificar Permisos**

### **En el Emulador:**
1. **Settings > Apps > PocketPilot**
2. **Permissions**
3. Asegúrate de que tenga:
   - **Storage**
   - **Internet**
   - **Network State**

## 🛠 **Paso 6: Debugging**

### **Si el error persiste:**

1. **Verificar Logs:**
   ```bash
   adb logcat | grep -i pocketpilot
   ```

2. **Reinstalar App:**
   ```bash
   adb uninstall com.pocketpilot.app
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. **Limpiar Cache:**
   ```bash
   adb shell pm clear com.pocketpilot.app
   ```

## 📱 **Paso 7: Configuración de Desarrollo**

### **En el Emulador:**
1. **Settings > Developer options**
2. **Enable USB debugging**
3. **Enable Install via USB**
4. **Enable Unknown sources**

## 🎯 **Comandos Útiles:**

```bash
# Ver dispositivos conectados
adb devices

# Ver logs en tiempo real
adb logcat

# Instalar APK
adb install path/to/app.apk

# Desinstalar app
adb uninstall com.pocketpilot.app

# Reiniciar ADB
adb kill-server
adb start-server
```

## 🔄 **Flujo Completo de Solución:**

1. **Configurar variables de entorno** ✅
2. **Reiniciar terminal** ✅
3. **Crear nuevo emulador** ✅
4. **Limpiar proyecto** ✅
5. **Build y sync** ✅
6. **Ejecutar emulador** ✅
7. **Instalar app** ✅

## 📞 **Si el problema persiste:**

1. **Verificar versión de Android Studio** (última versión)
2. **Verificar SDK Tools** (instalados correctamente)
3. **Probar con dispositivo físico**
4. **Revisar logs completos en Android Studio**

¡Con estos pasos deberías poder instalar la app sin problemas! 🚀

