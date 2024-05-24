module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        extensions: [
          '.ios.js',
          '.android.js',
          '.ios.jsx',
          '.android.jsx',
          '.js',
          '.jsx',
          '.json',
          '.ts',
          '.tsx',
        ],
        root: ['.'],
        alias: {
          '@assets': './src/assets',
          '@components': './src/components',
          '@screens': './src/screens',
          '@utils': './src/utils',
          '@navigations': './src/navigations',
          '@lib': './src/lib',
          '@typings': './src/typings',
        },
      },
    ],
  ],
};
