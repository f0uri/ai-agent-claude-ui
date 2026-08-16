import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.f0uri.aiagent',
  appName: 'AI Agent',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'http://localhost:3001',
    cleartext: true,
  },
  android: {
    backgroundColor: '#1a1a1a',
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1a1a1a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    Filesystem: {},
  },
  cordova: {},
}

export default config
