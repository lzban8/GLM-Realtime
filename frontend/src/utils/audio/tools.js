export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    // 读取 blob 为 arrayBuffer
    const reader = new FileReader()
    reader.onloadend = () => {
      // reader.result 包含了 Base64 编码的字符串
      const base64data = reader.result
      resolve(base64data)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 分割DataURL，返回一个数组
export function splitDataURL(dataUrl) {
  if (!dataUrl) {
    return []
  }
  return dataUrl.split(',')
}
