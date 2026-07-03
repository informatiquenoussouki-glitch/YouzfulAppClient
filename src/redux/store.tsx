import { thunk } from 'redux-thunk'; // Correction de l'import (syntaxe nommée)
import { combineReducers, createStore, applyMiddleware } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';

import { userReducer } from './reducer/user.reducer';
import { babySitting } from './reducer/babySitting.reducer';
import { globalSetting } from './reducer/globalSetting.reducer';
import { GuideReducer } from './reducer/guide.reducer';
import { RestaurantReducer } from './reducer/restaurant.reducer';

const rootReducer = combineReducers({
  userReducer,
  babySitting,
  GuideReducer,
  RestaurantReducer,
  globalSetting
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // On garde tes réglages de blacklist
  blacklist: ['babySitting', 'globalSetting', 'GuideReducer', 'RestaurantReducer'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Utilisation de 'thunk' au lieu de 'thunkMiddleware' pour éviter le 'undefined'
const store = createStore(
  persistedReducer,
  applyMiddleware(thunk),
);

const persistor = persistStore(store);

export type AppState = ReturnType<typeof rootReducer>;
export { store, persistor };
