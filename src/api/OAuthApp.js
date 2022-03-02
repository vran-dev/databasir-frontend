import axios from '@/utils/fetch';

const base = '/oauth2'

export const listAll = () => {
    return axios.get(base + "/apps")
}

export const authorizationUrl = (id, params) => {
    return axios.get(base + "/authorization/"+id, {
        params: params
    })
}

const apiBase = "/api/v1.0/oauth2_apps"

export const pageList = (pageQuery) => {
    return axios.get(apiBase , {
        params: pageQuery
    })
}

export const deleteById = (id) => {
    return axios.delete(apiBase+'/'+id)
}

export const getById = (id) => {
    return axios.get(apiBase+'/'+id)
}

export const createApp = (body) => {
    return axios.post(apiBase, body)
}

export const updateApp = (body) => {
    return axios.patch(apiBase, body)
}