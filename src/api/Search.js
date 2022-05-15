import axios from '@/utils/fetch';

const base = "/api/v1.0/search"

export const query = (keyword) => {
    return axios.get(base, {
        params: keyword
    })
}