const accessTokenKey = 'accessToken'
const accessTokenExpireAtKey = 'accessTokenExpireAt'
const userLoginDataKey = 'userLoginData'

export const token = {
    hasAccessToken() {
        const accessToken = this.loadAccessToken()
        return accessToken
    },

    hasValidAccessToken() {
        const accessToken = this.loadAccessToken()
        const expireAt = window.localStorage.getItem(accessTokenExpireAtKey)
        if (!accessToken || !expireAt) {
            console.log('warn: not found accessToken and expireAt key')
            return false
        }
        return expireAt > new Date().getTime()
    },

    saveAccessToken(token, tokenExpireAt) {
        window.localStorage.setItem(accessTokenKey, token)
        window.localStorage.setItem(accessTokenExpireAtKey, tokenExpireAt)
    },

    loadAccessToken() {
        return window.localStorage.getItem(accessTokenKey)
    }
}

export const user = {

    saveUserLoginData(userLoginData) {
        window.localStorage.setItem(accessTokenKey, userLoginData.accessToken)
        window.localStorage.setItem(accessTokenExpireAtKey, userLoginData.accessTokenExpireAt)
        window.localStorage.setItem(userLoginDataKey, JSON.stringify(userLoginData))
    },

    removeUserLoginData() {
        window.localStorage.removeItem(userLoginDataKey)
        window.localStorage.removeItem(accessTokenKey)
        window.localStorage.removeItem(accessTokenExpireAtKey)
    },

    loadUserLoginData() {
        if (!window.localStorage.getItem(userLoginDataKey)) {
            return null;
        } else {
            const data =window.localStorage.getItem(userLoginDataKey)
            return JSON.parse(data)
        }
    },

    hasAnyRoles(roles) {
        const data = window.localStorage.getItem(userLoginDataKey)
        if (data == null) {
            return false
        }
        const user = JSON.parse(data)
        return user
        .roles
        .map(role => {
            if (role.groupId) {
                return role.role + '?groupId=' + role.groupId
            } else {
                return role.role
            }
        })
        .some(exists => roles.some(expected => expected == exists))
    },

    getRefreshToken() {
        const data = window.localStorage.getItem(userLoginDataKey)
        if (data == null) {
            return null
        }
        const user = JSON.parse(data)
        return user.refreshToken
    }
}
