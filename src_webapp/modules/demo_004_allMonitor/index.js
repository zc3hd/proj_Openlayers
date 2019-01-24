(function($, window) {
  function CC(opts) {
    var me = this;


    me.conf = {
      center: [116.06, 39.67],

      // 监控
      all_monitor: {
        // 刷新时间
        time: 1000,

        // 图片样式
        img_0_style: new ol.style.Icon({
          src: './img/icon_0.png',

          // 这个是相当于是进行切图了
          // size: [50,50],

          // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
          anchor: [0.5, 1],
          // 这个直接就可以控制大小了
          scale: 0.5
        }),
        // 图片样式
        img_1_style: new ol.style.Icon({
          src: './img/icon_1.png',

          // 这个是相当于是进行切图了
          // size: [50,50],

          // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
          anchor: [0.5, 1],
          // 这个直接就可以控制大小了
          scale: 0.5
        }),



        // 加载开关：没有加载
        text_style_key: false,
        text_style_obj: {},
      },

    };


    me.all_obj = {
      all_monitor: {
        // 
        layer: null,
        // 数据层
        data_c: null,
        // marker
        p_data: null,
      },
    };
  };
  CC.prototype = {
    init: function() {
      var me = this;
      me._bind();
      // 
      me._map();

      me._all();
    },
    _bind: function() {
      var me = this;

      var fn = {
        // =====================最优视角
        // 图最优
        _map_fit: function(data_c) {
          // console.log(data_c.getFeatures());

          // 整个容器每个元素的最小最大 集合数组
          var point_arr = [];
          data_c.getFeatures().forEach(function(ele, index) {
            point_arr.push(_one(ele.getGeometry()));
          });


          // 假设第一个点为最合适的点
          var fit_point = point_arr[0];
          point_arr.forEach(function(point, index) {

            // 最小经度
            if (point[0] < fit_point[0]) {
              fit_point[0] = point[0];
            }

            // 最小纬度
            if (point[1] < fit_point[1]) {
              fit_point[1] = point[1];
            }

            // 最大经度
            if (point[2] > fit_point[2]) {
              fit_point[2] = point[2];
            }

            // 最大纬度
            if (point[3] > fit_point[3]) {
              fit_point[3] = point[3];
            }
          });

          // 没有数据
          if (data_c.getFeatures().length == 0) {
            return;
          }
          // 单个DOM
          else if (data_c.getFeatures().length == 1) {

            me.map.getView()
              .centerOn(
                [fit_point[0], fit_point[1]],
                me.map.getSize(), [$(document).width() / 2, $(document).height() / 2]);

            me.map.getView().setZoom(12);
          }
          // 多个dom
          else {
            me.map.getView()
              .fit(fit_point, {
                size: me.map.getSize(),
                padding: [100, 100, 100, 100],
                constrainResolution: false
              });
          }


          // 单个点的最小经纬度/最大经纬度
          function _one(dom) {
            // 4点数组
            var one_p = null;
            // 类型
            var type = dom.getType();

            // 每个类型的坐标值
            var path = dom.getCoordinates();

            if (type == 'Point') {
              one_p = [path[0], path[1], path[0], path[1]];
            }
            // 多边形
            else if (type == 'Polygon') {

              var line_path = path[0];
              one_p = [line_path[0][0], line_path[0][1], line_path[0][0], line_path[0][1]];

              line_path.forEach(function(p, index) {
                // 最小经度
                if (p[0] < one_p[0]) {
                  one_p[0] = p[0];
                }
                // 最小纬度
                if (p[1] < one_p[1]) {
                  one_p[1] = p[1];
                }


                // 最大经度
                if (p[0] > one_p[2]) {
                  one_p[2] = p[0];
                }
                // 最大纬度
                if (p[1] > one_p[3]) {
                  one_p[3] = p[1];
                }
              });
            }
            // 线
            else if (type == 'LineString') {
              one_p = [path[0][0], path[0][1], path[0][0], path[0][1]];

              path.forEach(function(p, index) {
                // 最小经度
                if (p[0] < one_p[0]) {
                  one_p[0] = p[0];
                }
                // 最小纬度
                if (p[1] < one_p[1]) {
                  one_p[1] = p[1];
                }


                // 最大经度
                if (p[0] > one_p[2]) {
                  one_p[2] = p[0];
                }
                // 最大纬度
                if (p[1] > one_p[3]) {
                  one_p[3] = p[1];
                }
              });
            }
            // 圆
            else if (type == 'Circle') {
              path = dom.getCenter();
              one_p = [path[0], path[1], path[0], path[1]];
            }

            return one_p;
          }
        },
        // 点的转向角度设置  new_p 上一点的坐标 old_p 下一点的坐标
        _map_p_rotation: function(new_p, old_p) {
          // 90度的PI值
          var pi_90 = Math.atan2(1, 0);
          // 当前点的PI值
          var pi_ac = Math.atan2(new_p[1] - old_p[1], new_p[0] - old_p[0]);

          return pi_90 - pi_ac;
        },
        _map: function() {
          me.map = new ol.Map({
            target: 'map',
            // 设置地图图层
            layers: [
              // 创建一个使用Open Street Map地图源的瓦片图层
              // new ol.layer.Tile({ source: new ol.source.OSM() })
              new ol.layer.Tile({
                source: new ol.source.XYZ({
                  url: 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0'
                })
              })
            ],

            // 控件
            controls: ol.control.defaults({
              attributionOptions: ({
                // 是否折叠
                collapsible: false
              })
            }),

            logo: { src: './img/1.png', href: 'http://www.baidu.com' },

            // ol.View 设置显示地图的视图
            view: new ol.View({
              // 定义地图显示中心于经度0度，纬度0度处
              // center: [120, 39],
              // 并且定义地图显示层级为2 
              zoom: 12,
              projection: 'EPSG:4326',
              center: [116.06, 39.67],
            }),
          });
        },



        // ==========================================================
        // 实时监控所有
        _all: function() {

          // 设置层
          me._all_layer();

          // 初始化
          me._all_init();

          // 最优一次
          me._map_fit(me.all_obj.all_monitor.data_c);
        },
        _all_layer: function() {
          // 层
          me.all_obj.all_monitor.layer = new ol.layer.Vector();

          // 数据容器
          me.all_obj.all_monitor.data_c = new ol.source.Vector();

          // 注入层
          me.all_obj.all_monitor.layer.setSource(me.all_obj.all_monitor.data_c);

          // 打到地图上
          me.map.addLayer(me.all_obj.all_monitor.layer);
        },
        // 所有点的初始化
        _all_init: function() {


          // ********************************************模拟数据
          ps_arr = ps_arr;
          ps_arr.forEach(function(ele, index) {
            if (Math.random() > 0.5) {
              ele.state = 1;
            } else {
              ele.state = 0;
            }
          });
          // ********************************************模拟数据

          // 

          // 初始字体样式
          me._all_text_init();

          // 渲染数据
          me._all_render();


          me.all_obj.all_monitor.timer = setTimeout(function() {

            me._all_init();

          }, me.conf.all_monitor.time);
        },
        _all_text_init: function() {
          if (me.conf.all_monitor.text_style_key) {
            return;
          }
          me.conf.all_monitor.text_style_key = true;
          ps_arr.forEach(function(ele, index) {
            me.conf.all_monitor.text_style_obj[ele.name] = new ol.style.Text({
              // 对其方式
              textAlign: 'center',
              // 基准线
              textBaseline: 'middle',
              offsetY: -70,
              // 文字样式
              font: 'normal 16px 黑体',
              // 文本内容
              text: ele.name,
              // 文本填充样式
              fill: new ol.style.Fill({
                color: 'rgba(255,255,255,1)'
              }),
              padding: [5, 15, 5, 15],
              backgroundFill: new ol.style.Fill({
                color: 'rgba(0,0,0,0.6)'
              }),
            });
          });
        },
        _all_render: function() {
          me.all_obj.all_monitor.data_c.clear();
          ps_arr.forEach(function(ele, index) {
            //
            me._all_marker(ele);
          });
        },
        //
        _all_marker: function(ele) {
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point(ele.lnglat),
          });

          // me.conf.all_monitor.text_style.setText(ele.name);

          p_data.setStyle(new ol.style.Style({
            // 设置一个标识
            image: me.conf.all_monitor[`img_${ele.state}_style`],

            text: me.conf.all_monitor.text_style_obj[ele.name]
          }));

          // 属性关注
          // p_data.ele = ele;

          // 数据层收集
          me.all_obj.all_monitor.data_c.addFeature(p_data);

          p_data = null;
        },



      };


      for (var k in fn) {
        me[k] = fn[k];
      };
    },
  };
  window.CC = CC;
})(jQuery, window);
