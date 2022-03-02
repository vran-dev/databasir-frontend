import { createStore } from 'vuex'
import { user } from '../utils/auth'

const store = createStore({
    state() {
        const data =  {
            user: {
                nickname: null,
                usernmae: null,
                email: null,
                avatar: null,
            },
            groupListActiveTab: null,
            menu: {
                isCollapse: true,
            }
        }
        const loginData = user.loadUserLoginData()
        if (loginData) {
            data.user.nickname = loginData.nickname
            data.user.usernmae = loginData.usernmae
            data.user.email = loginData.email
            data.user.avatar = loginData.avatar
        }
        return data;
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
            if (param.avatar) {
                state.user.avatar = param.avatar
            }
        },
        foldMenu(state) {
            state.menu.isCollapse = true
        },
        expandMenu(state) {
            state.menu.isCollapse = false
        },
        switchGroupListActiveTab(state, groupListActiveTab) {
            if (groupListActiveTab) {
                state.groupListActiveTab = groupListActiveTab
            }
        }
    }
})

export default store