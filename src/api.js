const productionApiUrl = 'https://livecodex-backend-nb40.onrender.com';
const configuredApiUrl = process.env.REACT_APP_API_URL;

export const API_BASE_URL = (configuredApiUrl
	|| (process.env.NODE_ENV === 'development' ? '' : productionApiUrl))
	.replace(/\/+$/, '');

export const SOCKET_URL = configuredApiUrl
	? API_BASE_URL
	: process.env.NODE_ENV === 'development'
		? 'http://localhost:5000'
		: API_BASE_URL;

export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
