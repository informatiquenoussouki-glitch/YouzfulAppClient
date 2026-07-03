import { babySettingConstants } from '../constants/babySitting.constants';

const initialState = {
  THBS: '1',
  THG: '1',
  NBME: '1',
  NMP: '1',
  AMIN: '1',
  AMAX: '1',
  cities: [],
  history: [],
  isLoading: false,
};

export function globalSetting(state = initialState, action) {
  switch (action.type) {
    
    // Gestion du chargement
    case babySettingConstants.ISLOADING:
      return { ...state, isLoading: true };
      
    case babySettingConstants.NOT_ISLOADING:
      return { ...state, isLoading: false };

    // Chargement dynamique des paramètres globaux
    case babySettingConstants.SET_GLOBAL_SETTING: {
      const payload = action.payload;

      // ✅ RECHERCHE DYNAMIQUE PAR CODE (Basée sur votre colonne BDD 'code')
      if (Array.isArray(payload) && payload.length > 0) {
        // On vérifie si l'API utilise 'code' ou 'key' pour rester compatible
        const hasCodeField = payload[0]?.code !== undefined;

        const findValue = (keyName, defaultValue) => {
          const param = payload.find(item => {
            const currentField = hasCodeField ? item.code : item.key;
            return currentField === keyName;
          });
          return param ? param.value : defaultValue;
        };

        return {
          ...state,
          THBS: findValue('THBS', state.THBS),
          THG: findValue('THG', state.THG),
          NBME: findValue('NBME', state.NBME),
          NMP: findValue('NMP', state.NMP),
          AMIN: findValue('AMIN', state.AMIN),
          AMAX: findValue('AMAX', state.AMAX),
        };
      }

      // Si le payload est déjà un objet direct { AMIN: "2", AMAX: "9", ... }
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        return {
          ...state,
          THBS: payload.THBS ?? state.THBS,
          THG: payload.THG ?? state.THG,
          NBME: payload.NBME ?? state.NBME,
          NMP: payload.NMP ?? state.NMP,
          AMIN: payload.AMIN ?? state.AMIN,
          AMAX: payload.AMAX ?? state.AMAX,
        };
      }

      return state;
    }

    // Chargement des villes disponibles
    case babySettingConstants.SET_CITIES:
      return {
        ...state,
        cities: action.payload,
      };

    // Historique des demandes
    case babySettingConstants.SET_HISTORY:
      return {
        ...state,
        history: action.payload,
      };

    default:
      return state;
  }
}