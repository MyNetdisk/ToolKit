import React, { useEffect, useState } from 'react'
import {
  ImageStyle,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
  DeviceEventEmitter
} from 'react-native'
import Radio from '@/radio'
import PropTypes from 'prop-types'
import GlobalToast from '../../global-toast'
import ModalContainer from '../../sdk-modal/modalContainer'

const { cx, cy } = Radio

const defaultProps = {}

const FullView = (props) => {
  const [showToast, setShowToast] = useState(false)
  const [successStyle, setSuccessStyle] = useState({})
  const [successInformation, setSuccessInformation] = useState({})

  useEffect(() => {
    const showToastListener = DeviceEventEmitter.addListener('showToast', handleShowToast)
    const hideToastListener = DeviceEventEmitter.addListener('hideToast', handleHideToast)
    return () => {
      DeviceEventEmitter.removeListener(showToastListener)
      DeviceEventEmitter.removeListener(hideToastListener)
    }
  }, [])

  const handleShowToast = (data) => {
    const { style, ...rest } = data
    setShowToast(true)
    setSuccessInformation(rest)
    setSuccessStyle(style)
  }

  const handleHideToast = () => {
    setShowToast(false)
  }

  // 渲染全局成功Toast
  const renderGlobalToast = () => {
    return (
      <GlobalToast
        onFinish={() => setShowToast(false)}
        {...successInformation}
        show={showToast}
        style={[{ zIndex: 999 }, successStyle]}
      />
    )
  }

  return (
    <View style={styles.container}>
      {props.children}
      {renderGlobalToast()}
      <ModalContainer />
    </View>
  )
}

FullView.propTypes = {}

FullView.defaultProps = defaultProps

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  flexRow: { flexDirection: 'row' },
  flexBetween: {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  flexStart: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  }
})

export default FullView
