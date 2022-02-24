import axios from '@/utils/fetch';

const base = '/api/v1.0/user_projects/favorites'

export const listFavorites = (pageQuery) => {
    return axios.get(base, {
        params: pageQuery
    })
}

export const removeFavorite = (projectId) => {
    return axios.delete(base + "/" + projectId)
}

export const addFavorite = (projectId) => {
    return axios.post(base +'/' + projectId)
}