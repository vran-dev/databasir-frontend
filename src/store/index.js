import { createStore } from 'vuex'
import { user } from '../utils/auth'

const store = createStore({
    state() {
        const data = user.loadUserLoginData()
        const userData = {
            nickname: null,
            usernmae: null,
            email: null,
        }
        if (data != null) {
            userData.nickname = data.nickname
            userData.usernmae = data.usernmae
            userData.email = data.email;
        }
        return {
            user: userData
        }
    },
    mutations: {
        userUpdate(state, param) {
            if (param.nickname) {
                state.user.nickname = param.nickname
            }
            if (param.usernmae) {
                state.user.usernmae = param.usernmae
            }
            if (param.email) {
                state.user.email = param.email
            }
        }
    }
})

export default store