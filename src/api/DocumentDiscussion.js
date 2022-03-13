import axios from '@/utils/fetch';

const base = '/api/v1.0'

export const deleteDiscussion = (groupId, projectId, remarkId) => {
    return axios.delete(base + '/groups/' +groupId+'/projects/'+projectId+'/discussions/'+remarkId)
}

export const createDiscussion = (groupId, projectId, body) => {
    return axios.post(base + '/groups/' +groupId+'/projects/'+projectId+'/discussions', body)
}

export const listDiscussions = (groupId, projectId, parameters) => {
    return axios.get(base + '/groups/' +groupId+'/projects/'+projectId+'/discussions', {
        params: parameters
    })
}

