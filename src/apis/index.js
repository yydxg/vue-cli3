/**
 * [ajax methods]
 * @author Will on 2019/01/09.
 */

 import axios from 'axios';

 const get = (url, arg, cfg = {}) => axios.get(url, {
   params: {
     t: new Date().getTime(),
     ...arg,
   },
   headers: cfg,
 });
 
 const post = (url, arg, cfg = {}) => axios.post(url, arg, {
   headers: cfg,
 });
 
 const put = (url, arg, cfg = {}) => axios.put(url, arg, {
   headers: cfg,
 });
 
 const del = (url, arg, cfg = {}) => axios.delete(url, {
   params: arg,
   headers: cfg,
 });
 
 const postForm = (url, arg) => {
   const formData = new FormData();
   if (arg) {
     Object.keys(arg).forEach((k) => formData.append(k, arg[k]));
   }
   return axios.post(url, formData, {
     'Content-Type': 'multipart/form-data',
   });
 };
 
 const postJson = (url, arg) => axios.post(url, arg, {
   headers: {
     'Content-type': 'application/json;charset=UTF-8',
   },
 });
 
 const postBlob = (url, arg) => axios.post(url, arg, {
   responseType: 'blob',
 });
 
 const postJsonBlob = (url, arg, cfg) => axios.post(url, arg, {
   headers: {
     'Content-type': 'application/json;charset=UTF-8',
     Accept: 'application/octet-stream',
     ...cfg,
   },
   responseType: 'blob',
 });
 
 const getBlob = (url, arg) => axios.get(url, {
   params: arg,
   responseType: 'blob',
 });
 
 export default {
   get,
   post,
   put,
   del,
   postForm,
   postJson,
   postBlob,
   postJsonBlob,
   getBlob,
 };