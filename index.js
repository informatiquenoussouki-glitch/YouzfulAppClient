/**
 * @format
 */
import { LogBox } from 'react-native';

// LE PATCH DOIT ÊTRE TOUT EN HAUT AVANT LES AUTRES IMPORTS
if (!global.ViewPropTypes) {
  Object.defineProperty(global, 'ViewPropTypes', {
    get() {
      return require('deprecated-react-native-prop-types').ViewPropTypes;
    },
    configurable: true,
    enumerable: true
  });
}

// Masquer les avertissements visuels
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Maintenant on charge le reste de l'application
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { enableScreens } from 'react-native-screens';

enableScreens(true);

AppRegistry.registerComponent(appName, () => App);