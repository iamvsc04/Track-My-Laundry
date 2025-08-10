import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const registerUser = (data) =>
  axios.post(`${API_BASE}/auth/register`, data);

export const loginUser = async (data) => {
  return axios.post(`${API_BASE}/auth/login`, data);
};

export const getOrders = (token) =>
  axios.get(`${API_BASE}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createOrderWithNfc = (token, data) =>
  axios.post(`${API_BASE}/orders/nfc-invoke`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const completeOrder = (token, id) =>
  axios.patch(
    `${API_BASE}/orders/${id}/complete`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const updateOrderStatus = (token, id, data) =>
  axios.patch(`${API_BASE}/orders/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
