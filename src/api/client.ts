import axios from 'axios';

// Render 배포 주소
const BASE_URL = 'https://safezone-h0u2.onrender.com';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;