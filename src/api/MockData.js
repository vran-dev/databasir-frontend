import axios from '@/utils/fetch';

const base = '/api/v1.0'

export const listRules = (groupId, projectId, query) => {
    return axios.get(base +"/groups/" + groupId + "/projects/" + projectId +"/mock_rules" , {
        params: query
    })
}

export const saveTableRules = (groupId, projectId, tableId,  rule) => {
    return axios.post(base +"/groups/" + groupId + "/projects/" + projectId +"/tables/"+tableId+"/mock_rules", rule)
}

export const getMockSql = (groupId, projectId, query) => {
    return axios.get(base +"/groups/" + groupId + "/projects/" + projectId +"/mock_data/sql" , {
        params: query
    })
}