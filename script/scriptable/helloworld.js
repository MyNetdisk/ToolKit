// 判断是否是运行在桌面的组件中
if(config.runsInWidget){
  // 创建小部件 
  const widget = new ListWidget();
  // 添加文本
  const text = widget.addText("Hello,World");
  text.textColor = new Color("#000000");
  text.font = Font.boldSystemFont(36);
  text.centerAlignText();
  // 添加渐变色背景
  const gradient = new LinearGradient();
  gradient.locations = [0,1];
  gradient.colors = [new Color("#F5DB1A"), new Color("#F3B626")];
  widget.backgroundGradient = gradient;
  // 设置部件
  Script.setWidget(widget);
}