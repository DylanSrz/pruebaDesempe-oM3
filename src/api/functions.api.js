import { http } from './http.js';

export const getFunctions = () => http.get('/functions');
export const getFunction = (id) => http.get(`/functions/${id}`);
export const createFunction = (data) => http.post('/functions', data);
export const updateFunction = (id, data) => http.put(`/functions/${id}`, data);
export const patchFunction = (id, data) => http.patch(`/functions/${id}`, data);
export const deleteFunction = (id) => http.delete(`/functions/${id}`);
