# spider-proxy
这个项目使用 node 实现了随机应用代理, UA信息来请求接口的 demo, 并介绍了如何搭建代理池等功能.

``` sh
npm i
npm run dev
```

- 访问: https://api.ipify.org 查看自己的 IP
- 访问: http://127.0.0.1:9000/test/xxx 测试代理情况

![](https://cdn.jsdelivr.net/gh/filess/img17@main/2021/12/27/1640601973568-7178ecfe-2dec-44de-a20b-03a6dfc68e6a.png)


## 如何实现代理
### axios
目前 axios 有一个 bug 导致自带的 proxy 方式无效, 好在这可以使用一个第三方库 https-proxy-agent 或 node-tunnel 解决

你也可能随机从公用示例获取一个 http://demo.spiderpy.cn/get/?type=https

``` js
const axios = require('axios').default
const http = axios.create({
  baseURL: 'https://httpbin.org/',
  proxy: false,
})

// 由于很多接口都要走代理, 所以应该在拦截器里应用
http.interceptors.request.use(async (config) => {
  // 这里可以异步通过 api 去请求最新的代理服务器配置
  // 127.0.0.1:1080 是你的代理服务器的 ip 和端口, 由于我本地搭建了一个, 所以我使用我本地的测试
  config.httpsAgent = await new require('https-proxy-agent')(`http://127.0.0.1:1080`)
  return config
}, (err) => Promise.reject(err))
http.interceptors.response.use((res) => res.data, (err) => Promise.reject(err))

new Promise(async () => {
  const data = await http.get(`/ip`).catch((err) => console.log(String(err)))
  // 如果这个地方返回了你的代理 ip 的地址, 则表示成功应用了代理
  console.log(`data`, data)
})
```

## 实现代理池
爬虫代理IP池项目, 主要功能为定时采集网上发布的免费代理验证入库, 定时验证入库的代理保证代理的可用性, 提供API和CLI两种使用方式. 同时你也可以扩展代理源以增加代理池IP的质量和数量.

本代理池使用的是 https://github.com/jhao104/proxy_pool .

安装 docker
``` sh
uname -r
yum update
yum remove docker docker-common docker-selinux docker-engine
yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

yum -y install docker-ce-20.10.12-3.el7
systemctl start docker
systemctl enable docker
docker version
```

安装 redis
``` sh
yum -y install epel-release-7-14
yum -y install redis-3.2.12-2.el7
systemctl start redis

# 配置 redis
  # 修改密码 foobared 为 jdbjdkojbk
  sed -i 's/# requirepass foobared/requirepass jdbjdkojbk/' /etc/redis.conf
  # 修改端口号
  sed -i 's/^port 6379/port 6389/' /etc/redis.conf
  # 配置允许其他电脑链接
  sed -i 's/^bind 127.0.0.1/# bind 127.0.0.1/' /etc/redis.conf
  # 重启 redis
  systemctl restart redis
  # 查看进程
  ps -ef | grep redis
  # 测试连接
  redis-cli -h 127.0.0.1 -p 6389 -a jdbjdkojbk
```


安装代理池
``` sh
docker pull jhao104/proxy_pool:2.4.0
# 注意
docker run -itd --env DB_CONN=redis://:jdbjdkojbk@10.0.8.10:6389/0 -p 5010:5010 jhao104/proxy_pool:2.4.0
```

## 其他

卸载 redis
``` sh
systemctl stop redis
yum remove redis
rm -rf /usr/local/bin/redis*
rm -rf /etc/redis.conf
```
## 参考
- [Request to HTTPS with HTTP proxy fails](https://github.com/axios/axios/issues/925#issuecomment-359982190)
- [安装 redis](https://blog.51cto.com/u_15338614/3586148)
- [安装 redis](https://zhuanlan.zhihu.com/p/34527270)
- [安装 docker](https://www.cnblogs.com/wang-yaz/p/10429899.html)
