const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Configuración de Metro (la base que trae la plantilla de React Native).
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
