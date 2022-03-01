import axios from '@/utils/fetch';

const base = '/oauth2'

export const listAll = () => {
    return axios.get(base + "/apps")
}

export const authorizationUrl = (id) => {
    return axios.get(base + "/authorization/"+id)
}