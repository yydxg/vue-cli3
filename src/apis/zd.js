import api from './index';

const feature = '/big-screen-zd';

// 【零售莲花 map3d】 中国区下大区盈亏
export const getLotusChinaMap = (arg) => api.get(`${feature}/zdlotus/getLotusChinaMap`, arg);
// 【零售莲花 map3d】 大区省店
export const getLotusRegionMap = (provCode) => api.get(`${feature}/zdlotus/getLotusRegionMap?provCode=${provCode}`);
// 【零售莲花 5km】 五公里客户
export const getLotusCust5KM = (provCode) => api.get(`${feature}/zdlotus/getLotusCust5KM?shopCode=${provCode}`);
// 【零售莲花 门店】 
export const getShopFloor = (provCode) => api.get(`${feature}/zdlotus/getShopFloor?shopCode=${provCode}&type=0`);
export const getShopFloorFlag = (provCode) => api.get(`${feature}/zdlotus/getShopFloor?shopCodeFlag=${provCode}&type=1`);

// 零售莲花
export const getNoticeInfo = (arg) => api.get(`${feature}/zdlotus/getNoticeInfo`, arg);
