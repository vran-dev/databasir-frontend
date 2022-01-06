import { createStore } from 'vuex'

const store = createStore({
    state() {
        return {
            user: {
                nickname: null,
                usernmae: null,
                email: null,
            }
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