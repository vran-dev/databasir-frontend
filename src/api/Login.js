import axios from '@/utils/fetch';

export const login = (form) => {
    const data = new FormData();
    data.append('username', form.username);
    data.append('password', form.password);
    return axios.post('/login', data)
}

export const oauth2Login = (registrationId, parameters) => {
    return axios.get('/oauth2/login/'+registrationId, {
        params: parameters
    })
}

export const logout = () => {
    return axios.get('/logout')
}

export const loginInfo = () => {
    return axios.get('/login_info')
}

export const refreshAccessToken = (refreshToken) => {
    return axios.post('/access_tokens', {
        refreshToken: refreshToken
    })
}