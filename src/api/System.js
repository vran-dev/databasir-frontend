import axios from '@/utils/fetch';

const base = '/api/v1.0/settings'

export const getEmailSetting = () => {
    return axios.get(base+"/sys_email")
}

export const updateEmailSetting = (request) => {
    return axios.post(base+"/sys_email", request);
}