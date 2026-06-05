import { http } from './http.js';

export const getRooms = () => http.get('/rooms');
export const getRoom = (id) => http.get(`/rooms/${id}`);
export const createRoom = (data) => http.post('/rooms', data);
export const updateRoom = (id, data) => http.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => http.delete(`/rooms/${id}`);
