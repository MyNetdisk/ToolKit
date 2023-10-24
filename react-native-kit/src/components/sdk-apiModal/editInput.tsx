import React, { useState } from "react"
import { TextInput } from "react-native"
import { BaseModalProps } from "."
import Radio from "../../utils/radio"
import { ConfirmFooterProps } from "./comfirm"
import CustomPop from "./custom"

const { cx } = Radio

export interface EditPopProps extends ConfirmFooterProps, BaseModalProps {
    /** 默认文本 */
    defaultTxt?: string
    /** 点击确定回调， 获取结果文本 */
    onConfirm?: (t: string) => void
}

const EditInput = (props: EditPopProps) => {
    const { defaultTxt, onConfirm, ...otherProps } = props
    const [txt, setTxt] = useState(defaultTxt || "")
    return (
        <CustomPop
            {...otherProps}
            content={
                <TextInput
                    style={{
                        width: cx(289),
                        backgroundColor: "#3331",
                        fontSize: cx(16),
                        color: "#2d2926",
                        paddingHorizontal: cx(19),
                        paddingVertical: cx(12),
                        borderRadius: cx(11),
                        marginTop: cx(30),
                        marginBottom: cx(50)
                    }}
                    value={txt} onChangeText={setTxt} />
            }
            onConfirm={() => {
                onConfirm?.(txt)
            }}
        />
    )
}

export default EditInput