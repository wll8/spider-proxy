const axios = require('axios').default
const http = axios.create({
  baseURL: 'https://httpbin.org/',
  proxy: false,
})

// 请求拦截器
http.interceptors.request.use(async (config) => {
  if(Boolean(config.noProxy) === false) {
    // [Request to HTTPS with HTTP proxy fails](https://github.com/axios/axios/issues/925#issuecomment-359982190)
    config.httpsAgent = await new require('https-proxy-agent')(`http://${await getProxyIp()}`)
    config.headers[`user-agent`] = (new (require('user-agents'))).data.userAgent
  }
  return config
}, (err) => Promise.reject(err))


// 响应拦截器
http.interceptors.response.use((res) => res.data, (err) => Promise.reject(err))

// 获取代理服务器
async function getProxyIp() {
  const data = await http.get(`http://demo.spiderpy.cn/get/?type=https`, {noProxy: true})
  return data.proxy
}


module.exports = http