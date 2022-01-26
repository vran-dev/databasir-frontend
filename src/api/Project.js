import axios from '@/utils/fetch';

const base = '/api/v1.0/projects'

export const listProjects = (parameters) => {
    return axios.get(base, {
        params: parameters
    })
}

export const getProjectById = (id) => {
    return axios.get(base + "/" + id)
}

export const createOrUpdateProject = (request) => {
    if (request.id) {
        return updateProject(request)
    } else {
        return createProject(request)
    }
}

export const createProject = (request) => {
   return axios.post(base, request);
}

export const testConnection = (request) => {
    return axios.post(base + '/test_connection', request)
}


const groupProjectBase = '/api/v1.0/groups'


export const updateProject = (request) => {
   return axios.patch(groupProjectBase +'/'+request.groupId+'/projects', request);
}

export const deleteProjectById = (groupId, id) => {
    return axios.delete(groupProjectBase + '/' +groupId +'/projects/' + id);
}
