import axios from '@/utils/fetch';

const base = '/api/v1.0/database_types'

const simples = '/api/v1.0/simple_database_types'

export const deleteDatabaseType = (id) => {
    return axios.delete(base+"/"+id)
}

export const createDatabaseType = (body) => {
    return axios.post(base, body)
}

export const updateDatabaseType = (body) => {
    return axios.patch(base, body)
}

export const listSimples = () => {
    return axios.get(simples)
}

export const listPage = (filter) => {
    return axios.get(base, {
        params: filter
    })
}

export const resolveDriverClassName = (request) => {
    return axios.post(base + "/driver_class_name", request)
}
