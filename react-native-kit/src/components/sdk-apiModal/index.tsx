import React from 'react'
import { StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import Radio from '../../utils/radio'
import CustomText from '../sdk-txt'

const { cx } = Radio

export type BaseModalProps = {
  style?: ViewStyle | (ViewStyle | undefined)[]
  title?: string
  titleStyle?: TextStyle
  hideTitleLine?: boolean
  onDismiss?: () => void
}

type APIModalProps = BaseModalProps & {
  content: Element | undefined
  footer: Element
}

const APIModal = (props: APIModalProps) => {
  const { title, hideTitleLine, titleStyle, content, footer, style } = props
  return (
    <View style={[styles.container, style]}>
      {title && (
        <>
          <CustomText style={[{
            marginVertical: cx(10),
            fontSize: cx(16),
            paddingVertical: cx(10),
            color: "#2d2926",
          }, titleStyle]} text={title} />
          {!hideTitleLine && <View style={styles.lineStyle} />}
        </>
      )}
      {content}
      <View style={[styles.lineStyle, { height: cx(3) }]} />
      <View style={styles.btnContainer}>{footer}</View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    width: cx(345),
    backgroundColor: '#FFFFFF',
    borderRadius: cx(16),
    alignItems: 'center',
    overflow: "hidden",
  },
  lineStyle: {
    width: '100%',
    height: cx(1),
    backgroundColor: '#EEEEEE'
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export default APIModal