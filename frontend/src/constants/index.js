const GlobalConsts = {}

// 获取moudules文件下所有js文件；
const context = require.context('./modules', true, /\.js$/)
context.keys().forEach(key => {
  const { default: defaultExport, ...reset } = context(key)
  Object.assign(GlobalConsts, reset || {}, defaultExport || {})
})

export default GlobalConsts
