import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as Icons from '@element-plus/icons'

import 'highlight.js/styles/stackoverflow-light.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import hljsVuePlugin from "@highlightjs/vue-plugin";

import 'element-plus/dist/index.css'
import router from './router'
import store from './store'
import App from './App.vue'
import { user } from './utils/auth'
import DatabaseIcon from './components/DatabaseIcon.vue'
import { VueClipboard } from '@soerenmartius/vue3-clipboard'

//  element icon
const app = createApp(App)
Object.keys(Icons).forEach(key => {
    app.component(key, Icons[key])
})
app.component('database-icon', DatabaseIcon)

// permission directive
app.directive('require-roles', {
    mounted(el, binding) {
        const roles = binding.value
        if (!user.hasAnyRoles(roles)) {
            el.parentNode && el.parentNode.removeChild(el)
        }
    },
})

// custom select directive
app.directive("select-more", {
    updated(el, binding) {
        const child = el.querySelector('.select-trigger');
        const id = child.getAttribute('aria-describedby');
        const poper = document.getElementById(id);
        const selector = poper.querySelector('.el-scrollbar .el-select-dropdown__wrap');
        selector.addEventListener('scroll', function () {
            const condition = this.scrollHeight - this.scrollTop - 1 <= this.clientHeight;
            if (condition) {
                binding.value();
            }
        });
    },
});


hljs.registerLanguage('javascript', javascript);
app.use(hljsVuePlugin)
app.use(store)
app.use(ElementPlus)
app.use(router)
app.use(VueClipboard)
app.mount('#app')

