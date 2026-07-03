import Toast from 'react-native-toast-message';
import axios from 'axios';
import {babySettingConstants} from '../constants/babySitting.constants';
export function setCity(city) {
  return {
    type: babySettingConstants.SET_CITY,
    payload: city,
  };
}
export function setCities(cities) {
  return {
    type: babySettingConstants.SET_CITIES,
    payload: cities,
  };
}
export function setHistory(history) {
  return {
    type: babySettingConstants.SET_HISTORY,
    payload: history,
  };
}
export function setSkillLang(skill, languages, ville) {
  return {
    type: babySettingConstants.SET_SKILL_LANG, // ✅ la bonne constante
    payload: { skill, languages, ville },      // ✅ les bons noms + ajout ville
  };
}

export function setChildren(children, nbrenfants) {
  return {
    type: babySettingConstants.SET_CHILDREN,
    payload: {children, nbrenfants},
  };
}
export function setDateInfo(
  date,
  time,
  adress,
  ville,
  title,
  id,
  duree,
  Price,
) {
  return {
    type: babySettingConstants.SET_DATEINFO,
    payload: {date, time, adress, ville, title, id, duree, Price},
  };
}
export function setGlobalSettings(data) {
  return {
    type: babySettingConstants.SET_GLOBAL_SETTING,
    payload: data,
  };
}
export function setCommission(commission) {
  return {
    type: babySettingConstants.SET_COMMISSION,
    payload: commission,
  };
}
export function setCurrenciesR(currencies) {
  return {
    type: babySettingConstants.SET_CURRENCIES,
    payload: currencies,
  };
}
export function TransactionSuccess(transaction) {
  return {
    type: babySettingConstants.TRANSACTION_SUCCESS,
    payload: transaction,
  };
}
export function BinificiarySuccess(banificiaries) {
  return {
    type: babySettingConstants.TRANSACTION_BINFICIARY_SUCCESS,
    payload: banificiaries,
  };
}
export function Binificiary(token, id) {
  return dispatch => {
    dispatch({type: babySettingConstants.ISLOADING});
    return axios
      .get(
        `https://test.api.myeasytransfer.com/api/customers/${id}/beneficiaries`,
        {
          headers: {
            Authorization: token,
            accept: 'application/json',
          },
        },
      )
      .then(async response => {
        if (response.success === false) {
          Toast.show({
            text1: 'Erreur ',
            type: 'error',
            position: 'bottom',
          });
        } else {
          dispatch(BinificiarySuccess(response?.data?.beneficiaries));
        }
        dispatch({type: babySettingConstants.NOT_ISLOADING});
      })
      .catch(err => {
        Toast.show({
          text1: 'error',
          text2: err.toString(),
          type: 'error',
          position: 'bottom',
        });
        dispatch({type: babySettingConstants.NOT_ISLOADING});
        return null;
      });
  };
}
