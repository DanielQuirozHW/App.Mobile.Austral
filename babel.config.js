// Las variables de entorno se inyectan en la compilación con react-native-dotenv.
// Se leen como process.env.NOMBRE (ver src/config/env.ts). Los valores viven solo en el .env local.
// api.cache(false) lo pide la documentación del plugin para que los cambios del .env se tomen.
// Después de crear o cambiar el .env hay que reiniciar Metro con --reset-cache.
module.exports = function (api) {
  api.cache(false);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
        },
      ],
      // Reanimated 4: el plugin de worklets va SIEMPRE último.
      'react-native-worklets/plugin',
    ],
  };
};
