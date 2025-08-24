# 🚀 Instrucciones Paso a Paso - Configuración de Supabase

## 📋 **Paso 1: Crear Proyecto en Supabase**

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en **"New Project"**
4. Completa la información:
   - **Name**: `pocketpilot`
   - **Database Password**: (genera una contraseña segura)
   - **Region**: Elige la más cercana a ti
5. Haz clic en **"Create new project"**

## 📋 **Paso 2: Obtener Credenciales**

1. En tu proyecto, ve a **Settings** > **API**
2. Copia:
   - **Project URL** (ej: `https://taybquizhxriczwvrjsu.supabase.co`)
   - **anon public** key

## 📋 **Paso 3: Configurar Variables de Entorno**

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://taybquizhxriczwvrjsu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheWJxdWl6aHhyaWN6d3ZyanN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzE0MTAsImV4cCI6MjA2MzEwNzQxMH0.n9eSF-OkJFiPwe8XzmAWJoS_Ggk60eiLonGnwp0mbyQ
```

## 📋 **Paso 4: Crear Tablas en Supabase**

1. En tu proyecto Supabase, ve a **SQL Editor**
2. Haz clic en **"New query"**
3. Copia y pega todo el contenido del archivo `supabase-schema.sql`
4. Haz clic en **"Run"**

## 📋 **Paso 5: Configurar Autenticación**

### **5.1 Habilitar Google Auth en Supabase**
1. Ve a **Authentication** > **Providers**
2. Habilita **Google**
3. Configura:
   - **Client ID**: (obtén de Google Cloud Console)
   - **Client Secret**: (obtén de Google Cloud Console)
   - **Redirect URL**: `https://taybquizhxriczwvrjsu.supabase.co/auth/v1/callback`

### **5.2 Configurar URLs de Redirección**
En **Authentication** > **URL Configuration**:
- **Site URL**: `http://localhost:3000` (desarrollo)
- **Redirect URLs**: 
  - `http://localhost:3000/dashboard`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000` (para desarrollo local)
  - `pocketpilot://dashboard` (para móvil)

## 📋 **Paso 6: Configurar Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega URLs autorizadas:
   - `https://taybquizhxriczwvrjsu.supabase.co/auth/v1/callback`
   - `http://localhost:3000`
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/auth/callback`
   - `pocketpilot://dashboard`

## 📋 **Paso 7: Probar la Configuración**

1. Ejecuta el build:
```bash
npm run build:mobile
```

2. Abre Android Studio:
```bash
npm run android:open
```

3. Ejecuta la app en el emulador o dispositivo

## ✅ **Verificación**

Para verificar que todo está configurado correctamente:

1. **En Supabase SQL Editor**, ejecuta:
```sql
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('transactions', 'budgets', 'accounts')
ORDER BY table_name, ordinal_position;
```

2. **Deberías ver** las tablas `transactions`, `budgets`, y `accounts` con todas sus columnas.

## 🎯 **Próximos Pasos**

1. **Prueba la autenticación** con Google en la app
2. **Crea algunas transacciones** para verificar que se guardan en Supabase
3. **Verifica las notificaciones** en tiempo real

## 🆘 **Solución de Problemas**

### **Error: "No se puede conectar a Supabase"**
- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de que el proyecto esté activo en Supabase

### **Error: "Tabla no encontrada"**
- Ejecuta nuevamente el script SQL en Supabase
- Verifica que las políticas RLS estén creadas

### **Error: "Autenticación fallida"**
- Verifica las URLs en Google Cloud Console
- Asegúrate de que Google Auth esté habilitado en Supabase

¡Con estos pasos tendrás PocketPilot funcionando completamente con Supabase! 🎉
