import axios from 'axios';
export const baseUrl = 'https://api.youz-ful.com';
const instance = axios.create({
    baseURL: 'https://api.youz-ful.com'
});
//instance.defaults.headers.common['Authorization'] = 'AUTH TOKEN FROM INSTANCE';
export default instance;