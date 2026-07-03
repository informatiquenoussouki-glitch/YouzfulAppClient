import { babySettingConstants } from '../constants/babySitting.constants';

const initialState = {
  idUser: '',
  title: '',
  adress: '',
  ville: '',
  date: '',
  time: '',
  duree: '',
  nbrenfants: 0, // Initialisé à 0 pour une gestion numérique propre
  totalprice: '',
  skill: [],
  languages: [],
  childs: [],
  commission: '',
  currencies: [],
  beneficiaries: [], // Corrigé : 'banificiaries' -> 'beneficiaries'
  transaction: null,
  motif: '',
  beneficiary: '',
  amountD: 100,
  amountConversion: '',
  pointCollect: '',
};

export function babySitting(state = initialState, action) {
  switch (action.type) {
    
    // Enregistrement simultané des compétences, langues et de la ville
    case babySettingConstants.SET_SKILL_LANG:
      return {
        ...state,
        skill: action.payload.skill,
        languages: action.payload.languages,
        ville: action.payload.ville,
      };

    // Enregistrement de la ville uniquement
    case babySettingConstants.SET_CITY:
      return {
        ...state,
        ville: action.payload,
      };

    // Mise à jour alternative des compétences, langues et ville
    case babySettingConstants.SET_SKILL:
      return {
        ...state,
        skill: action.payload.skills,
        languages: action.payload.langs,
        ville: action.payload.ville,
      };

    // ÉTAPE Dynamique : Enregistrement des enfants et de leur nombre (Étape 2)
    case babySettingConstants.SET_CHILDREN:
      return {
        ...state,
        childs: action.payload.children,
        nbrenfants: action.payload.nbrenfants,
      };

    // Enregistrement des détails de date, heure et adresse de la garde
    case babySettingConstants.SET_DATEINFO:
      return {
        ...state,
        title: action.payload.title,
        adress: action.payload.adress,
        ville: action.payload.ville,
        date: action.payload.date,
        time: action.payload.time,
        idUser: action.payload.id,
        duree: action.payload.duree,
        totalprice: action.payload.Price,
      };

    // Mise à jour du prix total calculé
    case babySettingConstants.SET_PRICE:
      return {
        ...state,
        totalprice: action.payload,
      };

    // Enregistrement des frais de commission
    case babySettingConstants.SET_COMMISSION:
      return {
        ...state,
        commission: action.payload,
      };

    // Configuration des devises disponibles
    case babySettingConstants.SET_CURRENCIES:
      return {
        ...state,
        currencies: action.payload,
      };

    // Réussite du paiement / de la transaction finale
    case babySettingConstants.TRANSACTION_SUCCESS:
      return {
        ...state,
        motif: '',
        beneficiary: '',
        amountD: 100,
        amountConversion: '',
        pointCollect: '',
        currencies: [],
        transaction: action.payload,
      };

    // Récupération réussie de la liste des bénéficiaires
    // Note : Alignez bien cette clé avec votre constante (ex: TRANSACTION_BENEFICIARY_SUCCESS)
    case babySettingConstants.TRANSACTION_BINFICIARY_SUCCESS:
      return {
        ...state,
        beneficiaries: action.payload,
      };

    default:
      return state;
  }
}