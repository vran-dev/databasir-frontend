import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as Icons from '@element-plus/icons'
import 'element-plus/dist/index.css'
import router from './router'
import store from './store'
import App from './App.vue'
import { user } from './utils/auth'

const app = createApp(App)
Object.keys(Icons).forEach(key => {
    app.component(key, Icons[key])
})
app.directive('require-roles', {
    mounted(el, binding) {
        const roles = binding.value
        console.log(user.hasAnyRoles(roles))
        if (!user.hasAnyRoles(roles)) {
            el.parentNode && el.parentNode.removeChild(el)
        }
    },
    // updated(el, binding) {
    //     const roles = binding.value
    //     console.log(user.hasAnyRoles(roles))
    //     if (!user.hasAnyRoles(roles)) {
    //         el.parentNode && el.parentNode.removeChild(el)
    //     }
    // }
})
app.use(store)
app.use(ElementPlus)
app.use(router)
app.mount('#app')

