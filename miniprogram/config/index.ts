import { defineConfig, type UserConfigExport } from '@tarojs/cli';

export default defineConfig<'webpack5'>(async () => {
  const config: UserConfigExport<'webpack5'> = {
    projectName: 'fitlean-tracker-miniprogram',
    date: '2026-05-14',
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2,
      375: 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    framework: 'react',
    compiler: 'webpack5',
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.extensions.add('.ts').add('.tsx');
      },
    },
  };
  return config;
});
