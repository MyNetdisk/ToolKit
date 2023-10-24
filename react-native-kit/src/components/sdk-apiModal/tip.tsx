import React from "react"
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import APIModal from "."
import Radio from "../../utils/radio"
import CustomText from "../sdk-txt"

const { cx } = Radio

type TxtInfo = {
  text: string
  textStyle?: TextStyle
}

export interface TipProps {
  style?: ViewStyle // 容器样式
  titleTxt?: TxtInfo // 标题的文字和样式
  confirmTxt?: TxtInfo
  onConfirm?: () => void
}

const Tip: React.FunctionComponent<TipProps> = (props: TipProps) => {
  const { style, titleTxt, confirmTxt, onConfirm } = props
  return (
    <APIModal
      style={style}
      content={
        <CustomText style={[styles.title, titleTxt?.textStyle]} text={titleTxt?.text || '  '} />
      }
      footer={
        <TouchableOpacity onPress={onConfirm} style={styles.btn}>
          <CustomText
            style={[styles.confirmTxt, confirmTxt?.textStyle]}
            text={confirmTxt?.text || 'Confirm'}
          />
        </TouchableOpacity>
      }
    />
  )
}

Tip.defaultProps = {}

const styles = StyleSheet.create({
  title: {
    color: '#333333',
    fontSize: cx(15),
    marginVertical: cx(20)
  },
  btn: { flex: 1, justifyContent: 'center', alignItems: 'center', height: cx(50) },
  confirmTxt: {
    fontSize: cx(15),
    color: '#0A79C3'
  }
})

export default Tip