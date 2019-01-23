(function($, window) {
  function CC(opts) {
    var me = this;


    me.conf = {

      // 历史轨迹
      history: {
        // 运动标识
        move_key: false,
        // 轨迹时间
        time: 450,

        // 线的样式
        line_style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            width: 10,
            color: [34, 139, 34, 0.6],
          })
        }),
        // 点的样式
        p_style: new ol.style.Style({
          // 设置一个标识
          image: new ol.style.Icon({
            src: './img/user.png',

            // 这个是相当于是进行切图了
            // size: [50,50],

            // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
            anchor: [0.5, 0.5],
            // 这个直接就可以控制大小了
            scale: 0.5,

            // 开启转向
            rotateWithView: true,
            // rotation: 0,
          }),

          text: new ol.style.Text({
            // 对其方式
            textAlign: 'center',
            // 基准线
            textBaseline: 'middle',
            offsetY: -30,
            // 文字样式
            font: 'normal 16px 黑体',
            // 文本内容
            text: "name:admin",
            // 文本填充样式
            fill: new ol.style.Fill({
              color: 'rgba(255,255,255,1)'
            }),
            padding: [5, 5, 5, 5],
            backgroundFill: new ol.style.Fill({
              color: 'rgba(0,0,255,0.6)'
            }),
          })
        }),
      },

      center: [116.06, 39.67],
    };


    me.all_obj = {
      history: {
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


      me._history();
    },
    _bind: function() {
      var me = this;

      var fn = {
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
        _history: function() {
          // 设置
          me._history_set();

          // 层
          me._history_layer();

          // 点
          me._history_p();
          // 线
          me._history_line();


          // 最优一次
          me._map_fit(me.all_obj.history.data_c);
        },
        // 一些设置
        _history_set: function() {
          $('#tool')
            .show()
            .html(`
              <div class="item his_s" id="his_s">开始</div>
            `)
            .off()
            .on('click', '#his_s', function() {
              // 隐藏
              $('#his_s').hide();
              // 运动标识
              me.conf.history.move_key = true;

              me._history_start(1);
            });

          // $('#tool')
        },
        // layer
        _history_layer: function() {

          // 矢量容器层
          me.all_obj.history.layer = new ol.layer.Vector();

          // 注入数据层--可以注入多个Feature，每个feature有自己的数据和样式
          me.all_obj.history.data_c = new ol.source.Vector();

          // 
          me.all_obj.history.layer.setSource(me.all_obj.history.data_c);

          // 打到地图上
          me.map.addLayer(me.all_obj.history.layer);
        },
        // 
        _history_p: function() {

          // console.log(mk_data_c);
          // 创建一个活动图标需要的Feature，并设置位置
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point(lines_arr[0])
          });

          p_data.setStyle(me.conf.history.p_style);

          // 数据层收集marker
          me.all_obj.history.data_c.addFeature(p_data);

          // 拿到全局
          me.all_obj.history.p_data = p_data;

          p_data = null;
        },
        // 
        _history_line: function() {
          var line_data = new ol.Feature({
            geometry: new ol.geom.LineString(lines_arr)
          });

          line_data.setStyle(me.conf.history.line_style);

          // 注入数据层
          me.all_obj.history.data_c.addFeature(line_data);

          line_data = null;
        },
        // 开始运动
        _history_start: function(index) {
          // 开始运动

          setTimeout(function() {
            index++;
            if (index == lines_arr.length) {
              // 运动完毕
              me.conf.history.move_key = false;
              layer.msg('运动完毕');

              $('#his_s').show();
              return;
            }
            // 
            else {

              var old_p = me.all_obj.history.p_data.getGeometry().flatCoordinates;
              var new_p = lines_arr[index];

              me.all_obj.history.p_data.setGeometry(new ol.geom.Point(new_p));
              me.all_obj.history.p_data
                .getStyle()
                .getImage()
                .setRotation(me._map_p_rotation(new_p, old_p));

              me._history_start(index);
            }
          }, me.conf.history.time);
        },


      };


      for (var k in fn) {
        me[k] = fn[k];
      };
    },
  };
  window.CC = CC;
})(jQuery, window);
