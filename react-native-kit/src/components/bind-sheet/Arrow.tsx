import React, { forwardRef, useImperativeHandle, useState, Ref } from "react";
import { Svg, Path, G } from "react-native-svg";
import { TouchableOpacity } from "react-native";

const lineWidth = 38;
const lineHeight = 12;
const halfWidth = lineWidth / 2;

interface IProps {
  deep?: number; // 0 - 1
  onPress?: () => void;
}

/**
 * 半模态组件箭头
 * @param props
 * @returns
 */
const Arrow = forwardRef(
  (props: IProps, ref: Ref<{ update: (deep: number) => void }>) => {
    const { onPress } = props;
    const [deep, setDeep] = useState(props?.deep || 0);

    /**
     * 更新deep
     * @param deep
     */
    function update(deep: number) {
      setDeep(deep);
    }

    /**
     * 获取路径
     * @returns path
     */
    function getPath() {
      const x1 = -17;
      const x2 = -x1;
      const y = deep * 8;
      return `M${x1} 0 L0 ${y} L${x2} 0`;
    }

    /**
     * 暴露给父组件的方法
     */
    useImperativeHandle(ref, () => ({
      update: (deep: number) => {
        update(deep);
      },
    }));

    return (
      <TouchableOpacity
        onPress={() => {
          onPress && onPress();
        }}
      >
        <Svg
          width={lineWidth}
          height={2.4 * lineHeight}
          viewBox={`0 0 ${lineWidth} ${lineHeight}`}
        >
          <G x={halfWidth} y={2}>
            <Path
              d={getPath()}
              fill="transparent"
              strokeWidth={4}
              stroke="#E9E9E9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        </Svg>
      </TouchableOpacity>
    );
  }
);

export default Arrow;
