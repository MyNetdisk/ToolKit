react-native-snap-carousel（https://github.com/meliorence/react-native-snap-carousel）
这个库是专门为实现复杂的轮播效果而设计的，包括左右两边部分显示内容的效果。它有非常灵活的配置，且社区支持较好。

Carousel.tsx 基于 react-native-snap-carousel
抽取出它的基础功能（左右两边部分显示内容的效果）
实现这个效果的关键是

```tsx
const animatedStyle = {
  transform: [
    {
      scale: this.state.scrollAnimation.interpolate({
        inputRange: [
          /* ... */
        ],
        outputRange: [
          /* ... */
        ],
        extrapolate: "clamp",
      }),
    },
  ],
};

<View style={animatedStyle}>{/* 轮播项内容 */}</View>;
```

其次是左右滑动距离

```tsx
sizeRef = itemWidth;

this._positions[index] = {
  start: index * sizeRef,
  end: index * sizeRef + sizeRef,
};

this._scrollOffsetRef = this._positions[index] && this._positions[index].start;

if (this._needsScrollView()) {
  wrappedRef.scrollTo(options);
} else {
  wrappedRef.scrollToOffset(options);
}
```

最关键的是要在 onMomentumScrollEnd 方法中执行更新位置逻辑

```tsx
onMomentumScrollEnd;
```

使用示例

```tsx
<View style={{ height: 200 }}>
  <Carousel
    data={data}
    renderItem={({ item, index }) => renderDeviceInfo(item, index)}
    itemWidth={width * 0.8}
    enableSnap={true}
    swipeThreshold={20}
    activeSlideOffset={20}
    callbackOffsetMargin={5}
  />
</View>
```
