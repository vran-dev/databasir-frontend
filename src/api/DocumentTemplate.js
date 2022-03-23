import axios from '@/utils/fetch';

const base = '/api/v1.0'

export const listProperties = () => {
    return axios.get(base + '/document_template/properties')
}

export const updateProperties = (body) => {
    return axios.patch(base + '/document_template/properties', body)
}
