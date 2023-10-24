import { Dimensions, Platform, StatusBar } from 'react-native'

const { height, width } = Dimensions.get('window')
const baseHeight = 667
const baseWidth = 375
const baseX = Math.sqrt(baseHeight * baseHeight + baseWidth * baseWidth)
const x = Math.sqrt(height * height + width * width)
const statusHeight = StatusBar.currentHeight || 0
const isIos = Platform.OS === 'ios'
const isWeb = Platform.OS === 'web'
const isIphoneX = isIos && height >= 812

let finalRatio = x / baseX
if (baseWidth === width && finalRatio > 1) {
  finalRatio = 1
}
export const ratio = finalRatio

const topBarHeight = isIos ? (isIphoneX ? 88 : 64) : 56
const statusBarHeight = isIos ? (isIphoneX ? 44 : 20) : statusHeight

const getDimension = () => {
  if (isWeb) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return Dimensions.get('osWindow')
    } catch (error) {
      return Dimensions.get('window')
    }
  }
  return Dimensions.get('window')
}

/**
 * 安卓或 Web 环境下，屏幕宽度等参数是动态的;
 */
const Radio = {
  get hRatio() {
    const { width: actualWidth } = getDimension()
    return actualWidth / baseWidth
  },
  get vRatio() {
    const { height: actualHeight } = getDimension()
    return actualHeight / baseHeight
  },
  get ratio() {
    const actualX = Math.sqrt(height * height + width * width)
    const { width: actualWidth } = getDimension()
    let actualRatio = actualX / baseX
    if (baseWidth === actualWidth && actualRatio > 1) {
      actualRatio = 1
    }
    return actualRatio
  },
  get width() {
    return getDimension().width
  },
  get height() {
    return getDimension().height
  },
  get winWidth() {
    return getDimension().width
  },
  get winHeight() {
    return getDimension().height
  },
  get viewWidth() {
    return getDimension().width
  },
  get viewHeight() {
    return getDimension().height - (isIos ? (isIphoneX ? 88 : 64) : 56 + statusHeight)
  },
  convertX: (number) => {
    const { width: actualWidth } = getDimension()
    const hRatio = actualWidth / baseWidth
    return number * hRatio
  },
  convertY: (number) => {
    const { height: actualHeight } = getDimension()
    const vRatio = actualHeight / baseHeight
    return number * vRatio
  },
  convert: (number) => {
    const actualX = Math.sqrt(height * height + width * width)
    const { width: actualWidth } = getDimension()
    let actualRatio = actualX / baseX
    if (baseWidth === actualWidth && actualRatio > 1) {
      actualRatio = 1
    }
    return number * actualRatio
  },
  cx: (number) => {
    const { width: actualWidth } = getDimension()
    const hRatio = actualWidth / baseWidth
    return number * hRatio
  },
  cy: (number) => {
    const { height: actualHeight } = getDimension()
    const vRatio = actualHeight / baseHeight
    return number * vRatio
  },
  c: (number) => {
    const actualX = Math.sqrt(height * height + width * width)
    const { width: actualWidth } = getDimension()
    let actualRatio = actualX / baseX
    if (baseWidth === actualWidth && actualRatio > 1) {
      actualRatio = 1
    }
    return number * actualRatio
  },
  get isSmallW() {
    return getDimension().width < 375
  },
  get isSmallH() {
    return getDimension().height < 667
  },
  isIos,
  isIphoneX,
  iPhoneX: isIphoneX,
  topBarHeight,
  statusBarHeight
}

const { width: _width, height: _height } = getDimension()

export const getCxCy = (os, isHori) => {
  let cx
  let cy
  if (isHori) {
    cx = (l) => {
      return (l / 667) * _height
    }
    cy = (l) => {
      return (l / 375) * _width
    }
  } else {
    cx = Radio.cx
    cy = Radio.cy
  }
  return { cx, cy }
}

export default Radio
