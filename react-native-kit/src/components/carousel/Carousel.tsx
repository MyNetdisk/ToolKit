import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Dimensions, FlatList, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * Carousel 组件用于展示水平滚动的轮播图。
 * @param {Object} props - 组件的属性
 * @param {Array} props.data - 渲染的数据数组
 * @param {Function} props.renderItem - 渲染每一项的函数
 * @param {number} [props.itemWidth=width * 0.8] - 每个项的宽度
 * @param {boolean} [props.enableSnap=true] - 是否启用自动对齐
 * @param {number} [props.swipeThreshold=20] - 滑动阈值，用于确定是否切换项
 * @param {number} [props.activeSlideOffset=20] - 活动项的偏移量
 * @param {number} [props.callbackOffsetMargin=5] - 用于回调的偏移量
 * @returns {JSX.Element} 渲染的组件
 */
const Carousel = ({
    data,
    renderItem,
    itemWidth = width * 0.8,
    enableSnap = true,
    swipeThreshold = 20,
    activeSlideOffset = 20,
    callbackOffsetMargin = 5,
}) => {
    const flatListRef = useRef(null);
    const [interpolators, setInterpolators] = useState([]);
    const _positionsRef = useRef([]);
    const _ignoreNextMomentum = useRef(false);
    const _scrollPos = useRef(new Animated.Value(0)).current;
    const _currentContentOffset = useRef(0);
    const _scrollEndOffset = useRef(0);
    const _scrollStartOffset = useRef(0);
    const _scrollStartActive = useRef(0);
    const _scrollEndActive = useRef(0);
    const _activeItem = useRef(null);
    const onScrollHandler = useRef(() => { });

    useEffect(() => {
        _initialize();
    }, []);

    /**
     * 初始化滚动处理程序和插值器。
     */
    const _initialize = () => {
        _setScrollHandler();
        _initPositionsAndInterpolators();
    };

    /**
     * 设置滚动处理程序。
     */
    const _setScrollHandler = () => {
        onScrollHandler.current = Animated.event(
            [{ nativeEvent: { contentOffset: { x: _scrollPos } } }],
            { useNativeDriver: true, listener: _onScroll }
        );
    };

    /**
     * 处理滚动事件。
     * @param {Object} event - 滚动事件
     */
    const _onScroll = (event) => {
        const scrollOffset = _getScrollOffset(event);
        const nextActiveItem = _getActiveItem(scrollOffset);
        const itemReached = nextActiveItem === _scrollEndActive.current;
        const scrollConditions =
            scrollOffset >= _scrollStartOffset.current - callbackOffsetMargin &&
            scrollOffset <= _scrollStartOffset.current + callbackOffsetMargin;

        _currentContentOffset.current = scrollOffset;
        if (_activeItem.current !== nextActiveItem && itemReached && scrollConditions) {
            _activeItem.current = nextActiveItem;
        }
    };

    /**
     * 初始化每个项的位置和插值器。
     */
    const _initPositionsAndInterpolators = () => {
        const interpolators = data.map((_, index) => {
            _positionsRef.current[index] = {
                start: index * itemWidth,
                end: index * itemWidth + itemWidth,
            };
            const interpolator = defaultScrollInterpolator(index);
            return _scrollPos.interpolate({ ...interpolator, extrapolate: "clamp" });
        });
        setInterpolators(interpolators);
    };

    /**
     * 默认滚动插值器。
     * @param {number} index - 当前项的索引
     * @returns {Object} 插值器配置
     */
    const defaultScrollInterpolator = (index) => {
        const range = [1, 0, -1];
        const inputRange = getInputRangeFromIndexes(range, index);
        const outputRange = [0, 1, 0];
        return { inputRange, outputRange };
    };

    /**
     * 根据索引获取输入范围。
     * @param {Array} range - 范围数组
     * @param {number} index - 当前项的索引
     * @returns {Array} 输入范围数组
     */
    const getInputRangeFromIndexes = (range, index) => {
        return range.map(i => (index - i) * itemWidth);
    };

    /**
     * 获取项的插值样式。
     * @param {number} index - 当前项的索引
     * @param {Animated.Value} animatedValue - 动画值
     * @returns {Object} 动画样式
     */
    const _getSlideInterpolatedStyle = (index, animatedValue) => {
        return defaultAnimatedStyles(animatedValue, {
            inactiveSlideScale: 0.95,
        });
    };

    /**
     * 默认动画样式。
     * @param {Animated.Value} animatedValue - 动画值
     * @param {Object} carouselProps - 轮播图属性
     * @returns {Object} 动画样式
     */
    const defaultAnimatedStyles = (animatedValue, carouselProps) => {
        const animatedOpacity = carouselProps.inactiveSlideOpacity < 1 ? {
            opacity: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [carouselProps.inactiveSlideOpacity, 1],
            }),
        } : {};

        const animatedScale = carouselProps.inactiveSlideScale < 1 ? {
            transform: [{
                scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [carouselProps.inactiveSlideScale, 1],
                }),
            }],
        } : {};

        return { ...animatedOpacity, ...animatedScale };
    };

    /**
     * 获取滚动偏移量。
     * @param {Object} event - 滚动事件
     * @returns {number} 滚动偏移量
     */
    const _getScrollOffset = (event) => {
        return event?.nativeEvent?.contentOffset?.x || 0;
    };

    /**
     * 获取活动项的索引。
     * @param {number} offset - 滚动偏移量
     * @returns {number} 活动项的索引
     */
    const _getActiveItem = (offset) => {
        const center = _getCenter(offset);
        for (let i = 0; i < _positionsRef.current.length; i++) {
            const { start, end } = _positionsRef.current[i];
            if (center + activeSlideOffset >= start && center - activeSlideOffset <= end) {
                return i;
            }
        }
        return _positionsRef.current.length - 1;
    };

    /**
     * 获取中心偏移量。
     * @param {number} offset - 滚动偏移量
     * @returns {number} 中心偏移量
     */
    const _getCenter = (offset) => {
        return offset + _getViewportOffset() - _getContainerInnerMargin();
    };

    /**
     * 获取容器内部边距。
     * @returns {number} 容器内部边距
     */
    const _getContainerInnerMargin = () => {
        return (width - itemWidth) / 2;
    };

    /**
     * 获取视口偏移量。
     * @returns {number} 视口偏移量
     */
    const _getViewportOffset = () => {
        return width / 2;
    };

    /**
     * 滚动到指定项。
     * @param {number} index - 项的索引
     * @param {boolean} [animated=true] - 是否启用动画
     */
    const _snapToItem = (index, animated = true) => {
        flatListRef.current?.scrollToOffset({
            offset: index * itemWidth,
            animated,
        });
    };

    /**
     * 处理滚动开始事件。
     * @param {Object} event - 滚动事件
     */
    const _onScrollBeginDrag = (event) => {
        _scrollStartOffset.current = _getScrollOffset(event);
        _scrollStartActive.current = _getActiveItem(_scrollStartOffset.current);
        _ignoreNextMomentum.current = false;
    };

    /**
     * 处理滚动结束事件。
     * @param {Object} event - 滚动事件
     */
    const _onScrollEnd = (event) => {
        if (_ignoreNextMomentum.current) {
            _ignoreNextMomentum.current = false;
            return;
        }
        _scrollEndOffset.current = _currentContentOffset.current;
        _scrollEndActive.current = _getActiveItem(_scrollEndOffset.current);
        if (enableSnap) {
            _snapScroll(_scrollEndOffset.current - _scrollStartOffset.current);
        }
    };

    /**
     * 处理滚动的自动对齐。
     * @param {number} delta - 滚动的偏移量变化
     */
    const _snapScroll = (delta) => {
        if (_scrollStartActive.current !== _scrollEndActive.current) {
            _snapToItem(_scrollEndActive.current);
        } else {
            if (delta > swipeThreshold) {
                _snapToItem(_scrollStartActive.current + 1);
            } else if (delta < -swipeThreshold) {
                _snapToItem(_scrollStartActive.current - 1);
            } else {
                _snapToItem(_scrollEndActive.current);
            }
        }
    };

    return (
        <View style={styles.container}>
            <AnimatedFlatList
                ref={flatListRef}
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: _getContainerInnerMargin(),
                }}
                decelerationRate={0.9}
                renderItem={({ item, index }) => (
                    <Animated.View
                        style={[
                            styles.item,
                            { width: itemWidth },
                            interpolators[index] && _getSlideInterpolatedStyle(index, interpolators[index]),
                        ]}
                    >
                        {renderItem({ item, index })}
                    </Animated.View>
                )}
                onScroll={onScrollHandler.current}
                onMomentumScrollEnd={_onScrollEnd}
                onScrollBeginDrag={_onScrollBeginDrag}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        // 这里可以添加额外的样式
    },
});

export default Carousel;
