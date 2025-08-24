# 🚀 Configuración de Supabase para PocketPilot

## 📋 **Pasos para Configurar Supabase**

### **1. Crear Proyecto en Supabase**
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa la información:
   - **Name**: `pocketpilot`
   - **Database Password**: (genera una contraseña segura)
   - **Region**: Elige la más cercana a ti
5. Haz clic en "Create new project"

### **2. Obtener Credenciales**
1. En tu proyecto, ve a **Settings** > **API**
2. Copia:
   - **Project URL** (ej: `https://your-project.supabase.co`)
   - **anon public** key

### **3. Configurar Variables de Entorno**
Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### **4. Crear Tablas en Supabase**

#### **Tabla: transactions**
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('expense', 'income')) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  account_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

#### **Tabla: budgets**
```sql
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  spent DECIMAL(10,2) DEFAULT 0,
  category TEXT NOT NULL,
  period TEXT CHECK (period IN ('monthly', 'yearly')) DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);
```

#### **Tabla: accounts**
```sql
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('checking', 'savings', 'credit', 'cash')) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);
```

### **5. Configurar Autenticación**

#### **Habilitar Google Auth**
1. Ve a **Authentication** > **Providers**
2. Habilita **Google**
3. Configura:
   - **Client ID**: (obtén de Google Cloud Console)
   - **Client Secret**: (obtén de Google Cloud Console)
   - **Redirect URL**: `https://your-project.supabase.co/auth/v1/callback`

#### **Configurar URLs de Redirección**
En **Authentication** > **URL Configuration**:
- **Site URL**: `http://localhost:3000` (desarrollo)
- **Redirect URLs**: 
  - `http://localhost:3000/dashboard`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000` (para desarrollo local)

### **6. Configurar Google Cloud Console**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega URLs autorizadas:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000`
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/auth/callback`

### **7. Configuración Específica para Móvil (Capacitor)**
Para aplicaciones móviles con Capacitor, Supabase maneja automáticamente las redirecciones. No necesitas configurar URLs específicas de Capacitor en Google Cloud Console.

**En Supabase Auth:**
- Las URLs de redirección se manejan automáticamente
- El WebView de Capacitor funciona con las URLs estándar
- No es necesario configurar `capacitor://` URLs

## 🔧 **Comandos para Ejecutar**

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# (edita .env.local con tus credenciales)

# Build y sync para móvil
npm run build:mobile

# Abrir Android Studio
npm run android:open
```

## 🎯 **Ventajas de Supabase vs Firebase**

### **✅ Supabase:**
- **Autenticación más simple** en WebView
- **Base de datos PostgreSQL** (más potente)
- **Tiempo real nativo** con PostgreSQL
- **Mejor manejo de tipos** TypeScript
- **Menos problemas** con Capacitor

### **❌ Firebase:**
- **Problemas de autenticación** en WebView
- **Firestore** (menos flexible)
- **Configuración compleja** para móvil
- **Problemas de storage** en WebView

## 🚀 **Próximos Pasos**

1. **Configura Supabase** siguiendo esta guía
2. **Crea las tablas** usando los scripts SQL
3. **Configura Google Auth** en Supabase y Google Cloud Console
4. **Ejecuta el build** para móvil
5. **Prueba la autenticación** en Android

¡Con Supabase tendrás una autenticación mucho más confiable en tu app móvil! 🎉
