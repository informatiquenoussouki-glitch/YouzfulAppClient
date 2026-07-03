/* eslint-disable prettier/prettier */
import Toast from 'react-native-toast-message';
import {userConstants} from '../constants/user.constants';
export function request(user) {
  return {type: userConstants.LOGIN_REQUEST, user};
}
export function success(user, token) {
  return {type: userConstants.LOGIN_SUCCESS, payload: {user, token}};
}
export function failure(error) {
  return {type: userConstants.LOGIN_FAILURE, error};
}
export function updateUser(user) {
  return {
    type: userConstants.UPDATE_USER_DATA,
    payload: user,
  };
}
export function updateCard(card) {
  return {
    type: userConstants.UPDATE_CARD,
    payload: card,
  };
}
export function deleteCard() {
  return {
    type: userConstants.DELETE_CARD,
  };
}
export function ChangeColor(color) {
  return {type: userConstants.UPDATE_COLOR, payload: color};
}
export function Disconnect() {
  return {type: userConstants.DISCONNECT};
}
