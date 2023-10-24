import WatchableQueue from './WatchableQueue'

export type ModalConfig = {
  id?: number
  element: Element // 弹出内容
  maskColor?: string // 模态框背景色
  maskUnClosable?: boolean // true: 点击背景色不可关闭模态框
  onMaskPress?: () => void // 模态框点击事件
}

export const tipQueue: WatchableQueue<ModalConfig> = new WatchableQueue()

class Modal {
  close(id?: number) {
    if (id !== undefined)
      tipQueue.splice(
        tipQueue.findIndex((t) => t.id === id),
        1
      )
    else tipQueue.clear()
  }

  render = (config: ModalConfig) => {
    config.id = new Date().valueOf()
    tipQueue.push(config)
    return config.id
  }
}
export default new Modal()
