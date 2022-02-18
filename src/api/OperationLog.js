import axios from '@/utils/fetch';

const base = '/api/v1.0/operation_logs'

export const listOperationLogs = (pageQuery) => {
    return axios.get(base, {
        params: pageQuery
    })
}
