import axios from 'axios';
import { ElMessage } from 'element-plus'
import router from '../router';
import { token, user } from './auth';
import { refreshAccessToken } from '../api/Login';

const BASE_API = process.env.VUE_APP_API_URL
// default config
axios.defaults.baseURL = BASE_API,
axios.defaults.timeout = 15 * 1000;
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

function relaseRequests(config) {
  blockRequests.forEach(request => {
    request(config)
  })
  blockRequests = []
}

// 请求拦截器
axios.interceptors.request.use(async function (config) {
  if (config.url == '/access_tokens' || config.url.startsWith('/oauth2') || config.url == '/login') {
    return config
  }

  if (token.hasValidAccessToken()) {
    config.headers.Authorization = 'Bearer ' + token.loadAccessToken()
    return config;
  }
  if (tokenRefreshLock) {
    const promise = new Promise((resolve) => {
      blockRequest(() => {
        if (config) {
          config.headers.Authorization = 'Bearer ' + token.loadAccessToken()
        }
        resolve(config)
      })
    })
    return promise
  } 
  return config
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
    if (error.response) {
      if(error.response.status == 401) {
        if (error.response.data.errCode == 'X_0002') {
          user.removeUserLoginData()
          notify('登陆状态失效，请重新登陆')
          redirectLogin()
        } else if (error.response.data.errCode == 'X_0004') {
            return refresh(error.config).then(() => retryFromResponse(error.config))
        }
      } else if (error.response.status == 403) {
        notify('无执行该操作的权限')
      } else {
        notify(error.message)
      } 
    } else {
      console.log(error)
      notify('网络异常，请稍后再试')
    }
    return Promise.reject(error);
  }
);

async function refresh(config) {
  const refreshToken = user.getRefreshToken()
  if(!refreshToken) {
    redirectLogin()
  }

  if(tokenRefreshLock) {
    return new Promise((resolve) => {
      blockRequest(() => {
        if (config) {
          config.headers.Authorization = 'Bearer ' + token.loadAccessToken()
        }
        resolve(config)
      })
    })
  }

  lock()
  return await refreshAccessToken(refreshToken).then(resp => {
    if (resp.errCode) {
      redirectLogin()
    } else {
      token.saveAccessToken(resp.data.accessToken, resp.data.accessTokenExpireAt)
      unlock()
    }
  }).finally(() => unlock())
}

async function retryFromResponse(config) {
  try {
    const res = await axios({
      method: config.method,
      data: config.data,
      url: config.url,
      baseURL: config.baseURL,
      headers: {
        Authorization: 'Bearer ' + token.loadAccessToken()
      },
    })
    relaseRequests(config)
    return res;
  } catch(error) {
    console.log(error)
    notify("网络异常，请稍后再试");
  }
}


function redirectLogin () {
  user.removeUserLoginData()
  router.replace('/login')
}

function notify(msg) {
  ElMessage({
    message: msg,
    type: 'error',
    duration: 5 * 1000,
    grouping: true,
  });
}

export default axios;
