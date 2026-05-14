import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitlean.tracker',
  appName: '减脂助手',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
