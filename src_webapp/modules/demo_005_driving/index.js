(function($, window) {
  function CC(opts) {
    var me = this;



    me.conf = {
      // 
      gd_map: {
        zoom: 4,
        zooms: [3, 18],
      },
      // 地图
      ol_map: {
        center: [116.06, 39.67],
        minZoom: 4,
        maxZoom: 18,
      },


      // drive
      drive: {
        // 
        style: {
          // 开始点
          start: new ol.style.Style({
            // 绘制的那个标记
            image: new ol.style.Icon({
              src: './img/start.png',

              // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
              anchor: [0.5, 1],
              // 这个直接就可以控制大小了
              scale: 0.5
            }),
          }),
          // end
          end: new ol.style.Style({
            // 绘制的那个标记
            image: new ol.style.Icon({
              src: './img/end.png',

              // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
              anchor: [0.5, 1],
              // 这个直接就可以控制大小了
              scale: 0.55
            }),
          }),

          // 
          "未知": new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgb(173,173,173)',
              width: 10
            }),
          }),
          // 
          "畅通": new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgb(27,172,46)',
              width: 10
            }),
          }),
          // 
          "缓行": new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgb(255,167,0)',
              width: 10
            }),
          }),
          // 
          "拥堵": new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgb(232,14,14)',
              width: 10
            }),
          }),
          // 
          "严重拥堵": new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgb(142,14,11)',
              width: 10
            }),
          }),
        },
      },
    };


    me.all_obj = {
      // 
      drive: {
        // 
        layer: null,
        // 数据层
        data_c: null,


        // ===================================
        // ol绘画点的工具
        ol_draw_tool: null,

        // 路径规划工具
        gd_drive_tool: null,

        // 起始点
        start: null,
        // 终止点
        end: null,

        // 收集线的容器
        lines: [],
      },
    };
  };
  CC.prototype = {
    init: function() {
      var me = this;
      me._bind();
      me._init();
    },
    _bind: function() {
      var me = this;

      var fn = {
        _init: function() {
          // 

          // 高德初始化准备
          me._gd(function() {
            // 
            me._ol_map();

            me._drive();
          });

        },

        // 路径规划
        _drive: function() {
          me._drive_layer();

          me._drive_ev();
        },
        // 层和容器
        _drive_layer: function() {

          // 矢量容器层
          me.all_obj.drive.layer = new ol.layer.Vector();

          // 注入数据层--可以注入多个Feature，每个feature有自己的数据和样式
          me.all_obj.drive.data_c = new ol.source.Vector();

          // 
          me.all_obj.drive.layer.setSource(me.all_obj.drive.data_c);

          // 打到地图上
          me.ol_map.addLayer(me.all_obj.drive.layer);
        },
        // 规划事件
        _drive_ev: function() {
          // 选点
          me._drive_sel_p_ev();

          // 搜索
          me._drive_search_ev();

          // 清除画布
          me._drive_clear();
        },
        // =================
        // 选点
        _drive_sel_p_ev: function() {
          $('#start')
            .on('click', function() {

              me._drive_draw_p('start');
            });
          $('#end')
            .on('click', function() {
              me._drive_draw_p('end');
            });
        },
        // 地图选点；
        _drive_draw_p: function(key) {
          // 对已经地图上选择的点进行重新选择
          if (me.all_obj.drive[key] != null) {
            me.all_obj.drive.data_c.removeFeature(me.all_obj.drive[key]);
            me.all_obj.drive[key] = null;
          }

          // 初始化绘制工具
          me.all_obj.drive.ol_draw_tool = new ol.interaction.Draw({
            type: "Point",
            // 注意设置source，这样绘制好的线，就会添加到这个source里
            source: me.all_obj.drive.data_c,
            // 设置绘制时的样式
            style: me.conf.drive.style[key],
          });
          // 添加工具
          me.ol_map.addInteraction(me.all_obj.drive.ol_draw_tool);


          // 每次绘制完成
          me.all_obj.drive.ol_draw_tool
            .on('drawend', function(event) {

              // 设置当前地图选择的点的样式
              event.feature.setStyle(me.conf.drive.style[key]);
              // 拿到当前的选择的点
              me.all_obj.drive[key] = event.feature;


              // 删除工具
              me.ol_map.removeInteraction(me.all_obj.drive.ol_draw_tool);
              me.all_obj.drive.ol_draw_tool = null;
            });
        },
        // =================
        _drive_search_ev: function() {
          $('#search')
            .on('click', function() {
              // 没有得到起点数据
              if (me.all_obj.drive.start == null) {
                layer.msg('请选择起始点');
                return;
              }
              // 
              if (me.all_obj.drive.end == null) {
                layer.msg('请选择终止点');
                return;
              }
              // 
              $('#clear').show();
              $('.tool ._search').hide();

              // console.log(me.all_obj.drive.start.getGeometry());
              me._drive_search_init(me.all_obj.drive.start, me.all_obj.drive.end);

              
            });
        },
        // 搜索初始化
        _drive_search_init: function(start, end) {
          // OL的坐标 
          var p_start = {
            lng: start.getGeometry().flatCoordinates[0],
            lat: start.getGeometry().flatCoordinates[1],
          };
          // GD GCJ02
          // p_start = convert.wgs_gcj02(p_start);

          var p_end = {
            lng: end.getGeometry().flatCoordinates[0],
            lat: end.getGeometry().flatCoordinates[1],
          };
          // p_end = convert.wgs_gcj02(p_end);


          // 搜索完成
          me._drive_search_done(p_start, p_end);
        },
        // 搜索完成
        _drive_search_done: function(p_start, p_end) {
          // 根据起终点经纬度规划驾车导航路线
          me.all_obj.drive.gd_drive_tool
            .search(
              new AMap.LngLat(p_start.lng, p_start.lat),
              new AMap.LngLat(p_end.lng, p_end.lat),
            );

          me.all_obj.drive.gd_drive_tool
            .on('complete', function(result) {
              // 拿到数据
              arr_data = result.routes[0].steps;

              // 初始化搜索到的路线的
              me._drive_lines_render();

              // 最优地图
              me._ol_map_fit(me.all_obj.drive.data_c);
            });
        },
        // 渲染数据
        _drive_lines_render: function() {
          // 数据清空
          me.all_obj.drive.lines.length = 0;

          arr_data.forEach(function(ele, index) {
            ele.tmcs.forEach(function(line, index) {
              me._drive_lines_one(line);
            });
          });
        },
        // 单个数据
        _drive_lines_one: function(line) {
          // console.log(line);
          // 数据处理
          var new_line = [];
          line.path.forEach(function(p, index) {
            new_line.push([p.lng, p.lat])
          });

          var _data = new ol.Feature({
            geometry: new ol.geom.LineString(new_line)
          });

          new_line = null;

          // 
          _data.setStyle(me.conf.drive.style[line.status]);

          // 注入数据层
          me.all_obj.drive.data_c.addFeature(_data);

          // 收集数据
          me.all_obj.drive.lines.push(_data);

          // 
          _data = null;
        },

        // 清除画布
        _drive_clear: function() {

          $('#clear')
            .on('click', function() {
              // 
              $('#clear').hide();
              $('.tool>._search').show();

              // 清除画布
              me.all_obj.drive.data_c.clear();
              // 参数归零
              me.all_obj.drive.start = null;
              me.all_obj.drive.end = null;
              me.all_obj.drive.lines.length = 0;
              
            });

        },





        // ==========================================
        // OL 地图
        _ol_map: function() {
          me.ol_map = new ol.Map({
            target: 'map_ol',
            // 设置地图图层
            layers: [
              //高德地图在线---火星坐标系 gcj02
              new ol.layer.Tile({
                source: new ol.source.XYZ({
                  url: 'http://webrd03.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8'
                }),
                // projection: 'EPSG:4326'
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
              zoom: 12,
              projection: 'EPSG:4326',
              center: me.conf.ol_map.center,
              maxZoom: me.conf.ol_map.maxZoom,
              minZoom: me.conf.ol_map.minZoom,
            }),
          });
        },
        // ==========================================
        // 高德初始化
        _gd: function(cb) {
          me.gd_map = new AMap.Map("map_gd", {
            zoom: me.conf.gd_map.zoom,
            zooms: me.conf.gd_map.zooms,
          });
          me.gd_map.on('complete', function(e) {
            me.gd_map.plugin(["AMap.Driving"], function() {
              //构造路线导航类
              me.all_obj.drive.gd_drive_tool = new AMap.Driving({
                map: me.gd_map,
              });

              cb && cb();
            });
          });
        },











































        // 
        // 图最优
        _ol_map_fit: function(data_c) {
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

            me.ol_map.getView()
              .centerOn(
                [fit_point[0], fit_point[1]],
                me.ol_map.getSize(), [$(document).width() / 2, $(document).height() / 2]);

            me.ol_map.getView().setZoom(12);
          }
          // 多个dom
          else {
            me.ol_map.getView()
              .fit(fit_point, {
                size: me.ol_map.getSize(),
                padding: [100, 100, 100, 100],
                constrainResolution: false
              });
          }


          // 单个点的最小经纬度/最大经纬度
          function _one(dom) {
            // 4点数组
            var one_p = null;

            // 每个类型的坐标值
            var path = dom.getCoordinates();

            // 点类型
            if (dom.getType() == 'Point') {
              one_p = [path[0], path[1], path[0], path[1]];
            }
            // 多边形
            else if (dom.getType() == 'Polygon') {

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
            else if (dom.getType() == 'LineString') {
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
            else if (dom.getType() == 'Circle') {
              path = dom.getCenter();
              one_p = [path[0], path[1], path[0], path[1]];
            }

            return one_p;
          }
        },
        // 点的转向角度设置  new_p 上一点的坐标 old_p 下一点的坐标
        _ol_map_p_rotation: function(new_p, old_p) {
          // 90度的PI值
          var pi_90 = Math.atan2(1, 0);
          // 当前点的PI值
          var pi_ac = Math.atan2(new_p[1] - old_p[1], new_p[0] - old_p[0]);

          return pi_90 - pi_ac;
        },








      };


      for (var k in fn) {
        me[k] = fn[k];
      };
    },
  };
  window.CC = CC;
})(jQuery, window);
