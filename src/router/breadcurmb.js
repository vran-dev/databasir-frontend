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
        name:'分组列表',
        to: {
            name: 'groupListPage'
        } 
    }
}

function groupDashboard(route) {
    var groupName = '分組详情'
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

function groupProjectCreate() {
    return {
        name:'项目创建',
        to: {
            path: '/projects/create'
        } 
    }
}

function groupProjectEdit(route) {
    var name = '项目编辑'
    if (route.query.projectName) {
        name = route.query.projectName
    }
    return {
        name: name,
        to: {
            path: '/projects/'+route.params.projectId+'/edit'
        } 
    }
}

function groupProjectDocument(route) {
    var name = '项目文档'
    if (route.query.projectName) {
        name = route.query.projectName
    }
    return {
        name: name,
        to: {
            path: '/groups/'+route.params.groupId+'/projects'
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

const breadcurmbMap = {
    index: () => [index() ],
    groupList: () => [index(), groupList()],
    groupDashboard: (route, state) => [index(), groupList(), groupDashboard(route, state)],
    groupProjectCreate:(route, state) =>  [index(), groupList(), groupDashboard(route, state), groupProjectCreate(route)],
    groupProjectEdit: (route, state) => [index(), groupList(), groupDashboard(route, state), groupProjectEdit(route)],
    groupProjectDocument: (route, state) => [index(), groupList(), groupDashboard(route, state),  groupProjectDocument(route)],
    userProfile: () =>  [index(), userProfile()],
    userList: () =>  [index(), userList()],
    sysEmailEdit: () => [index(), sysEmailEdit()]
}

export default breadcurmbMap