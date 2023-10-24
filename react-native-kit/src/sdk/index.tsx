import React from 'react'
import Radio from '../utils/radio'
import Modal from '../components/sdk-modal'
import { ActivityIndicator, DeviceEventEmitter, Image, View } from 'react-native'
import CustomText from '../components/sdk-txt'
import Confirm,{ ConfirmProps } from '../components/sdk-apiModal/comfirm'
import EditInput, { EditPopProps } from '../components/sdk-apiModal/editInput'
import CustomPop, { CustomPopProps } from '../components/sdk-apiModal/custom'
import Tip, { TipProps } from '../components/sdk-apiModal/tip'

const { cx } = Radio

export interface TSDKUtils {
  /** 显示加载框 */
  showLoading: (txt?: string) => void
  /** 隐藏加载框 */
  hideLoading: () => void
  /** 确认框 */
  showConfirmDialog: (props: ConfirmProps) => void
  /** 编辑框 */
  showEditDialog: (props: EditPopProps) => void
  /** 自定义弹框 */
  showCustomDialog: (props: CustomPopProps) => void
  /** 提示框 */
  showTip: (props: TipProps) => void
}

const loadingIDs: number[] = []

const showLoading = (txt?: string) => {
  loadingIDs.push(
    Modal.render({
      element: (
        <View style={{ backgroundColor: '#fff', padding: cx(20), borderRadius: cx(5) }}>
          {txt && <CustomText size={cx(16)} color='#333' text={txt} />}
          <ActivityIndicator size='large' color='#333' animating={true} />
        </View>
      ),
      maskUnClosable: true
    })
  )
}

const hideLoading = () => {
  while (loadingIDs.length > 0) {
    Modal.close(loadingIDs.pop())
  }
}

const showConfirmDialog = (props: ConfirmProps) => {
  const modalID = Modal.render({
    element: (
      <Confirm
        {...props}
        onCancel={() => {
          Modal.close(modalID)
          props.onCancel?.()
        }}
        onConfirm={() => {
          Modal.close(modalID)
          props.onConfirm?.()
        }}
      />
    ),
    maskColor: '#3336',
    maskUnClosable: true
  })
}

const showEditDialog = (props: EditPopProps) => {
  const modalID = Modal.render({
    element: (
      <EditInput
        {...props}
        onCancel={() => {
          Modal.close(modalID)
        }}
        onConfirm={(t) => {
          Modal.close(modalID)
          props.onConfirm?.(t)
        }}
      />
    ),
    maskColor: '#3336',
    maskUnClosable: false
  })
}

const showCustomDialog = (props: CustomPopProps) => {
  const modalID = Modal.render({
    element: (
      <CustomPop
        {...props}
        onCancel={() => {
          Modal.close(modalID)
        }}
        onConfirm={() => {
          Modal.close(modalID)
          props.onConfirm?.()
        }}
      />
    ),
    maskColor: '#3336',
    maskUnClosable: false
  })
}

const showTip = (props: TipProps) => {
  const modalID = Modal.render({
    element: (
      <Tip
        {...props}
        onConfirm={() => {
          Modal.close(modalID)
          props.onConfirm?.()
        }}
      />
    ),
    maskColor: '#3336',
    maskUnClosable: true
  })
}

const Sdks:TSDKUtils={
    showLoading,
    hideLoading,
    showConfirmDialog,
    showEditDialog,
    showCustomDialog,
    showTip
}

export default Sdks