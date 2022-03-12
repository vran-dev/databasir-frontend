function index() {
    return {
        name:'首页',
        to: {
            path: '/'
        }
    }
}

function groupList() {
    return {
        name:'项目中心',
        to: {
            name: 'groupListPage'
        } 
    }
}

function groupDashboard(route) {
    var groupName = '项目组'
    if (route.query.groupName) {
        groupName = route.query.groupName
    }
    return {
        name: groupName,
        to: {
            path: '/groups/'+route.params.groupId
        } 
    }
}

function groupProjectDocument(route) {
    var name = '项目文档'
    if (route.query.projectName) {
        name = route.query.projectName
    }
    var projectId = route.params.projectId
    var groupId = route.params.groupId
    return {
        name: name,
        to: {
            path: '/groups/' + groupId + '/projects/' + projectId + '/documents',
            query: {
                projectName: name
            }
        } 
    }
}

function userList() {
    return {
        name:'用户列表',
        to: {
            path: '/users'
        } 
    }
}


function userProfile() {
    return {
        name:'个人中心',
        to: {
            path: '/profile'
        } 
    }
}

function sysEmailEdit() {
    return {
        name:'邮箱设置',
        to: {
            path: '/settings/sysEmail'
        } 
    }
}

function sysLog() {
    return {
        name:'操作日志',
        to: {
            path: '/settings/sysLog'
        } 
    }
}

function sysOauth2() {
    return {
        name:'登录设置',
        to: {
            path: '/settings/sysOauth2'
        } 
    }
}

function sysDatabaseType() {
    return {
        name:'数据库类型',
        to: {
            path: '/settings/sysDatabaseType'
        } 
    }
}


const breadcurmbMap = {
    index: () => [index() ],
    groupList: () => [index(), groupList()],
    groupDashboard: (route, state) => [index(), groupList(), groupDashboard(route, state)],
    groupProjectDocument: (route, state) => [index(), groupList(), groupDashboard(route, state),  groupProjectDocument(route)],
    userProfile: () =>  [index(), userProfile()],
    userList: () =>  [index(), userList()],
    sysEmailEdit: () => [index(), sysEmailEdit()],
    sysLog: () => [index(), sysLog()],
    sysOauth2: () => [index(), sysOauth2()],
    sysDatabaseType: () => [index(), sysDatabaseType()],

}

export default breadcurmbMap