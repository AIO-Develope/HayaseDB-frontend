import axios from 'axios';
import { getToken } from './authService';

const apiClient = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
    timeout: 10000
});

const handleAxiosError = (error) => {
    if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again later.';
    }
    if (error.code === 'ECONNREFUSED') {
        return 'Unable to connect to the server.';
    }
    return error.response?.data?.message || 'An error occurred. Please try again.';
};

const getAuthHeader = () => {
    const token = getToken();
    if (!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};

export const updateUserCredentials = async (currentPassword, newPassword, username, email) => {
    try {
        const body = {
            newUsername: username,
            currentPassword,
            newPassword,
            newEmail: email
        };

        console.log('Sending request with body:', body);

        const response = await apiClient.post('/user/edit', body, {
            headers: getAuthHeader()
        });

        return response.data;
    } catch (error) {
        throw new Error(handleAxiosError(error));
    }
};
