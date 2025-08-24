# 🔧 Solución para Autenticación Google en Móvil

## 🚨 **Problema Identificado**
La autenticación de Google funciona correctamente hasta el consentimiento, pero cuando redirige a `localhost:3000/dashboard#access_token=...`, la app no procesa automáticamente el token de acceso.

## ✅ **Solución Implementada**

### **1. Procesamiento Automático de Tokens**
- ✅ Agregado manejo automático de `access_token` en la URL
- ✅ Procesamiento del token al cargar la app
- ✅ Establecimiento automático de sesión con Supabase
- ✅ Limpieza de URL y redirección al dashboard

### **2. URLs que necesitas configurar**

#### **En Supabase (Authentication > URL Configuration):**
```
Site URL: http://localhost:3000
Redirect URLs:
- http://localhost:3000/dashboard
- http://localhost:3000/auth/callback
- http://localhost:3000
- https://localhost:3000/dashboard  ← PARA MÓVIL (HTTPS)
```

#### **En Google Cloud Console (OAuth 2.0 > Authorized redirect URIs):**
```
- https://taybquizhxriczwvrjsu.supabase.co/auth/v1/callback
- http://localhost:3000
- http://localhost:3000/dashboard
- http://localhost:3000/auth/callback
- https://localhost:3000/dashboard  ← PARA MÓVIL (HTTPS)
```

## 🔄 **Pasos para Aplicar la Solución**

### **Paso 1: Configurar Supabase**
1. Ve a tu proyecto Supabase
2. **Authentication** > **URL Configuration**
3. Agrega `https://localhost:3000/dashboard` a **Redirect URLs**
4. Guarda los cambios

### **Paso 2: Configurar Google Cloud Console**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** > **Credentials**
3. Edita tu OAuth 2.0 Client ID
4. Agrega `https://localhost:3000/dashboard` a **Authorized redirect URIs**
5. Guarda los cambios

### **Paso 3: Reinstalar la App**
```bash
npm run build:mobile
npm run android:open
```

## 🎯 **Cómo Funciona Ahora**

1. **Usuario presiona "Iniciar sesión con Google"**
2. **Se abre el navegador** con la autenticación de Google
3. **Usuario selecciona cuenta** y acepta las políticas
4. **Google redirige a Supabase** con el token
5. **Supabase redirige a `https://localhost:3000/dashboard#access_token=...`**
6. **AuthContext detecta el token** en la URL automáticamente ← **NUEVO**
7. **Se establece la sesión** y redirige al dashboard ← **NUEVO**

## 🔍 **Verificación**

Para verificar que funciona:

1. **Desinstala la app** actual del dispositivo
2. **Reinstala** con los nuevos cambios
3. **Prueba la autenticación** con Google
4. **Deberías ver** que después del consentimiento, la app se abre automáticamente

## 🆘 **Si Sigue Fallando**

### **Verificar en la Consola:**
1. Abre las herramientas de desarrollador en Android Studio
2. Busca mensajes que empiecen con:
   - `🔍 Detectado access_token en URL, procesando...`
   - `✅ Token encontrado, estableciendo sesión...`
   - `✅ Sesión establecida correctamente`

### **Debug Manual:**
Si no funciona, podemos agregar más logging para identificar dónde falla el proceso.

## 📱 **Archivos Modificados**

- ✅ `src/contexts/auth-context.tsx` - Procesamiento automático de tokens
- ✅ `src/hooks/use-google-auth.tsx` - URL de redirección simplificada
- ✅ `SUPABASE_SETUP_INSTRUCTIONS.md` - Instrucciones actualizadas

¡Con estos cambios, la autenticación de Google debería funcionar perfectamente en móvil! 🎉
