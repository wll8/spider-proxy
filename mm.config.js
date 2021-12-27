const http = require('./http.js')

/** @type {import('mockm/@types/config').Config} */
module.exports = {
  guard: true,
  api: {
    // 简单实现一个接口可以直接浏览器打开 http://127.0.0.1:9000/test/xxx 测试
    async 'get /test/:name' (req, res)  {
      const data = await http.get(`/anything/${req.params.name}`).catch((err) => res.json({err: String(err)}))
      res.json(data)
    },
  },
}
