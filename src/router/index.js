import { createRouter, createWebHistory } from 'vue-router';
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
        path: '/login/oauth2/:id',
        component: () => import('@/views/OAuth2Login.vue'),
        hidden: true,
        props: true,
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
        hidden: true,
        component: Layout,
        meta: {
            nav: '项目中心',
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
            {
                path: 'sysLog',
                icon: 'Document',
                component: () => import('@/views/SysLog.vue'),
                meta: {
                    nav: '操作日志',
                    breadcrumb: breadcurmbMap.sysLog
                }
            },
            {
                path: 'sysOauth2',
                icon: 'Connection',
                component: () => import('@/views/SysOauth2.vue'),
                meta: {
                    nav: '登陆设置',
                    breadcrumb: breadcurmbMap.sysOauth2
                }
            },
            {
                path: 'sysDatabaseType',
                icon: 'office-building',
                component: () => import('@/views/SysDatabaseType.vue'),
                meta: {
                    nav: '数据库扩展',
                    breadcrumb: breadcurmbMap.sysDatabaseType
                }
            },
            {
                path: 'sysDocumentTemplate',
                icon: 'document-add',
                component: () => import('@/views/SysDocumentTemplateProperty.vue'),
                meta: {
                    nav: '文档模板',
                    breadcrumb: breadcurmbMap.sysDocumentTemplate
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
    history: createWebHistory(),
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