import React from 'react'
import { StyleSheet, Text, TextProperties, TextStyle } from 'react-native'

type CustomTextType = {
  size?: number
  color?: string
  text?: string
  style?: TextStyle
} & TextProperties

class CustomText extends React.Component<CustomTextType> {
  static defaultProps: CustomTextType = {
    size: 20,
    color: '#fff',
    allowFontScaling: false
  }

  constructor(props: CustomTextType) {
    super(props)
    this.state = {
      text: props.text ? props.text : props.children
    }
  }

  componentWillReceiveProps(nextProps: CustomTextType) {
    this.setState({ text: nextProps.text ? nextProps.text : nextProps.children })
  }

  setText = (text) => {
    this.setState({ text })
  }

  setNativeProps = (nativeProps) => {
    this._text.setNativeProps(nativeProps)
  }

  render() {
    const { style, size, color, ...props } = this.props
    const { fontSize, color: styleColor } = StyleSheet.flatten([style as TextStyle])
    const realSize = fontSize || size
    const realColor = styleColor || color
    return (
      <Text
        style={[style, { fontSize: realSize, color: realColor }]}
        ref={(ref) => {
          this._text = ref
        }}
        allowFontScaling={false}
        size={realSize}
        {...props}
      >
        {this.state.text}
      </Text>
    )
  }
}
export default CustomText