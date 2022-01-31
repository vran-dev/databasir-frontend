import axios from '@/utils/fetch';

const base = '/api/v1.0'

export const getOneByProjectId = (projectId, parameters) => {
    return axios.get(base + '/projects/'+projectId+'/documents', {
        params: parameters
    })
}

export const syncByProjectId = (projectId) => {
    return axios.post(base + "/projects/"+projectId+"/documents")
}

export const getVersionByProjectId =(projectId, parameters) => {
    return axios.get(base + "/projects/"+projectId+"/document_versions", {
        params: parameters
    })
}
