import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  Animated,
  Text,
  View,
  Image,
  StyleSheet,
  Easing,
  ViewPropTypes,
  Platform
} from 'react-native'
import { RatioUtils } from '../../utils';

const { winWidth } = RatioUtils;

const ToastView = (props) => {
  const [text, setText] = useState(props.text)
  const [show, setShow] = useState(props.show)
  const [timerId, setTimerId] = useState(null)
  const fadeValue = useRef(new Animated.Value(0)).current
  const staticData = useRef({ isFirst: true }).current

  useEffect(() => {
    if (typeof props.show !== 'undefined') {
      if (show) {
        startShowAnimation()
      }
    }
    return () => {
      timerId && clearTimeout(timerId)
    }
  }, [])

  useEffect(() => {
    if (staticData) {
      staticData.isFirst = false
    } else {
      setShow(props.show)
      setText(props.text)
      if (props.show) {
        startShowAnimation()
      } else {
        startHideAnimation()
      }
    }
  }, [props.show, props.text])

  const startShowAnimation = () => {
    fadeValue.setValue(0)
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: true
    }).start(() => timer())
  }

  const startHideAnimation = () => {
    fadeValue.setValue(1)
    Animated.timing(fadeValue, {
      toValue: 0,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: true
    }).start()
  }

  const timer = () => {
    timerId && clearTimeout(timerId)
    setTimerId(setTimeout(() => props.onFinish(), 1200))
  }

  const {
    style,
    contentStyle,
    textStyle,
    imageStyle,
    showPosition = 'bottom',
    image,
    children
  } = props

  let position = { justifyContent: 'flex-end' }
  if (showPosition === 'top') {
    position = { justifyContent: 'flex-start' }
  } else if (showPosition === 'center') {
    position = { justifyContent: 'center' }
  }

  const isValidElement = React.isValidElement(children)

  return (
    <View
      style={[Platform.OS === 'web' && { width: winWidth }, styles.container, style, position]}
      pointerEvents='none'
    >
      <Animated.View
        style={[
          styles.textBg,
          contentStyle,
          {
            opacity: fadeValue
          }
        ]}
      >
        {typeof image === 'number' && <Image style={[styles.image, imageStyle]} source={image} />}
        {isValidElement && children}
        {text ? (
          <Text style={[styles.text, isValidElement && { marginTop: 12 }, textStyle]}>{text}</Text>
        ) : null}
      </Animated.View>
    </View>
  )
}

ToastView.propTypes = {
  /**
   * toast样式
   */
  style: ViewPropTypes.style,
  /**
   * toast内容样式
   */
  contentStyle: ViewPropTypes.style,
  /**
   * toast文字样式
   */
  textStyle: Text.propTypes.style,
  /**
   * toast图标样式
   */
  imageStyle: Image.propTypes.style,
  /**
   * 提示文字
   */
  text: PropTypes.string,
  /**
   * 是否显示
   */
  show: PropTypes.bool.isRequired,
  /**
   * 即将消失的回调
   */
  onFinish: PropTypes.func.isRequired,
  /**
   * 显示位置
   */
  showPosition: PropTypes.oneOf(['top', 'bottom', 'center']),
  /**
   * 图标
   */
  image: PropTypes.number,
  /**
   * 嵌套子元素
   */
  children: PropTypes.any
}

ToastView.defaultProps = {
  style: null,
  contentStyle: null,
  textStyle: null,
  imageStyle: null,
  text: '',
  showPosition: 'bottom',
  image: null,
  children: null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    top: 0
  },

  textBg: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `rgba(0, 0, 0, 0.7)`,
    borderRadius: 26,
    marginBottom: 64,
    marginHorizontal: 44,
    paddingHorizontal: 24,
    paddingVertical: 16
  },

  image: {
    marginBottom: 12
  },

  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
    textAlign: 'center',
    flexWrap: 'wrap'
  }
})

export default ToastView
