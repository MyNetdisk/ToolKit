import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from 'react-native';

const PropTypes = require('prop-types');// 用于类型检查
const { width, height } = Dimensions.get('window');// 获取屏幕宽度和高度

const defaultZIndex = 8;// 默认的层叠顺序
const touchZIndex = 99;// 拖拽时的层叠顺序

//拖动列表组件
export default class AutoDragSortableView extends Component {
  constructor(props) {
    super(props);

    this.sortRefs = new Map();// 保存每个项目的引用

    // 计算每个子元素的宽度和高度
    const itemWidth = props.childrenWidth + props.marginChildrenLeft + props.marginChildrenRight;
    const itemHeight = props.childrenHeight + props.marginChildrenTop + props.marginChildrenBottom;

    // this.reComplexDataSource(true,props) // react < 16.3
    // react > 16.3 Fiber
    // 计算每行显示的项目数
    const rowNum = parseInt(props.parentWidth / itemWidth);
    // 初始化数据源，为每个元素设置初始位置和动画值
    const dataSource = props.dataSource.map((item, index) => {
      const newData = {};
      const left = (index % rowNum) * itemWidth;
      const top = parseInt(index / rowNum) * itemHeight;

      newData.data = item;
      newData.originIndex = index;// 元素原始索引
      newData.originLeft = left;// 元素原始左边距
      newData.originTop = top;// 元素原始上边距
      newData.position = new Animated.ValueXY({
        x: parseInt(left + 0.5),// 动画初始 x 轴位置
        y: parseInt(top + 0.5),// 动画初始 y 轴位置
      });
      newData.scaleValue = new Animated.Value(1);// 缩放动画初始值
      return newData;
    });
    // 设置组件初始状态
    this.state = {
      dataSource: dataSource,// 存储已处理的 dataSource
      curPropsDataSource: props.dataSource,// 当前的 props dataSource
      height: Math.ceil(dataSource.length / rowNum) * itemHeight,// 计算视图的总高度
      itemWidth,// 每个元素的宽度 
      itemHeight,// 每个元素的高度
    };

    // 创建 PanResponder 以响应用户的手势
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,// 总是响应手势
      onStartShouldSetPanResponderCapture: (evt, gestureState) => {
        this.isMovePanResponder = false;// 重置是否为移动手势
        return false;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => this.isMovePanResponder,// 只有在移动时才响应
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => this.isMovePanResponder,// 只有在移动时才捕获手势

      onPanResponderGrant: (evt, gestureState) => {},// 手势开始时的回调
      onPanResponderMove: (evt, gestureState) => this.moveTouch(evt, gestureState),// 手势移动时的回调
      onPanResponderRelease: (evt, gestureState) => this.endTouch(evt),// 手势释放时的回调

      onPanResponderTerminationRequest: (evt, gestureState) => false,// 不允许其他手势终止
      onShouldBlockNativeResponder: (evt, gestureState) => false,// 不阻止其他手势响应
    });
  }

  // react < 16.3 生命周期方法，用于接收新的 props
  // componentWillReceiveProps(nextProps) {
  //     if (this.props.dataSource != nextProps.dataSource) {
  //         this.reComplexDataSource(false,nextProps)
  //     }
  // }

  // react > 16.3 Fiber 新的生命周期方法，判断是否需要更新 state
  static getDerivedStateFromProps(nextprops, prevState) {
    const itemWidth = nextprops.childrenWidth + nextprops.marginChildrenLeft + nextprops.marginChildrenRight;
    const itemHeight = nextprops.childrenHeight + nextprops.marginChildrenTop + nextprops.marginChildrenBottom;
    // 判断是否需要重新生成 dataSource
    if (
      nextprops.dataSource != prevState.curPropsDataSource ||
      itemWidth !== prevState.itemWidth ||
      itemHeight !== prevState.itemHeight
    ) {
      const rowNum = parseInt(nextprops.parentWidth / itemWidth);
      const dataSource = nextprops.dataSource.map((item, index) => {
        const newData = {};
        const left = (index % rowNum) * itemWidth;
        const top = parseInt(index / rowNum) * itemHeight;

        newData.data = item;
        newData.originIndex = index;
        newData.originLeft = left;
        newData.originTop = top;
        newData.position = new Animated.ValueXY({
          x: parseInt(left + 0.5),
          y: parseInt(top + 0.5),
        });
        newData.scaleValue = new Animated.Value(1);
        return newData;
      });
      return {
        dataSource: dataSource,
        curPropsDataSource: nextprops.dataSource,
        height: Math.ceil(dataSource.length / rowNum) * itemHeight,
        itemWidth,
        itemHeight,
      };
    }
    return null;// 没有变化则不更新 state
  }

  componentDidMount() {
    this.initTag();// 初始化标志
    this.autoMeasureHeight();// 自动计算高度
  }

  componentDidUpdate() {
    this.autoMeasureHeight();// 更新后重新计算高度
  }

  // Compatible with different systems and paging loading
  // 兼容不同系统和分页加载
  autoMeasureHeight = () => {
    if (!this.isHasMeasure) {
      setTimeout(() => {
        this.scrollTo(1, false);// 滚动到某个位置以触发渲染
        this.scrollTo(0, false);// 返回初始位置
      }, 30);
    }
  };

  // Initialization tag
  // 初始化标志
  initTag = () => {
    this.clearAutoInterval();// 清除自动滑动计时器
    this.autoObj = {
      curDy: 0,
      scrollDx: 0,
      scrollDy: 0,
      hasScrollDy: null,
      forceScrollStatus: 0, // 0: NONE 1: DOWN 2: ONLY_DOWN -1: UP -2: ONLY_UP 
    };
  };

  // Unified processing
  // 统一处理滑动状态
  dealtScrollStatus = () => {
    const scrollData = this.curScrollData;
    if (scrollData == null || scrollData.offsetY == null) return;
    const { totalHeight, windowHeight, offsetY } = scrollData;
    if (totalHeight <= windowHeight + offsetY) {
      this.autoObj.forceScrollStatus = -2;// 仅向上滚动
    } else if (offsetY <= 0) {
      this.autoObj.forceScrollStatus = 2;// 仅向下滚动
    }
  };

  // Handle automatic slide timer
  clearAutoInterval = () => {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
  };

  // 处理自动滑动的计时器
  startAutoScroll = () => {
    if (this.autoInterval != null) {
      return;
    }

    // Start automatic swipe
    // 开始自动滑动
    this.autoInterval = setInterval(() => {
      if (
        this.autoObj.forceScrollStatus === 0 ||
        this.autoObj.forceScrollStatus === 2 ||
        this.autoObj.forceScrollStatus === -2
      ) {
        this.clearAutoInterval();// 如果状态为停止滑动，则清除计时器
        return;
      }
      // Anti-shake 1.x1
      // 滑动处理
      if (!this.curScrollData.hasScroll) {
        return;
      }
      if (this.autoObj.forceScrollStatus === 1) {
        this.autoObj.scrollDy = this.autoObj.scrollDy + this.props.autoThrottle;
      } else if (this.autoObj.forceScrollStatus === -1) {
        this.autoObj.scrollDy = this.autoObj.scrollDy - this.props.autoThrottle;
      }
      this.scrollTo(this.autoObj.scrollDy, false);
      this.dealtScrollStatus();
      // Android slide time 30ms-50ms, iOS close to 0ms, optimize Android jitter
      // Android 的滑动时间为 30ms-50ms，iOS 接近 0ms，优化 Android 的抖动
      if (Platform.OS === 'android') {
        setTimeout(() => {
          if (this.isHasMove)
            this.moveTouch(null, { dx: this.autoObj.scrollDx, dy: this.autoObj.curDy + this.autoObj.scrollDy });
        }, 1);
      } else {
        this.moveTouch(null, { dx: this.autoObj.scrollDx, dy: this.autoObj.curDy + this.autoObj.scrollDy });
      }
    }, this.props.autoThrottleDuration);
  };

  // 手势开始时的处理函数
  startTouch(touchIndex) {
    //Prevent drag
    const fixedItems = this.props.fixedItems;
    if (fixedItems.length > 0 && fixedItems.includes(touchIndex)) {
      return;
    }

    this.isHasMove = false;
    this.isHasMeasure = true;

    if (!this.props.sortable) return;

    const key = this._getKey(touchIndex);
    if (this.sortRefs.has(key)) {
      // Initialization data
      if (this.isStartupAuto()) {
        this.autoObj.scrollDy = this.autoObj.hasScrollDy = this.curScrollData.offsetY;
      }

      this.setState({
        scrollEnabled: false,
      });
      if (this.props.onDragStart) {
        this.props.onDragStart(touchIndex);
      }
      // 启动缩放动画
      Animated.timing(this.state.dataSource[touchIndex].scaleValue, {
        toValue: this.props.maxScale,
        duration: this.props.scaleDuration,
        useNativeDriver: false,
      }).start(() => {
        this.touchCurItem = {
          ref: this.sortRefs.get(key),
          index: touchIndex,
          originLeft: this.state.dataSource[touchIndex].originLeft,
          originTop: this.state.dataSource[touchIndex].originTop,
          moveToIndex: touchIndex,
        };
        this.isMovePanResponder = true;
      });
    }
  }

  // 手势移动时的处理函数
  moveTouch(nativeEvent, gestureState) {
    this.isHasMove = true;

    //if (this.isScaleRecovery) clearTimeout(this.isScaleRecovery)

    if (this.touchCurItem) {
      let { dx, dy, vy } = gestureState;
      const itemWidth = this.state.itemWidth;
      const itemHeight = this.state.itemHeight;

      const rowNum = parseInt(this.props.parentWidth / itemWidth);
      const maxWidth = this.props.parentWidth - itemWidth;
      const maxHeight = itemHeight * Math.ceil(this.state.dataSource.length / rowNum) - itemHeight;

      // Is it free to drag
      if (!this.props.isDragFreely) {
        // Maximum or minimum after out of bounds
        if (this.touchCurItem.originLeft + dx < 0) {
          dx = -this.touchCurItem.originLeft;
        } else if (this.touchCurItem.originLeft + dx > maxWidth) {
          dx = maxWidth - this.touchCurItem.originLeft;
        }
        if (!this.isStartupAuto()) {
          if (this.touchCurItem.originTop + dy < 0) {
            dy = -this.touchCurItem.originTop;
          } else if (this.touchCurItem.originTop + dy > maxHeight) {
            dy = maxHeight - this.touchCurItem.originTop;
          }
        }
      }

      if (this.isStartupAuto()) {
        const curDis = this.touchCurItem.originTop + dy - this.autoObj.hasScrollDy;
        if (nativeEvent != null) {
          const tempStatus = this.autoObj.forceScrollStatus;
          // Automatic sliding
          const minDownDiss =
            curDis +
            this.props.childrenHeight * (1 + (this.props.maxScale - 1) / 2) +
            this.props.marginChildrenTop +
            this.props.headerViewHeight;
          const maxUpDiss = curDis + this.props.marginChildrenTop + this.props.headerViewHeight;
          if ((tempStatus === 0 || tempStatus === 2) && vy > 0.01 && minDownDiss > this.curScrollData.windowHeight) {
            this.autoObj.curDy = dy;
            this.autoObj.forceScrollStatus = 1;
            this.startAutoScroll();
          } else if ((tempStatus === 0 || tempStatus === -2) && -vy > 0.01 && maxUpDiss < 0) {
            this.autoObj.curDy = dy;
            this.autoObj.forceScrollStatus = -1;
            this.startAutoScroll();
          }
        }

        // Determine whether to change steering
        if (vy != null) {
          // Slide down 1、2
          if (this.autoObj.forceScrollStatus >= 1 && -vy > 0.01) {
            this.autoObj.forceScrollStatus = 0;
            // Slide up -1、-2
          } else if (this.autoObj.forceScrollStatus <= -1 && vy > 0.01) {
            this.autoObj.forceScrollStatus = 0;
          }
        }

        // Remember the X axis
        this.autoObj.scrollDx = dx;
        // Correction data 1
        dy = dy - this.autoObj.hasScrollDy;
        if (nativeEvent != null) {
          // Correction data 2
          dy = dy + this.autoObj.scrollDy;
          // Prevent fingers from sliding when sliding automatically
          if (this.autoObj.forceScrollStatus === 1 || this.autoObj.forceScrollStatus === -1) {
            return;
          }
        }
      }

      const left = this.touchCurItem.originLeft + dx;
      const top = this.touchCurItem.originTop + dy;

      this.touchCurItem.ref.setNativeProps({
        style: {
          zIndex: touchZIndex,
        },
      });

      this.state.dataSource[this.touchCurItem.index].position.setValue({
        x: left,
        y: top,
      });

      let moveToIndex = 0;
      let moveXNum = dx / itemWidth;
      let moveYNum = dy / itemHeight;
      if (moveXNum > 0) {
        moveXNum = parseInt(moveXNum + 0.5);
      } else if (moveXNum < 0) {
        moveXNum = parseInt(moveXNum - 0.5);
      }
      if (moveYNum > 0) {
        moveYNum = parseInt(moveYNum + 0.5);
      } else if (moveYNum < 0) {
        moveYNum = parseInt(moveYNum - 0.5);
      }

      moveToIndex = this.touchCurItem.index + moveXNum + moveYNum * rowNum;

      if (moveToIndex > this.state.dataSource.length - 1) {
        moveToIndex = this.state.dataSource.length - 1;
      } else if (moveToIndex < 0) {
        moveToIndex = 0;
      }

      if (this.props.onDragging) {
        this.props.onDragging(gestureState, left, top, moveToIndex);
      }

      if (this.touchCurItem.moveToIndex != moveToIndex) {
        const fixedItems = this.props.fixedItems;
        if (fixedItems.length > 0 && fixedItems.includes(moveToIndex)) return;
        this.touchCurItem.moveToIndex = moveToIndex;
        this.state.dataSource.forEach((item, index) => {
          let nextItem = null;
          if (index > this.touchCurItem.index && index <= moveToIndex) {
            nextItem = this.state.dataSource[index - 1];
          } else if (index >= moveToIndex && index < this.touchCurItem.index) {
            nextItem = this.state.dataSource[index + 1];
          } else if (
            index != this.touchCurItem.index &&
            (item.position.x._value != item.originLeft || item.position.y._value != item.originTop)
          ) {
            nextItem = this.state.dataSource[index];
          } else if (
            (this.touchCurItem.index - moveToIndex > 0 && moveToIndex == index + 1) ||
            (this.touchCurItem.index - moveToIndex < 0 && moveToIndex == index - 1)
          ) {
            nextItem = this.state.dataSource[index];
          }

          if (nextItem != null) {
            Animated.timing(item.position, {
              toValue: { x: parseInt(nextItem.originLeft + 0.5), y: parseInt(nextItem.originTop + 0.5) },
              duration: this.props.slideDuration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: false,
            }).start();
          }
        });
      }
    }
  }

  // 手势结束时的处理函数
  endTouch(nativeEvent) {
    this.isHasMove = false;

    this.initTag();
    //clear
    if (this.touchCurItem) {
      this.setState({
        scrollEnabled: true,
      });
      if (this.props.onDragEnd) {
        this.props.onDragEnd(this.touchCurItem.index, this.touchCurItem.moveToIndex);
      }
      //this.state.dataSource[this.touchCurItem.index].scaleValue.setValue(1)
      Animated.timing(this.state.dataSource[this.touchCurItem.index].scaleValue, {
        toValue: 1,
        duration: this.props.scaleDuration,
        useNativeDriver: false,
      }).start(() => {
        if (this.touchCurItem) {
          this.touchCurItem.ref.setNativeProps({
            style: {
              zIndex: defaultZIndex,
            },
          });
          this.changePosition(this.touchCurItem.index, this.touchCurItem.moveToIndex);
          this.touchCurItem = null;
        }
      });
    }
  }

  onPressOut() {
    this.isScaleRecovery = setTimeout(() => {
      if (this.isMovePanResponder && !this.isHasMove) {
        this.endTouch();
      }
    }, 220);
  }

  changePosition(startIndex, endIndex) {
    if (startIndex == endIndex) {
      const curItem = this.state.dataSource[startIndex];
      if (curItem != null) {
        curItem.position.setValue({
          x: parseInt(curItem.originLeft + 0.5),
          y: parseInt(curItem.originTop + 0.5),
        });
      }
      return;
    }

    let isCommon = true;
    if (startIndex > endIndex) {
      isCommon = false;
      let tempIndex = startIndex;
      startIndex = endIndex;
      endIndex = tempIndex;
    }

    const newDataSource = [...this.state.dataSource].map((item, index) => {
      let newIndex = null;
      if (isCommon) {
        if (endIndex > index && index >= startIndex) {
          newIndex = index + 1;
        } else if (endIndex == index) {
          newIndex = startIndex;
        }
      } else {
        if (endIndex >= index && index > startIndex) {
          newIndex = index - 1;
        } else if (startIndex == index) {
          newIndex = endIndex;
        }
      }

      if (newIndex != null) {
        const newItem = { ...this.state.dataSource[newIndex] };
        newItem.originLeft = item.originLeft;
        newItem.originTop = item.originTop;
        newItem.position = new Animated.ValueXY({
          x: parseInt(item.originLeft + 0.5),
          y: parseInt(item.originTop + 0.5),
        });
        item = newItem;
      }

      return item;
    });

    this.setState(
      {
        dataSource: newDataSource,
      },
      () => {
        if (this.props.onDataChange) {
          this.props.onDataChange(this.getOriginalData());
        }
        // Prevent RN from drawing the beginning and end
        const startItem = this.state.dataSource[startIndex];
        this.state.dataSource[startIndex].position.setValue({
          x: parseInt(startItem.originLeft + 0.5),
          y: parseInt(startItem.originTop + 0.5),
        });
        const endItem = this.state.dataSource[endIndex];
        this.state.dataSource[endIndex].position.setValue({
          x: parseInt(endItem.originLeft + 0.5),
          y: parseInt(endItem.originTop + 0.5),
        });
      },
    );
  }

  reComplexDataSource(isInit, props) {
    const itemWidth = this.state.itemWidth;
    const itemHeight = this.state.itemHeight;
    const rowNum = parseInt(props.parentWidth / itemWidth);
    const dataSource = props.dataSource.map((item, index) => {
      const newData = {};
      const left = (index % rowNum) * itemWidth;
      const top = parseInt(index / rowNum) * itemHeight;

      newData.data = item;
      newData.originIndex = index;
      newData.originLeft = left;
      newData.originTop = top;
      newData.position = new Animated.ValueXY({
        x: parseInt(left + 0.5),
        y: parseInt(top + 0.5),
      });
      newData.scaleValue = new Animated.Value(1);
      return newData;
    });

    if (isInit) {
      this.state = {
        scrollEnabled: true,
        dataSource: dataSource,
        height: Math.ceil(dataSource.length / rowNum) * itemHeight,
      };
    } else {
      this.setState({
        dataSource: dataSource,
        height: Math.ceil(dataSource.length / rowNum) * itemHeight,
      });
    }
  }

  getOriginalData() {
    return this.state.dataSource.map((item, index) => item.data);
  }

  isStartupAuto = () => {
    if (this.curScrollData == null) {
      return false;
    }
    return true;
  };

  scrollTo = (height, animated = true) => {
    // Prevent iOS from sliding when elastically sliding negative numbers
    if (this.curScrollData) {
      if (this.autoObj.forceScrollStatus < 0 && this.curScrollData.offsetY <= 0) {
        this.autoObj.scrollDy = 0; // Correcting data system deviations
        return;
      } else if (
        this.autoObj.forceScrollStatus > 0 &&
        this.curScrollData.windowHeight + this.curScrollData.offsetY >= this.curScrollData.totalHeight
      ) {
        this.autoObj.scrollDy = this.curScrollData.offsetY; //Correcting data system deviations
        return;
      }
      //Barrel effect, the slowest is 1.x1
      this.curScrollData.hasScroll = false;
    }
    this.scrollRef && this.scrollRef.scrollTo({ x: 0, y: height, animated });
  };

  onScrollListener = ({ nativeEvent }) => {
    this.curScrollData = {
      totalHeight: nativeEvent.contentSize.height,
      windowHeight: nativeEvent.layoutMeasurement.height,
      offsetY: nativeEvent.contentOffset.y,
      hasScroll: true,
    };
  };

  // 渲染方法
  render() {
    return (
      <ScrollView
        bounces={this.props.bounces}
        scrollEventThrottle={1}
        scrollIndicatorInsets={this.props.scrollIndicatorInsets}
        ref={(scrollRef) => (this.scrollRef = scrollRef)}
        scrollEnabled={this.state.scrollEnabled}
        onScroll={this.onScrollListener}
        style={styles.container}>
        {this.props.renderHeaderView ? this.props.renderHeaderView : null}
        <View
          //ref={(ref)=>this.sortParentRef=ref}
          style={[
            styles.swipe,
            {
              width: this.props.parentWidth,
              height: this.state.height,
            },
          ]}
          //onLayout={()=> {}}
        >
          {this._renderItemView()}
        </View>
        {this.props.renderBottomView ? this.props.renderBottomView : null}
      </ScrollView>
    );
  }

  _getKey = (index) => {
    const item = this.state.dataSource[index];
    return this.props.keyExtractor ? this.props.keyExtractor(item.data, index) : item.originIndex;
  };

  _renderItemView = () => {
    const { maxScale, minOpacity } = this.props;
    const inputRange = maxScale >= 1 ? [1, maxScale] : [maxScale, 1];
    const outputRange = maxScale >= 1 ? [1, minOpacity] : [minOpacity, 1];
    return this.state.dataSource.map((item, index) => {
      const transformObj = {};
      transformObj[this.props.scaleStatus] = item.scaleValue;
      const key = this.props.keyExtractor ? this.props.keyExtractor(item.data, index) : item.originIndex;
      return (
        <Animated.View
          key={key}
          ref={(ref) => this.sortRefs.set(key, ref)}
          {...this._panResponder.panHandlers}
          style={[
            styles.item,
            {
              marginTop: this.props.marginChildrenTop,
              marginBottom: this.props.marginChildrenBottom,
              marginLeft: this.props.marginChildrenLeft,
              marginRight: this.props.marginChildrenRight,
              left: item.position.x,
              top: item.position.y,
              opacity: item.scaleValue.interpolate({ inputRange, outputRange }),
              transform: [transformObj],
            },
          ]}>
          <TouchableOpacity
            // activeOpacity = {1}
            delayLongPress={this.props.delayLongPress}
            onPressOut={() => this.onPressOut()}
            onLongPress={() => this.startTouch(index)}
            disabled={this.props.disabled}
            onPress={() => {
              if (this.props.onClickItem) {
                this.isHasMeasure = true;
                this.props.onClickItem(this.getOriginalData(), item.data, index);
              }
            }}>
            {this.props.renderItem(item.data, index)}
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  componentWillUnmount() {
    if (this.isScaleRecovery) clearTimeout(this.isScaleRecovery);
    this.clearAutoInterval();
  }
}

// 属性类型定义
AutoDragSortableView.propTypes = {
  dataSource: PropTypes.array.isRequired,// 数据源
  parentWidth: PropTypes.number,// 父级视图宽度
  childrenHeight: PropTypes.number.isRequired,// 子视图高度
  childrenWidth: PropTypes.number.isRequired,// 子视图宽度

  marginChildrenTop: PropTypes.number,// 子视图顶部外边距
  marginChildrenBottom: PropTypes.number,// 子视图底部外边距
  marginChildrenLeft: PropTypes.number,// 子视图左边外边距
  marginChildrenRight: PropTypes.number,// 子视图右边外边距

  sortable: PropTypes.bool,

  onClickItem: PropTypes.func,
  disabled: PropTypes.bool,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,// 拖动结束回调
  onDataChange: PropTypes.func,
  renderItem: PropTypes.func.isRequired,// 渲染子视图的方法
  scaleStatus: PropTypes.oneOf(['scale', 'scaleX', 'scaleY']),
  fixedItems: PropTypes.array,// 固定项
  keyExtractor: PropTypes.func,
  delayLongPress: PropTypes.number,
  isDragFreely: PropTypes.bool,
  onDragging: PropTypes.func,
  maxScale: PropTypes.number,
  minOpacity: PropTypes.number,
  scaleDuration: PropTypes.number,// 缩放动画持续时间
  slideDuration: PropTypes.number,
  autoThrottle: PropTypes.number,// 自动滑动的距离
  autoThrottleDuration: PropTypes.number,// 自动滑动的频率
  renderHeaderView: PropTypes.element,
  headerViewHeight: PropTypes.number,// 头部视图高度
  renderBottomView: PropTypes.element,
  bottomViewHeight: PropTypes.number,
  bounces: PropTypes.bool,
  scrollIndicatorInsets: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    bottom: PropTypes.number,
    right: PropTypes.number,
  }),
};

AutoDragSortableView.defaultProps = {
  marginChildrenTop: 0,
  marginChildrenBottom: 0,
  marginChildrenLeft: 0,
  marginChildrenRight: 0,
  parentWidth: width,
  sortable: true,
  scaleStatus: 'scale',
  fixedItems: [],
  isDragFreely: false,
  maxScale: 1.1,
  minOpacity: 0.8,
  scaleDuration: 100,
  slideDuration: 300,
  autoThrottle: 2,
  autoThrottleDuration: 10,
  headerViewHeight: 0,
  bottomViewHeight: 0,
  bounces: false,
  scrollIndicatorInsets: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 1,
  },
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  swipe: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  item: {
    position: 'absolute',
    zIndex: defaultZIndex,
  },
});
