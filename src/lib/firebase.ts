
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIrZ25gYH1MtMKNzOPIcRDUE0FtHJ1Nwc",
  authDomain: "fir-chatbot-ai-app.firebaseapp.com",
  projectId: "fir-chatbot-ai-app",
  storageBucket: "fir-chatbot-ai-app.firebasestorage.app",
  messagingSenderId: "126198913810",
  appId: "1:126198913810:web:66982f80aff55c8d6271cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configurar auth para WebView de Capacitor (solo en cliente)
if (typeof window !== 'undefined') {
  const configureAuthForCapacitor = async () => {
    try {
      // Detectar si estamos en un entorno WebView (Capacitor)
      const isCapacitor = (window as any).Capacitor;
      const isWebView = navigator.userAgent.includes('wv') || 
                       navigator.userAgent.includes('WebView') ||
                       isCapacitor;
      
      console.log('🔧 Configurando Firebase Auth...');
      console.log('📱 Es WebView:', isWebView);
      console.log('⚡ Es Capacitor:', !!isCapacitor);
      console.log('🌐 User Agent:', navigator.userAgent);
      
      if (isWebView) {
        // En WebView, usar persistencia en memoria
        await setPersistence(auth, inMemoryPersistence);
        console.log('✅ Firebase Auth: Persistencia en memoria configurada para WebView');
      } else {
        // En navegador normal, usar persistencia local
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Firebase Auth: Persistencia local configurada para navegador');
      }
      
    } catch (error) {
      console.error('❌ Error configurando Firebase Auth:', error);
    }
  };

  // Configurar auth al inicializar
  configureAuthForCapacitor();
}
