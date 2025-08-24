const config = {
  appId: 'com.pocketpilot.app',
  appName: 'PocketPilot',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    scheme: 'pocketpilot',
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0891b2",
      showSpinner: true,
      spinnerColor: "#ffffff"
    },
    // Configuración para WebView interno
    WebView: {
      allowFileAccess: true,
      allowContentAccess: true,
      allowFileAccessFromFileURLs: true,
      allowUniversalAccessFromFileURLs: true
    }
  }
};

export default config;
