import axios from '@/utils/fetch';

const base = '/api/v1.0/users'

export const listUsers = (pageQuery) => {
    return axios.get(base, {
        params: pageQuery
    })
}

export const enableUser = (userId) => {
    return axios.post(base+"/"+userId+"/enable")

}

export const disableUser = (userId) => {
    return axios.post(base+"/"+userId+"/disable")
}

export const getByUserId = (userId) => {
    return axios.get(base+"/"+userId)
}

export const deleteByUserId = (userId) => {
    return axios.delete(base+"/"+userId)
}

export const createUser = (request) => {
    return axios.post(base, request)
}

export const renewPassword = (id) => {
    return axios.post(base +'/' + id +'/renew_password')
}

export const addSysOwnerTo = (userId) => {
    return axios.post(base +'/' + userId +'/sys_owners')
}

export const removeSysOwnerFrom = (userId) => {
    return axios.delete(base +'/' + userId +'/sys_owners')
}

export const updatePassword = (userId, body) => {
    return axios.post(base +'/' + userId +'/password', body)
}

export const updateNickname = (userId, body) => {
    return axios.post(base +'/' + userId +'/nickname', body)
}