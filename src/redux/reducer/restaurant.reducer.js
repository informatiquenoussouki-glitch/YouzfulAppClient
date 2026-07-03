import { RestaurantConstants } from '../constants/restaurant.constants';

const initialState = {
  adress: '',
  comment: '',
  ville: '',
  totalprice: '',
  plats: [],
  storeid: null,
};

export function RestaurantReducer(state = initialState, action) {
  // Sécurité globale pour le payload
  const payload = action?.payload;

  switch (action.type) {
    case RestaurantConstants.SET_CITY:
      return {
        ...state,
        ville: payload,
      };

    case RestaurantConstants.SET_DATEINFO: {
      const platDetails = payload?.plat;
      const currentStoreId = payload?.id;

      // Protection : Si les données du plat sont absentes, on ne fait rien
      if (!platDetails || !platDetails.id) {
        return state;
      }

      // On vérifie si le plat est déjà présent
      const isAlreadyInPanier = state.plats.find(item => item.id === platDetails.id);

      if (isAlreadyInPanier) {
        // ✅ MISE À JOUR : On remplace l'ancien plat par le nouveau (via map)
        const updatedPlats = state.plats.map(item =>
          item.id === platDetails.id ? platDetails : item
        );
        return {
          ...state,
          storeid: currentStoreId || state.storeid,
          plats: updatedPlats,
        };
      } else {
        // ✅ AJOUT : On ajoute le nouveau plat au tableau existant
        return {
          ...state,
          storeid: currentStoreId || state.storeid,
          plats: [...state.plats, platDetails],
        };
      }
    }

    case RestaurantConstants.SET_ADDRESS:
      return {
        ...state,
        adress: payload 
      };

    case RestaurantConstants.UPDATE_QTE: {
      if (!payload?.id) return state;

      // Mise à jour de la quantité de façon immuable
      const platsWithNewQte = state.plats.map(item => {
        if (item.id === payload.id) {
          return { ...item, qte: payload.qte, price: payload.price };
        }
        return item;
      });

      return { 
        ...state, 
        plats: platsWithNewQte 
      };
    }

    case RestaurantConstants.DELETE_PROD: {
      // Suppression via filter (crée un nouveau tableau sans l'élément)
      return {
        ...state,
        plats: state.plats.filter(item => item.id !== payload),
      };
    }

    case RestaurantConstants.UPDATE_PRICE:
      return {
        ...state,
        totalprice: payload,
      };

    case RestaurantConstants.RESET_PANEL:
      return { ...initialState };

    case RestaurantConstants.TRANSACTION_SUCCESS:
      return {
        ...initialState,
        ville: state.ville, // On conserve la ville pour la prochaine commande
      };

    default:
      return state;
  }
}