export default class WatchableQueue<T> extends Array<T> {
  constructor() {
    super()
    this.listener = []
  }

  protected listener: (() => void)[]

  push(...item: any) {
    const res = super.push(...item)
    this.onChange()
    return res
  }

  splice(start: number, deleteCount?: number | undefined) {
    const res = super.splice(start, deleteCount)
    this.onChange()
    return res
  }

  clear() {
    this.length = 0
    this.onChange()
  }

  protected onChange() {
    this.listener.forEach((l) => l())
  }

  addListener(listener: () => void) {
    return this.listener.push(listener)
  }

  removeListener(listener: () => void) {
    const idx = this.listener.indexOf(listener)
    if (idx <= -1) return false
    this.listener.splice(idx, 1)
    return true
  }
}
