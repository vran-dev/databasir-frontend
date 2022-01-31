import axios from '@/utils/fetch';

const base = '/api/v1.0'

export const deleteRemark = (groupId, projectId, remarkId) => {
    return axios.delete(base + '/groups/' +groupId+'/projects/'+projectId+'/remarks/'+remarkId)
}

export const createRemark = (groupId, projectId, body) => {
    return axios.post(base + '/groups/' +groupId+'/projects/'+projectId+'/remarks', body)
}

export const listRemarks = (groupId, projectId, parameters) => {
    return axios.get(base + '/groups/' +groupId+'/projects/'+projectId+'/remarks', {
        params: parameters
    })
}

