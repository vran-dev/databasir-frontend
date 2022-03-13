import axios from '@/utils/fetch';

const base = '/api/v1.0'

export const saveDescription = (groupId, projectId, body) => {
    return axios.post(base + '/groups/' +groupId+'/projects/'+projectId+'/descriptions', body)
}

