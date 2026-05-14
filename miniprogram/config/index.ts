import { defineConfig } from '@tarojs/cli';

export default defineConfig({
  projectName: 'fitlean-tracker-miniprogram',
  date: '2026-05-14',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  compiler: 'webpack5',
  plugins: ['@tarojs/plugin-framework-react', '@tarojs/plugin-platform-weapp'],
  mini: {
    postcss: {
      pxtransform: { enable: true },
      url: { enable: true },
      cssModules: { enable: false },
    },
  },
});
