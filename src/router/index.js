import { createRouter, createWebHashHistory } from 'vue-router';
import Layout from "../layouts/Layout.vue"
import breadcurmbMap from './breadcurmb'
import { token } from '../utils/auth';

const routes = [
    {
        path: '/login',
        component: () => import('@/views/Login.vue'),
        hidden: true,
        meta: {
            requireAuth: false
        }
    },
    {
        path: '/',
        hidden: true,
        component: Layout,
        children: [
            {
                path: '',
                hidden: true,
                component: () => import('@/views/GroupList.vue'),
                meta: {
                    breadcrumb: breadcurmbMap.groupList
                }
            }
        ]
    },
    {
        path: '/groups',
        icon: 'Collection',
        component: Layout,
        meta: {
            nav: '分组列表',
        },
        children: [
            {
                path: '',
                name: 'groupListPage',
                hidden: true,
                component: () => import('@/views/GroupList.vue'),
                meta: {
                    breadcrumb: breadcurmbMap.groupList
                }
            },
            {
                path: ':groupId',
                hidden: true,
                component: () => import('@/views/GroupDashboard.vue'),
                meta: {
                    breadcrumb: breadcurmbMap.groupDashboard
                }
            },
            {
                path: ':groupId/projects/:projectId/documents',
                hidden: true,
                component: () => import('@/views/Document.vue'),
                meta: {
                    breadcrumb: breadcurmbMap.groupProjectDocument
                }
            }
        ]
    },
    {
        path: '/users',
        icon: 'List',
        component: Layout,
        meta: {
            nav:'用户中心',
            requireAnyRoles: ['SYS_OWNER']
        },
        children: [
            {
                path: '',
                hidden: true,
                component: () => import('@/views/UserList.vue'),
                meta: {
                    breadcrumb: breadcurmbMap.userList
                }
            }
        ]
    },
    {
        path: '/profile',
        icon: 'User',
        component: Layout,
        meta: {
            nav: '个人中心',
            breadcrumb: breadcurmbMap.userProfile
        },
        children: [
            {
                path: '',
                hidden: true,
                component: () => import('@/views/UserProfile.vue')
            }
        ]
    },
    {
        path: '/settings',
        icon: 'Setting',
        component: Layout,
        meta: {
            nav:'系统中心',
            requireAnyRoles: ['SYS_OWNER']
        },
        children: [
            {
                path: 'sysEmail',
                icon: 'Notification',
                component: () => import('@/views/SysEmailEdit.vue'),
                meta: {
                    nav: '邮箱设置',
                    breadcrumb: breadcurmbMap.sysEmailEdit
                }
            },
            // TODO
            {
                path: 'sysKey',
                icon: 'Key',
                hidden: 'true',
                component: Layout,
                meta: {
                    nav: '系统秘钥',
                    breadcrumb: breadcurmbMap.sysKeyEdit
                }
            }
        ]
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// 权限路由守卫
router.beforeEach((to, from, next) => {
    if (to.meta.requireAuth == false) {
        if (to.path == '/login' && token.hasAccessToken()) {
            next(from)
        } else {
            next()
        }
    } else {
        if(token.hasAccessToken()) {
            next()
        } else {
            next({ path: '/login' })
        }
    }
})

// groupName 参数路由守卫
router.beforeEach((to, from, next) => {
    if (!to.query.groupName && from.query.groupName) {
        to.query.groupName = from.query.groupName
    } 
    if (!to.query.projectName && from.query.projectName) {
        to.query.projectName = from.query.projectName
    } 
    next();
})

export default router;