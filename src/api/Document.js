import axios from '@/utils/fetch';

const base = '/api/v1.0'

export const getOneByProjectId = (proejctId, parameters) => {
    return axios.get(base + '/projects/'+proejctId+'/documents', {
        params: parameters
    })
}

export const syncByProjectId = (proejctId) => {
    return axios.post(base + "/projects/"+proejctId+"/documents")
}

export const getVersionByProjectId =(proejctId, parameters) => {
    return axios.get(base + "/projects/"+proejctId+"/document_versions", {
        params: parameters
    })
}
