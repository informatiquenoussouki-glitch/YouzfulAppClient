import Toast from 'react-native-toast-message';
import axios from 'axios';
import {RestaurantConstants} from '../constants/restaurant.constants';

const initialState = {
  ville: "",
  ville_id: null, // ✅ nouveau
  adress: "",
  plats: [],
  storeid: null,
  totalprice: 0,
  commission: 0,
  currencies: [],
  isLoading: false,
};




// ✅ Action : enregistrer le nom de la ville
export const setCityR = (ville) => ({
  type: RestaurantConstants.SET_CITY,
  payload: ville, // juste le nom
});

// ✅ Action : enregistrer l'adresse
export const setAddress = (adress) => ({
  type: RestaurantConstants.SET_ADDRESS,
  payload: adress,
});
export function setCities(cities) {
  return {
    type: RestaurantConstants.SET_CITIES,
    payload: cities,
  };
}
export function setDateInfo(id, plat) {
  return {
    type: RestaurantConstants.SET_DATEINFO,
    payload: {id, plat},
  };
}
export function updatePrice(price) {
  return {
    type: RestaurantConstants.UPDATE_PRICE,
    payload: price,
  };
}
export function updateQnt(qte, id, price) {
  return {
    type: RestaurantConstants.UPDATE_QTE,
    payload: {qte, id, price},
  };
}
export function deleteprod(id) {
  return {
    type: RestaurantConstants.DELETE_PROD,
    payload: id,
  };
}
export function resetPanel() {
  return {
    type: RestaurantConstants.RESET_PANEL,
    payload: null,
  };
}
export function setCommission(commission) {
  return {
    type: RestaurantConstants.SET_COMMISSION,
    payload: commission,
  };
}
export function setCurrenciesR(currencies) {
  return {
    type: RestaurantConstants.SET_CURRENCIES,
    payload: currencies,
  };
}
export function TransactionSuccess(transaction) {
  return {
    type: RestaurantConstants.TRANSACTION_SUCCESS,
    payload: transaction,
  };
}
export function BinificiarySuccess(banificiaries) {
  return {
    type: RestaurantConstants.TRANSACTION_BINFICIARY_SUCCESS,
    payload: banificiaries,
  };
}

export function Binificiary(token, id) {
  return dispatch => {
    dispatch({type: RestaurantConstants.ISLOADING});
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
        dispatch({type: RestaurantConstants.NOT_ISLOADING});
      })
      .catch(err => {
        Toast.show({
          text1: 'error',
          text2: err.toString(),
          type: 'error',
          position: 'bottom',
        });
        dispatch({type: RestaurantConstants.NOT_ISLOADING});
        return null;
      });
  };
}
