import React from "react"
import { StyleSheet, TextStyle, TouchableOpacity, View } from "react-native"
import APIModal, { BaseModalProps } from "."
import Radio from "../../utils/radio"
import CustomText from "../sdk-txt"

const { cx } = Radio

export type ConfirmFooterProps = { footerType?: "both" | "cancel" | "confirm", cancelTxt?: TxtInfo, confirmTxt?: TxtInfo, onCancel?: () => void, onConfirm?: () => void }

export const ConfirmFooter = ({ footerType: type, cancelTxt, confirmTxt, onCancel, onConfirm }: ConfirmFooterProps) => (
  <>
    {type !== "confirm" && (
      <TouchableOpacity onPress={onCancel} style={styles.btn}>
        <CustomText
          style={[styles.cancelTxt, cancelTxt?.textStyle]}
          text={cancelTxt?.text || 'Cancel'}
        />
      </TouchableOpacity>
    )}
    {type === "both" && (<View style={{ width: cx(1), backgroundColor: "#e6e6e6", height: cx(33) }} />)}
    {type !== "cancel" && (
      <TouchableOpacity onPress={onConfirm} style={styles.btn}>
        <CustomText
          style={[styles.confirmTxt, confirmTxt?.textStyle]}
          text={confirmTxt?.text || 'Confirm'}
        />
      </TouchableOpacity>
    )}
  </>
)

type TxtInfo = {
  text: string
  textStyle?: TextStyle
}


export type ConfirmProps = BaseModalProps & ConfirmFooterProps & {
}

/**
 *
 * @param props {ConfirmProps}
 * @returns
 */
const Confirm: React.FunctionComponent<ConfirmProps> = (props: ConfirmProps) => {
  const { style, title, titleStyle, hideTitleLine, ...footerProps } = props
  return (
    <APIModal
      {...{ style, title, titleStyle, hideTitleLine, }}
      content={undefined}
      footer={<ConfirmFooter {...footerProps} />}
    />
  )
}

Confirm.defaultProps = {}

const styles = StyleSheet.create({
  title: {
    color: '#333333',
    fontSize: cx(15),
    marginVertical: cx(20)
  },
  btn: { flex: 1, justifyContent: 'center', alignItems: 'center', height: cx(50), marginVertical: cx(4) },
  cancelTxt: {
    fontSize: cx(16),
    color: '#999999'
  },
  confirmTxt: {
    fontSize: cx(16),
    color: '#2D2926',
    fontWeight: "500"
  }
})

export default Confirm