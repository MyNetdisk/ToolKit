import React from "react"
import { StyleSheet } from "react-native"
import APIModal, { BaseModalProps } from "."
import Radio from "../../utils/radio"
import { ConfirmFooter, ConfirmFooterProps } from "./comfirm"

const { cx } = Radio

export type CustomPopProps = BaseModalProps & ConfirmFooterProps & {
    content: Element // 标题的文字和样式
    isBottom?: boolean
}

/**
 *
 * @param props {CustomPopProps}
 * @returns
 */
const CustomPop: React.FunctionComponent<CustomPopProps> = (props: CustomPopProps) => {
    const { style, content, isBottom, ...footerProps } = props
    return (
        <APIModal
            {...footerProps}
            style={[style, isBottom && { position: "absolute", bottom: (Radio.isIphoneX ? 20 : 0) } as any]}
            content={content}
            footer={<ConfirmFooter {...footerProps} />}
        />
    )
}

CustomPop.defaultProps = {}

const styles = StyleSheet.create({
    title: {
        color: '#333333',
        fontSize: cx(15),
        marginVertical: cx(20)
    },
    btn: { flex: 1, justifyContent: 'center', alignItems: 'center', height: cx(50) },
    cancelTxt: {
        fontSize: cx(15),
        color: '#999999'
    },
    confirmTxt: {
        fontSize: cx(15),
        color: '#0A79C3'
    }
})

export default CustomPop
