# openlayers

* ol常用业务demo
* demo目录在`src_webapp/modules/`

* 【路径规划】可以本案例详解[here](https://blog.csdn.net/weixin_42891221/article/details/82143188)
* 【交通热力】可以本案例详解[here](https://blog.csdn.net/weixin_42891221/article/details/82218401)
* 【显示策略】思路
```
当前层级<设置的层级
zoom<zoom_set:数据由后台进行抽稀数据；

当前层级>设置的层级
zoom>zoom_set:由屏幕角点进行拿到数据，其他区域不显示数据；

页面分为三个定时器全部开启
1.宏观获取数据的定时器，一直在获取数据。设计到闭包；
2.宏观数据的渲染，数据的请求这层体验不会影响到渲染这里；
3.微观数据的实时请求，只有在层级达到时才开始拿数据进行渲染；
```

