import {GuideConstants} from '../constants/guide.constants';
export function setCityG(city, id) {
  return {
    type: GuideConstants.SET_CITY,
    payload: {city, id},
  };
}
export function setCities(cities) {
  return {
    type: GuideConstants.SET_CITIES,
    payload: cities,
  };
}
export function setFirstInfo(langs, withCar, nbrpersonne, typevisites) {
  return {
    type: GuideConstants.SET_FIRSTINFO,
    payload: {langs, withCar, nbrpersonne, typevisites},
  };
}
export const setFinalInfo = (
  date,
  time,
  adress,
  ville,
  title,
  id,
  duree,
  typevisite,
  description,
  sexe,
  Price
) => ({
  type: GuideConstants.SET_FINALINFO,
  payload: {
    date,
    time,
    adress,
    ville,
    title,
    id,
    duree,
    typevisite,
    description,   // 🔥 description envoyée correctement !
    sexe,
    Price,
  },
});

export function setGlobalSettings(data) {
  return {
    type: GuideConstants.SET_GLOBAL_SETTING,
    payload: data,
  };
}
