import {
  StyleSheet,
  View,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  GestureResponderEvent,
  PanResponderGestureState,
  ViewStyle,
} from "react-native";
import {
  ScrollView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import React, { useCallback, useEffect, useRef } from "react";
import Arrow from "./Arrow";

// 获取屏幕的宽度和高度
const { width: winWidth, height: winHeight } = Dimensions.get("window");
// 是否是iphoneX
export const isIphoneX = Platform.OS === "ios" && winHeight >= 812;
// 获取状态栏的高度
const statusBarHeight = StatusBar.currentHeight;
// 顶部箭头的高度
const swipeTipMarginTop = Platform.OS === "ios" ? (isIphoneX ? 40 : 16) : 8;

const defaultProps = {
  width: winWidth, // 组件宽
  height: winHeight, // 组件高度
  scrollEnabled: true, // 是否可以滚动
  isShowFull: false, // 是否全屏显示，true 表示全屏显示，false 表示会离屏顶保持一个距离
  showHeight: 50, // 组件显示的高度
  minHeight: 0, // 最小高度
  startValidHeight: 30, // 滑动多少距离后组件开始展开或收起
  disabled: false, // 是否禁用
  floatSwipeTip: true, // 是否显示浮动的滑动提示图标
  renderHeader: null, // 组件头部
  showsHorizontalScrollIndicator: false, // 是否显示水平滚动条
  showsVerticalScrollIndicator: false, // 是否显示垂直滚动条
  wrapperStyle: { position: "absolute" } as ViewStyle, // 组件外层样式
  onSwiping(current: number, max: number) {}, // 滑动事件回调
};

type DefaultProps = Readonly<typeof defaultProps>;

type Props = {
  accessibilityLabel?: string; // 可访问性标签
  wrapperStyle?: ViewStyle; // 组件外层样式
  containerStyle?: ViewStyle; // 组件容器样式
  scrollViewStyle?: ViewStyle; // 滚动视图样式
  contentContainerStyle?: ViewStyle; // 内容容器样式
  children?: React.ReactNode; // 子组件
} & Partial<Omit<DefaultProps, "showHeight" | "minHeight">> &
  Required<Pick<DefaultProps, "showHeight" | "minHeight">>;

/**
 * 半模态组件
 * @param props
 * @returns
 */
const BindSheet = (props: Props) => {
  const {
    width,
    height,
    children,
    isShowFull,
    scrollEnabled,
    showHeight,
    minHeight,
    startValidHeight,
    disabled,
    wrapperStyle,
    containerStyle,
    scrollViewStyle,
    contentContainerStyle,
    floatSwipeTip,
    renderHeader,
    showsHorizontalScrollIndicator,
    showsVerticalScrollIndicator,
    accessibilityLabel,
    onSwiping,
  } = { ...defaultProps, ...props };
  // 根据 props 计算视图高度和最大最小偏移量
  const viewHeight =
    height -
    statusBarHeight -
    (isShowFull ? 0 : 20 + (Platform.OS === "ios" ? (isIphoneX ? 32 : 8) : 0)); // 视图高度
  const maxOffsetY = useRef(showHeight - viewHeight); // 最大的垂直偏移量
  const minOffsetY = useRef(showHeight - minHeight); // 最小的垂直偏移量: 默认showHeight等于minHeight，即默认滚动到顶部

  // 初始化组件引用Ref
  const positionYRef = useRef(Math.abs(maxOffsetY.current)); // 组件的垂直位置
  const arrowRef = useRef(null); // Arrow 组件的引用

  // 初始化动画值
  const heightAnimate = useRef(new Animated.Value(showHeight)).current; // 高度动画值
  const animateY = useRef(new Animated.Value(positionYRef.current)).current; // 组件位置动画值

  // 解决ios端scrollView滑动和手势冲突问题
  const contentHeightRef = useRef(0); // 内容高度
  const scrollViewHeightRef = useRef(0); // 滚动视图高度
  const scrollViewRef = useRef(null); // 滚动视图引用
  const canScrollRef = useRef(false); // 是否可以滚动
  const scrollMovingRef = useRef(false); // 滚动是否在移动

  // 当外部的showHeight值更新后，通过手势滑动到底部时，获取到的showHeight的值依然是没有更新，导致scrollView滑动不到底部。但奇怪的是通过点击顶部的按钮showHeight的值是更新后的值。
  const showHeightInnerRef = useRef(showHeight); // 内部的showHeight值
  const minHeightRef = useRef(minHeight); // 内部的minHeight值

  useEffect(() => {
    // 监听动画值变化
    animateY.addListener(({ value }) => {
      const current = Math.abs(value);
      // arrowRef.current?.update(value / maxOffsetY.current); //提示条跟随变化
      onSwiping(current, Math.abs(maxOffsetY.current));
    });
    return () => {
      animateY.removeAllListeners(); // 清除监听
    };
  }, [animateY, maxOffsetY, onSwiping]);

  useEffect(() => {
    // 监听内容高度变化
    showHeightInnerRef.current !== showHeight &&
      (showHeightInnerRef.current = showHeight);
    minHeightRef.current !== minHeight && (minHeightRef.current = minHeight);
    // 初始化组件位置
    maxOffsetY.current = showHeightInnerRef.current - viewHeight;
    minOffsetY.current = showHeightInnerRef.current - minHeightRef.current;
    // 根据当前Y位置决定显示或隐藏
    positionYRef.current === 0 ? show() : hide(); //如果当前位置是0，则留在顶部
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minHeight, showHeight]);

  /**
   * 收起组件
   */
  const hide = useCallback(() => {
    animateY.stopAnimation();
    Animated.timing(animateY, {
      toValue: Math.abs(maxOffsetY.current),
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      positionYRef.current = Math.abs(maxOffsetY.current);
      heightAnimate.setValue(showHeightInnerRef.current); //解决滑动不到底部问题
    });
  }, [animateY, heightAnimate, maxOffsetY, showHeightInnerRef]);

  /**
   * 展开组件
   */
  const show = useCallback(() => {
    heightAnimate.setValue(viewHeight); //解决滑动不到底部问题
    animateY.stopAnimation();
    Animated.timing(animateY, {
      toValue: minOffsetY.current,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      positionYRef.current = minOffsetY.current;
    });
  }, [heightAnimate, viewHeight, animateY, minOffsetY]);

  /**
   * 更新组件位置
   */
  const updateMove = useCallback(
    (dy: number) => {
      const nextPositionY = Math.min(
        Math.max(positionYRef.current + dy, minOffsetY.current),
        Math.abs(maxOffsetY.current)
      );
      return nextPositionY;
    },
    [maxOffsetY, minOffsetY]
  );

  /**
   * 手势响应器
   * @description 判断是否应该响应移动手势
   */
  const handleSetMoveResponder = useCallback(
    (event: GestureResponderEvent, { dx, dy }: PanResponderGestureState) => {
      // 禁用状态下不响应手势
      if (disabled) return false;
      // 确保子组件的按钮点击生效
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return false;
      // 小于有效滑动高度不响应手势
      if (Math.abs(dy) < startValidHeight) return false;
      // 滚动容器中不响应手势：解决ios端滑动冲突
      if (scrollMovingRef.current) return false;
      return true;
    },
    [disabled, startValidHeight]
  );

  // 手势开始: 实际函数没有调用（可有可无）
  const handlGestureStart = useCallback(
    (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const { pageY: winY } = event.nativeEvent;
    },
    []
  );

  /**
   * 手势移动
   */
  const handlGestureMove = useCallback(
    (event: GestureResponderEvent, { dy }: PanResponderGestureState) => {
      const positionY = updateMove(dy);
      animateY.setValue(positionY);
      heightAnimate.setValue(viewHeight); //解决滑动过程中高度变化问题
    },
    [animateY, heightAnimate, updateMove, viewHeight]
  );

  /**
   * 手势结束
   */
  const handlGestureEnd = useCallback(
    (event: GestureResponderEvent, { dy, vy }: PanResponderGestureState) => {
      const positionY = updateMove(dy);
      positionYRef.current = positionY;
      positionY > Math.abs(maxOffsetY.current) / 2 ? hide() : show(); // 判断滑动距离是否大于最大滑动距离的一半，大于则收起，小于则展开
    },
    [updateMove, show, hide]
  );

  /**
   * 初始化 PanResponder
   */
  const _panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: handleSetMoveResponder,
      onPanResponderStart: handlGestureStart,
      onPanResponderMove: handlGestureMove,
      onPanResponderRelease: handlGestureEnd,
    })
  ).current;

  /**
   * 处理手势状态变化
   * @param param0
   * @description 解决ios端scrollView滑动和手势冲突问题
   */
  const onHandlerStateChange = ({ nativeEvent: { state } }) => {
    //手指按下并且可滚动
    scrollMovingRef.current = state === State.BEGAN && canScrollRef.current;
  };

  /**
   * 判断是否可以滚动
   */
  const checkIfScrollable = () => {
    canScrollRef.current =
      contentHeightRef.current > scrollViewHeightRef.current;
  };

  /**
   * 处理内容变化
   * @param contentWidth
   * @param contentHeight
   */
  const handleContentSizeChange = (contentWidth, contentHeight) => {
    contentHeightRef.current = contentHeight;
    checkIfScrollable();
  };

  /**
   * 处理布局变化
   * @param event
   */
  const handleLayout = (event) => {
    scrollViewHeightRef.current = event.nativeEvent.layout.height;
    checkIfScrollable();
  };

  /**
   * 处理可见性
   */
  const handleVisibility = () => {
    positionYRef.current === Math.abs(maxOffsetY.current) ? show() : hide();
  };

  return (
    <View
      style={[wrapperStyle, { height: showHeightInnerRef.current, width }]}
      pointerEvents={"box-none"}
    >
      {/* pointerEvents={'box-none'} 解决ios端事件无法透传到子组件中 */}
      <Animated.View
        {..._panResponder.panHandlers}
        accessibilityLabel={accessibilityLabel || "FullPop"}
        style={[
          styles.container,
          containerStyle,
          {
            height: heightAnimate,
            transform: [{ translateY: animateY }],
          },
        ]}
      >
        {/* 箭头 */}
        <View
          style={[
            styles.arrow,
            {
              marginTop: swipeTipMarginTop,
            },
            floatSwipeTip && {
              position: "absolute",
              top: -swipeTipMarginTop,
              zIndex: 1,
            },
          ]}
        >
          {floatSwipeTip && <Arrow ref={arrowRef} onPress={handleVisibility} />}
        </View>
        {/* 头部组件 */}
        {renderHeader && renderHeader()}
        {/* 解决ios端scrollView滑动和手势冲突问题 */}
        <PanGestureHandler
          enabled={true}
          onHandlerStateChange={onHandlerStateChange}
        >
          {/* 内容组件 */}
          <ScrollView
            ref={scrollViewRef}
            onContentSizeChange={handleContentSizeChange}
            onLayout={handleLayout}
            style={[styles.scrollView, scrollViewStyle]}
            contentContainerStyle={[
              styles.contentContainer,
              contentContainerStyle,
            ]}
            scrollEnabled={scrollEnabled}
            showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          >
            {children}
          </ScrollView>
        </PanGestureHandler>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
  },
  arrow: {
    width: "100%",
    alignItems: "center",
  },
  scrollView: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingBottom: 0,
  },
});

export default BindSheet;
