import axios from '@/utils/fetch';

const base = '/api/v1.0/groups'

export const listGroups = (pageQuery) => {
    return axios.get(base, {
        params: pageQuery
    })
}

export const getGroup= (id) => {
    return axios.get(base + "/" + id)
}

export const createOrUpdateGroup = (body) => {
    if (body.id && body.id != null) {
        return updateGroup(body)
    } else {
        return createGroup(body)
    }
}

export const createGroup = (body) => {
    return axios.post(base, body)
}

export const updateGroup = (body) => {
    return axios.patch(base, body)
}

export const deleteGroup = (id) => {
    return axios.delete(base + '/' + id)
}

export const listGroupMembers = (groupId, pageQuery) => {
    return axios.get(base + '/' + groupId + '/members', {
        params: pageQuery
    })
}

export const addGroupMember = (groupId, body) => {
    return axios.post(base + '/' + groupId + '/members', body)
}

export const removeGroupMember = (groupId, userId) => {
    return axios.delete(base +'/'+groupId+'/members/'+userId)
}

export const updateGroupMemberRole = (groupId, userId, role) => {
    const body = {
        role: role
    }
    return axios.patch(base +'/'+groupId+'/members/'+userId, body)
}





