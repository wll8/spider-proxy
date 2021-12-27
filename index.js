const axios = require('axios').default
const http = axios.create({
  baseURL: 'https://httpbin.org/',
  proxy: false,
});
http.interceptors.request.use(async (config) => {
  if(Boolean(config.noProxy) === false) {
    // [Request to HTTPS with HTTP proxy fails](https://github.com/axios/axios/issues/925#issuecomment-359982190)
    config.httpsAgent = await new require('https-proxy-agent')(`http://${await getProxyIp()}`)
    config.headers[`user-agent`] = (new (require('user-agents'))).data.userAgent
  }
  return config
}, (err) => Promise.reject(err))
http.interceptors.response.use((res) => res.data, (err) => Promise.reject(err))

new Promise(async () => {
  const data = await http.get(`/get`).catch((err) => console.log(String(err)))
  console.log(`data`, data)
})

/**
 * 获取代理服务器
 */
async function getProxyIp() {
  const data = await http.get(`http://demo.spiderpy.cn/get/?type=https`, {noProxy: true})
  return data.proxy
}


