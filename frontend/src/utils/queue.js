import { takeRight } from 'lodash-es'

export class FixedQueue {
  // 私有属性，存储队列数据
  _queue
  // 私有属性，存储队列的最大容量
  _maxSize

  constructor(size) {
    this._maxSize = size
    this._queue = []
  }

  append(item) {
    // 使用 takeRight 方法确保队列长度不超过最大容量
    this._queue = takeRight([...this._queue, item], this._maxSize)
  }

  clear() {
    this._queue = []
  }

  getQueue() {
    return this._queue
  }

  get length() {
    return this._queue.length
  }
}
