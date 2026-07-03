import { GuideConstants } from '../constants/guide.constants';

const initialState = {
  title: '',
  adress: '',
  ville: '',
  cityid: null,
  withCar: '',
  sexe: '',
  date: '',
  time: '',
  duree: '',
  nbrpersonne: '',
  totalprice: '',
  typevisites: '',
  languages: [],
  childs: [],
  nbrenfants: 0,
  idUser: null,
  description: '',
  commission: 0,
  currencies: [],
  transaction: {},
  banificiaries: [],
};

export function GuideReducer(state = initialState, action) {
  // Sécurité : si action ou action.payload est nul, on évite le crash
  const payload = action?.payload;

  switch (action.type) {
    case GuideConstants.SET_CITY:
      return {
        ...state,
        ville: payload?.city || '',
        cityid: payload?.id || null,
      };

    case GuideConstants.SET_FIRSTINFO:
      return {
        ...state,
        withCar: payload?.withCar || '',
        languages: payload?.langs || [],
        nbrpersonne: payload?.nbrpersonne || '',
        typevisites: payload?.typevisites || '',
      };

    case GuideConstants.SET_CHILDREN:
      return {
        ...state,
        childs: payload?.children || [],
        nbrenfants: payload?.nbrenfants || 0,
      };

    case GuideConstants.SET_FINALINFO:
      return {
        ...state,
        date: payload?.date || '',
        time: payload?.time || '',
        adress: payload?.adress || '',
        ville: payload?.ville || '',
        title: payload?.title || '',
        idUser: payload?.id || null, // Correction ici : utilise payload?.id
        duree: payload?.duree || '',
        typevisite: payload?.typevisite || '',
        description: payload?.description || '',
        sexe: payload?.sexe || '',
        totalprice: payload?.Price || '',
      };

    case GuideConstants.SET_PRICE:
      return {
        ...state,
        totalprice: payload !== undefined ? payload : '',
      };

    case GuideConstants.SET_COMMISSION:
      return {
        ...state,
        commission: payload !== undefined ? payload : 0,
      };

    case GuideConstants.SET_CURRENCIES:
      return {
        ...state,
        currencies: payload || [],
      };

    case GuideConstants.TRANSACTION_SUCCESS:
      return {
        ...state,
        motif: '',
        beneficiary: '',
        amountD: 100,
        amountConversion: '',
        pointCollect: '',
        currencies: [],
        transaction: payload || {},
      };

    case GuideConstants.TRANSACTION_BINFICIARY_SUCCESS:
      return {
        ...state,
        banificiaries: payload || [],
      };

    default:
      // CRUCIAL : Toujours retourner le state actuel si aucune action ne correspond
      return state;
  }
}