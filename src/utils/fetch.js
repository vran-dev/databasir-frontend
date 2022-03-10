import axios from 'axios';
import { ElMessage } from 'element-plus'
import router from '../router';
import { token, user } from './auth';
import { refreshAccessToken } from '../api/Login';

const BASE_API = process.env.VUE_APP_API_URL
// default config
axios.defaults.baseURL = BASE_API,
axios.defaults.timeout = 20 * 1000;
axios.defaults.withCredentials = false;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post["Access-Control-Allow-Origin-Type"] = "*";

// token request config
// eslint-disable-next-line
let tokenRefreshLock = false

function lock() {
  tokenRefreshLock = true
}

function unlock() {
  tokenRefreshLock = false
}

let blockRequests = []

function blockRequest(request) {
  blockRequests.push(request)
}

function relaseRequests() {
  blockRequests.forEach(request => {
    request()
  })
  blockRequests = []
}

// 请求拦截器
axios.interceptors.request.use(async function (config) {
  if (token.hasValidAccessToken()) {
    config.headers.Authorization = 'Bearer ' + token.loadAccessToken()
    return config;
  } else if (config.url == '/access_tokens' || config.url.startsWith('/oauth2')) {
    return config
  } else  {
    if(!tokenRefreshLock) {
      lock()
      await refreshAndSaveAccessToken()
      config.headers.Authorization = 'Bearer ' + token.loadAccessToken()
      unlock()
      relaseRequests()
      return config;
    } else {
      const promise = new Promise((resolve) => {
        blockRequest(() => {
          config.headers.Authorization = 'Bearer ' + token.loadAccessToken()
          resolve(config)
        })
      })
      return promise
    }
  }
}, function (error) {
  unlock()
  return Promise.reject(error);
});

// response拦截器
axios.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.errCode) {
      notify(res.errMessage)
    }
    return res;
  },
  (error) => {
    if(error.response.status == 401) {
      if (error.response.data.errCode == 'X_0002') {
        user.removeUserLoginData()
        notify('登陆状态失效，请重新登陆')
        redirectLogin()
      }
    } else if (error.response.status == 403) {
      notify('无执行该操作的权限')
    } else {
      notify(error.message)
    }
    return Promise.reject(error);
  }
);

function redirectLogin () {
  user.removeUserLoginData()
  router.replace('/login')
}

function notify(msg) {
  ElMessage({
    message: msg,
    type: 'error',
    duration: 5 * 1000
  });
}

async function refreshAndSaveAccessToken() {
  const refreshToken = user.getRefreshToken()
  if (refreshToken) {
    const accessToken = await refreshAccessToken(refreshToken).then(resp => {
      if (!resp.errCode) {
        token.saveAccessToken(resp.data.accessToken, resp.data.accessTokenExpireAt)
        return resp.data.accessToken
      } else {
        redirectLogin()
       }
    })
    return accessToken
  } else {
    redirectLogin()
  }
}

export default axios;
