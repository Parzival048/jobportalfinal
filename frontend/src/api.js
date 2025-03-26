import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust this for production
});

// You can add interceptors for token handling if needed
export default API;
