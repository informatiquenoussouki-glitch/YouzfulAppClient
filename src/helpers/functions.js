import {Dimensions} from 'react-native';

const baselineHeight = 780;
const baselineWidth = 400;
const {height, width} = Dimensions.get('window');

const scaleSize = (height + width) / 2 / ((baselineHeight + baselineWidth) / 2);

export function scale(size) {
  return Math.floor(scaleSize * size * 0.99);
}
export const COLOR = {
  primary1: '#1034A6',
  primary2: '#2183AC',
  primary3: '#FF5C00',
  primary4: '#8CC63F',
  arrow:'#2E2E2E',
  gris:'#000000' ,
  blanc:'#fff'
};
