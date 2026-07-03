import {userConstants} from '../constants/user.constants';
import {COLOR} from '../../helpers/functions';
const initialState = {
  loggedIn: false,
  defaultColor: COLOR.primary1,
  isLoading: false,
  user: {},
  card: {
    card_number: '',
    cvc: '',
    expiry: '',
  },
  token: null,
};

export function userReducer(state = initialState, action) {
  switch (action.type) {
    case userConstants.LOGIN_REQUEST:
      return {
        isLoading: true,
      };
    case userConstants.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        defaultColor: COLOR.primary1,
        loggedIn: false,
      };
    case userConstants.DISCONNECT:
      return {
        loggedIn: false,
        defaultColor: COLOR.primary1,
        isLoading: false,
        user: {},
        token: null,
        card: {
          card_number: '',
          cvc: '',
          exp_month: '',
          exp_year: '',
        },
      };
    case userConstants.UPDATE_USER_DATA: {
      return {...state, user: action.payload};
    }
    case userConstants.UPDATE_COLOR: {
      return {...state, defaultColor: action.payload};
    }
    case userConstants.UPDATE_USER: {
      return {...state, user: action.payload};
    }
    case userConstants.UPDATE_CARD: {
      return {...state, card: action.payload};
    }
    case userConstants.DELETE_CARD: {
      return {...state, card: initialState.card};
    }
    case userConstants.LOGIN_FAILURE:
      return {user: {}, token: null, loggedIn: false};
    case userConstants.LOGOUT:
      return initialState;
    case userConstants.ISLOADING:
      return {...state, isLoading: true};
    case userConstants.NOT_ISLOADING:
      return {...state, isLoading: false};
    default:
      return state;
  }
}
