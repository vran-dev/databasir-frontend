import axios from '@/utils/fetch';

export const login = (form) => {
    const data = new FormData();
    data.append('username', form.username);
    data.append('password', form.password);
    return axios.post('/login', data)
}

export const logout = () => {
    return axios.get('/logout')
}

export const refreshAccessToken = (refreshToken) => {
    return axios.post('/access_tokens', {
        refreshToken: refreshToken
    })
}