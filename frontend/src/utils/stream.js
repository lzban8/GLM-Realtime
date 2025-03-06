/**
 * 获取 getUserMedia 对象的兼容写法
 * @param {Object} constraints - 视频和音频的约束条件。
 * @returns {Promise} 返回一个Promise对象，解析为 getUserMedia 对象。
 */
export function getUserMedia(constraints) {
  if (navigator?.mediaDevices?.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints)
  } else if (navigator.getUserMedia) {
    return navigator.getUserMedia(constraints)
  } else if (navigator.webkitGetUserMedia) {
    // 针对旧版Chrome和Opera
    return navigator.webkitGetUserMedia(constraints)
  } else if (navigator.mozGetUserMedia) {
    // 针对旧版Firefox
    return navigator.mozGetUserMedia(constraints)
  } else if (navigator.msGetUserMedia) {
    // 针对旧版IE
    return navigator.msGetUserMedia(constraints)
  } else {
    return Promise.reject(new Error('当前浏览器不支持getUserMedia！'))
  }
}

/**
 * 获取 getDisplayMedia 对象的兼容写法
 * @param {Object} constraints - 视频和音频的约束条件。
 * @returns {Promise} 返回一个Promise对象，解析为 getDisplayMedia 对象。
 */
export function getDisplayMedia(constraints) {
  if (navigator.mediaDevices.getDisplayMedia) {
    return navigator.mediaDevices.getDisplayMedia(constraints)
  } else if (navigator.getDisplayMedia) {
    return navigator.getDisplayMedia(constraints)
  } else if (navigator.webkitGetDisplayMedia) {
    // 针对旧版Chrome和Opera
    return navigator.webkitGetDisplayMedia(constraints)
  } else if (navigator.mozGetDisplayMedia) {
    // 针对旧版Firefox
    return navigator.mozGetDisplayMedia(constraints)
  } else if (navigator.msGetDisplayMedia) {
    // 针对旧版IE
    return navigator.msGetDisplayMedia(constraints)
  } else {
    return Promise.reject(new Error('当前浏览器不支持getDisplayMedia！'))
  }
}

/**
 * 将ArrayBuffer转换回Base64的字符串。
 * @param {ArrayBuffer} buffer - 要转换的ArrayBuffer对象。
 * @returns {string} 返回Base64编码的字符串。
 */
export function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.length
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

/**
 * 将Base64的字符串转换为ArrayBuffer
 * @param {string} base64 - 要转换的Base64字符串。
 * @returns {ArrayBuffer} 返回ArrayBuffer对象。
 */
export function base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64)
  const len = binary_string.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * 将Base64编码的字符串转换为Blob对象。
 * @param {string} base64 - 需要转换的Base64编码字符串
 * @param {string} mimeType - Blob对象的MIME类型，例如'image/jpeg'或'image/png'。
 * @returns {Blob} 返回一个Blob对象
 */
export function base64ToBlob(base64, mimeType) {
  // 分割Base64字符串以获取数据部分，通常Base64字符串以"data:image/...,"开头
  const byteString = atob(base64)
  // 创建一个ArrayBuffer，其大小与解码后的字符串长度相同
  const ab = new ArrayBuffer(byteString.length)
  // 创建一个Uint8Array视图，将ArrayBuffer的内容初始化为8位无符号整数值
  const ia = new Uint8Array(ab)
  // 遍历解码后的字符串，并将每个字符的Unicode编码存入Uint8Array数组
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  // 使用ArrayBuffer和MIME类型创建Blob对象
  const blob = new Blob([ab], { type: mimeType })
  // 返回Blob对象
  return blob
}

/**
 * 将Blob对象转换为Base64编码的字符串。
 * @param {Blob} blob - 要转换的Blob对象。
 * @returns {Promise<string>} 返回一个Promise，解析为Base64编码的字符串。
 */
export function blobToBase64(blob, isKeepHeader = false) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = function() {
      const base64String = reader.result
      if (isKeepHeader) {
        resolve(base64String)
      } else {
        resolve(base64String.split(',')[1])
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 将blob对象转换为ArrayBuffer。
 * @param {Blob} file - 要转换的Blob对象。
 * @returns {ArrayBuffer} 返回ArrayBuffer对象。
 */
export function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 将解码后的audioBuffer音频数据转换为PCM格式
 * @param {AudioBuffer} audioBuffer - 解码后的音频数据
 * @returns {Object} { pcm, sampleRate } - PCM格式数据及采样率
 */
// 将解码后的音频数据转换为PCM格式
export function audioBufferToPCM(audioBuffer) {
  const channels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const length = audioBuffer.length * channels
  const buffer = new Float32Array(length)
  // 将音频数据复制到Float32Array中
  for (let channel = 0; channel < channels; channel++) {
    const channelData = audioBuffer.getChannelData(channel)
    buffer.set(channelData, channel * audioBuffer.length)
  }
  // 将Float32Array转换为Int16Array，模拟PCM 16位格式
  const pcm = new Int16Array(length)
  for (let i = 0; i < length; i++) {
    // 将浮点数缩放到16位整数范围
    pcm[i] = buffer[i] * 0x7fff
  }
  return { pcm, sampleRate }
}

/**
 * 数据简单处理 - 将二维Float32Array数据转换为一维Float32Array数据
 * @param {Array} inputData  - 二维Float32Array数据
 * @param {Number} size - 合并后的一维Float32Array数据大小
 * @returns {Float32Array} 返回合并后的一维Float32Array数据
 */
export function decompress(inputData, size) {
  // 合并
  const data = new Float32Array(size)
  let offset = 0 // 偏移量计算
  // 将二维数据，转成一维数据
  for (let i = 0; i < inputData.length; i++) {
    data.set(inputData[i], offset)
    offset += inputData[i].length
  }
  return data
}

/**
 * PCM编码 - 将Float32Array音频数据转换为PCM编码的字节数据
 * @returns {Float32Array} bytes - Float32Array音频数据
 * @param {number} outputSampleBits - 位深度 默认16
 * @returns {DataView} 返回包含PCM编码数据的DataView对象
 */
export function encodePCM(bytes, outputSampleBits = 16) {
  const sampleBits = outputSampleBits // 采样位数
  let offset = 0
  const dataLength = bytes.length * (sampleBits / 8)
  const buffer = new ArrayBuffer(dataLength)
  const data = new DataView(buffer)

  // 写入采样数据
  if (sampleBits === 8) {
    for (let i = 0; i < bytes.length; i++, offset++) {
      // 范围[-1, 1]
      const s = Math.max(-1, Math.min(1, bytes[i]))
      // 8位采样位划分成2^8=256份，它的范围是0-255; 16位的划分的是2^16=65536份，范围是-32768到32767
      // 因为我们收集的数据范围在[-1,1]，那么你想转换成16位的话，只需要对负数*32768,对正数*32767,即可得到范围在[-32768,32767]的数据。
      // 对于8位的话，负数*128，正数*127，然后整体向上平移128(+128)，即可得到[0,255]范围的数据。
      let val = s < 0 ? s * 128 : s * 127
      val = parseInt(val + 128)
      data.setInt8(offset, val, true)
    }
  } else {
    for (let i = 0; i < bytes.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, bytes[i]))
      // 16位直接乘就行了
      // 范围[-32768, 32767]
      data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }
  }

  return data
}

/**
 * float32Array的音频pcm数据转换成Blob
 * @param {String} miniType - Blob类型
 * @param {Float32Array} float32Array - Float32Array音频数据
 * @param {Number} sampleRate - 采样率
 * @param {Number} channelCount - 声道数
 * @returns {BloB} 返回包含PCM编码数据的Blob对象
 */
export function float32ArrayToBlob(miniType, float32Array, sampleRate = 44100, channelCount = 1) {
  // 确定WAV文件的一些参数
  const numChannels = 1
  const bitsPerSample = 16
  // 计算音频数据的长度
  const bufferLength = float32Array.length * numChannels * (bitsPerSample / 8)
  // 创建ArrayBuffer对象，大小为文件头长度加上音频数据长度
  const buffer = new ArrayBuffer(44 + bufferLength)
  const view = new DataView(buffer)
  // 写入WAV文件头信息
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + bufferLength, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true)
  view.setUint16(32, numChannels * (bitsPerSample / 8), true)
  view.setUint16(34, bitsPerSample, true)
  writeString(view, 36, 'data')
  view.setUint32(40, bufferLength, true)
  // 将Float32Array转换为16位PCM数据并写入ArrayBuffer
  let offset = 44
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }
  // 创建Blob对象
  return new Blob([buffer], { type: miniType })
}

/**
 * 将多段base64音频数据合并成一个base64音频数据
 * @param { Array<String> } audioBase64Array - 多段base64音频数据
 * @returns { String } - 合并后的base64音频数据
 */
export function mergeAudioBase64(audioBase64Array) {
  let combinedAudioDataLength = 0
  const arrayBuffers = []
  // 先将所有Base64数据转换为ArrayBuffer，并统计音频主体数据总长度，同时提取音频主体数据（去除文件头）
  audioBase64Array.forEach(audioBase64 => {
    const arrayBuffer = base64ToArrayBuffer(audioBase64)
    arrayBuffers.push(arrayBuffer)
    // 以常见的WAV格式为例，去除文件头（通常前44字节）来获取音频主体数据长度，若为其他格式需相应调整
    combinedAudioDataLength += arrayBuffer.byteLength - 44
  })
  // 拼接音频主体数据
  const combinedAudioData = new Uint8Array(combinedAudioDataLength)
  let offset = 0
  arrayBuffers.forEach(arrayBuffer => {
    const audioData = arrayBuffer.slice(44)
    combinedAudioData.set(new Uint8Array(audioData), offset)
    offset += audioData.byteLength
  })
  // 重新构建文件头（这里以WAV格式为例，简单复用第一段音频的文件头信息来构建，实际需确保准确反映音频参数）
  const wavHeader = new ArrayBuffer(44)
  const view = new DataView(wavHeader)
  const originalHeader = new DataView(arrayBuffers[0])
  // 复制原文件头的相关标识等信息
  view.setUint32(0, originalHeader.getUint32(0))
  view.setUint32(4, combinedAudioData.byteLength + 36)
  view.setUint32(8, originalHeader.getUint32(8))
  view.setUint32(12, originalHeader.getUint32(12))
  view.setUint32(16, originalHeader.getUint32(16))
  view.setUint16(20, originalHeader.getUint16(20))
  view.setUint16(22, originalHeader.getUint16(22))
  view.setUint32(24, originalHeader.getUint32(24))
  view.setUint32(28, originalHeader.getUint32(28))
  view.setUint16(32, originalHeader.getUint16(32))
  view.setUint16(34, originalHeader.getUint16(34))
  view.setUint32(36, originalHeader.getUint32(36))
  view.setUint32(40, combinedAudioData.byteLength)
  // 拼接新文件头和合并后的音频主体数据
  const combinedArrayBuffer = new ArrayBuffer(wavHeader.byteLength + combinedAudioData.byteLength)
  const combinedView = new Uint8Array(combinedArrayBuffer)
  combinedView.set(new Uint8Array(wavHeader), 0)
  combinedView.set(combinedAudioData, 44)
  // 最后转换回Base64格式并返回
  return arrayBufferToBase64(combinedArrayBuffer)
}

export function concatFloat32Array(a, b) {
  const newArr = new Float32Array(a.length + b.length)
  newArr.set(a, 0)
  newArr.set(b, a.length)
  return newArr
}
export function createWavFile(audioData, sampleRate) {
  function float32ToPCM(input, output) {
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]))
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
  }

  function writeUTFBytes(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const numOfChannels = 1 // 单声道
  const bitDepth = 16
  const byteRate = (sampleRate * numOfChannels * bitDepth) / 8
  const blockAlign = (numOfChannels * bitDepth) / 8
  const wavHeaderSize = 44

  const wavBuffer = new ArrayBuffer(wavHeaderSize + audioData.length * 2)
  const view = new DataView(wavBuffer)

  // RIFF chunk descriptor
  writeUTFBytes(view, 0, 'RIFF')
  view.setUint32(4, 36 + audioData.length * 2, true)
  writeUTFBytes(view, 8, 'WAVE')

  // fmt sub-chunk
  writeUTFBytes(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true) // AudioFormat (1 for PCM)
  view.setUint16(22, numOfChannels, true) // NumChannels
  view.setUint32(24, sampleRate, true) // SampleRate
  view.setUint32(28, byteRate, true) // ByteRate
  view.setUint16(32, blockAlign, true) // BlockAlign
  view.setUint16(34, bitDepth, true) // BitsPerSample

  // data sub-chunk
  writeUTFBytes(view, 36, 'data')
  view.setUint32(40, audioData.length * 2, true) // Subchunk2Size

  // PCM data
  const pcmData = new Int16Array(audioData.length)
  float32ToPCM(audioData, pcmData)
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(44 + i * 2, pcmData[i], true)
  }

  return new Blob([view], { type: 'audio/wav' })
}

export function mergeFloat32Arrays(arrays) {
  // 计算总长度
  let totalLength = 0
  for (const arr of arrays) {
    totalLength += arr.length
  }

  // 创建新的 Float32Array
  const result = new Float32Array(totalLength)

  // 拷贝每个 Float32Array 到新的 Float32Array
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }

  return result
}

// 获取Blob数据或文件的pcm数据
export function convertToPCM(blob) {
  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext()
    const reader = new FileReader()
    reader.onload = function(event) {
      const arrayBuffer = event.target.result
      audioContext.decodeAudioData(
        arrayBuffer,
        function(audioBuffer) {
          const data = []
          let size = 0
          const numChannels = audioBuffer.numberOfChannels // 获取声道数，应为2表示双声道
          const sampleRate = audioBuffer.sampleRate

          // 遍历每个声道，分别提取PCM数据
          for (let channel = 0; channel < numChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel)
            const pcmDataForThisChannel = []
            for (let i = 0; i < channelData.length; i++) {
              pcmDataForThisChannel.push(channelData[i])
            }
            data.push(new Float32Array(pcmDataForThisChannel))
            size += pcmDataForThisChannel.length
          }
          resolve({
            data,
            size,
            sampleRate,
            numChannels
          })
        },
        function(error) {
          reject(error)
        }
      )
    }
    reader.readAsArrayBuffer(blob)
    reader.onerror = function(error) {
      reject(error)
    }
  })
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}
