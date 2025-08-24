# PocketPilot - Aplicación de Finanzas Personales

Una aplicación moderna de finanzas personales construida con Next.js, Supabase y Capacitor para Android.

## 🚀 Características

- **📱 Aplicación móvil nativa** con Capacitor
- **🔐 Autenticación con Google** usando Supabase
- **💳 Gestión de transacciones** con categorización automática
- **📊 Análisis financiero** con gráficos interactivos
- **💰 Presupuestos** con seguimiento en tiempo real
- **🏦 Gestión de cuentas** múltiples
- **🌙 Modo oscuro/claro** con tema personalizable
- **📈 Exportación** de datos en PDF y Excel

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Mobile**: Capacitor
- **Deployment**: Vercel
- **Charts**: Recharts

## 📱 Aplicación Móvil

### Instalación para desarrollo

```bash
# Instalar dependencias
npm install

# Configurar Capacitor
npx cap add android

# Construir y sincronizar
npm run build:mobile
npx cap sync

# Abrir en Android Studio
npx cap open android
```

### Autenticación móvil

La aplicación incluye autenticación con Google optimizada para dispositivos móviles con deep linking automático.

## 🌐 Despliegue Web

### Despliegue en Vercel

1. **Conectar repositorio** a Vercel
2. **Configurar variables de entorno**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
   ```
3. **Desplegar automáticamente** desde GitHub

### URL de producción

Una vez desplegado, la aplicación estará disponible en:
```
https://pocketpilot-app.vercel.app
```

## 🔧 Configuración Local

### Requisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Android Studio (para desarrollo móvil)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/pocketpilot-app.git
cd pocketpilot-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

### Variables de entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

## 📊 Base de datos

### Tablas principales

- **transactions**: Transacciones financieras
- **budgets**: Presupuestos por categoría
- **accounts**: Cuentas bancarias

### Configuración RLS

Todas las tablas tienen Row Level Security (RLS) habilitado para garantizar que los usuarios solo accedan a sus propios datos.

## 🔐 Autenticación

### Configuración de Google OAuth

1. **Google Cloud Console**: Configurar OAuth 2.0
2. **Supabase**: Configurar proveedor de Google
3. **URLs autorizadas**: Configurar para web y móvil

### Deep Linking

La aplicación móvil utiliza deep linking para regresar automáticamente después de la autenticación:
```
pocketpilot://dashboard?access_token=...
```

## 📈 Scripts disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run dev:mobile       # Servidor para móvil (puerto 9002)

# Construcción
npm run build           # Construcción web
npm run build:mobile    # Construcción móvil

# Despliegue
npm run deploy:vercel   # Desplegar en Vercel
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación en `/docs`
2. Abre un issue en GitHub
3. Consulta los archivos de configuración en la raíz del proyecto

---

**PocketPilot** - Tu compañero financiero personal 📱💰
