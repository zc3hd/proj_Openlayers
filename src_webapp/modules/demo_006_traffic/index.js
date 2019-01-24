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
        center: [116.404844, 39.914935],
        minZoom: 4,
        maxZoom: 18,
      },

      // traffic
      traffic: {
        // 路显示的宽度
        w: 6,
        // 
        style: null,
      },

      // 搜索到的数据点数
      search_num: 5,
    };

    me.conf.traffic.style = {

      // 
      "未知": new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgb(173,173,173)',
          width: me.conf.traffic.w,
        }),
      }),
      // 
      "畅通": new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgb(27,172,46)',
          width: me.conf.traffic.w,
        }),
      }),
      // 
      "缓行": new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgb(255,167,0)',
          width: me.conf.traffic.w,
        }),
      }),
      // 
      "拥堵": new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgb(232,14,14)',
          width: me.conf.traffic.w,
        }),
      }),
      // 
      "严重拥堵": new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgb(142,14,11)',
          width: me.conf.traffic.w,
        }),
      }),
    };


    me.all_obj = {
      // 
      traffic: {
        // 
        layer: null,
        // 数据层
        data_c: null,


        // ======================
        // 屏幕的对角点
        points: null,
        // 屏幕的四个点
        points_4: null,

        // ======================
        // 搜索工具
        gd_search_tool: null,
        // 导航规划工具
        gd_traffic_tool: null,


        // 搜素到的数据
        search_arr: [],
        // 分组16的数组
        search_16ps_arr: [],


        // ======================

        // 加载遮罩
        load: null,
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

          // 高德
          me._gd(function() {

            // 加载OL地图
            me._ol_map();
            // 
            me._traffic_layer();
            // 
            me._ol_map_ev();
          });
        },
        // ===========================================================
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
            // ol.View 设置显示地图的视图
            view: new ol.View({
              zoom: 12,
              projection: 'EPSG:4326',
              center: me.conf.ol_map.center,
              maxZoom: me.conf.ol_map.maxZoom,
              minZoom: me.conf.ol_map.minZoom,
            }),

            // 控件
            controls: ol.control.defaults({
              attributionOptions: ({
                // 是否折叠
                collapsible: false
              })
            }),
          });
        },
        _ol_map_ev: function() {
          // 
          me._search();
          
          // 中心点移动时
          me.ol_map.getView()
            .on('change:center', function() {
              me._search();
            });
        },

        // 层和容器
        _traffic_layer: function() {

          // 矢量容器层
          me.all_obj.traffic.layer = new ol.layer.Vector();

          // 注入数据层--可以注入多个Feature，每个feature有自己的数据和样式
          me.all_obj.traffic.data_c = new ol.source.Vector();

          // 
          me.all_obj.traffic.layer.setSource(me.all_obj.traffic.data_c);

          // 打到地图上
          me.ol_map.addLayer(me.all_obj.traffic.layer);
        },

        // ===========================================================
        _search: function() {
          // 清除画布
          me.all_obj.traffic.data_c.clear();

          // 初始化屏幕四个角点的数据
          me._search_view_data();

          // 
          // me.all_obj.traffic.load = FN.load();

          // 获取要搜索点的数据
          me._search_p_data(function() {

            // 数据搜索到处理，进行16点数组处理
            me._search_p16_data();

            // 渲染
            me._search_p16_render(0);
          });
        },
        // 初始化需要的数据
        _search_view_data: function() {
          // 对角点
          me.all_obj.traffic.points = me.ol_map.getView().calculateExtent(me.ol_map.getSize());

          // 
          // 屏幕的四个点
          me.all_obj.traffic.points_4 = [
            // 左上
            [me.all_obj.traffic.points[0], me.all_obj.traffic.points[3]],
            // 右上
            [me.all_obj.traffic.points[2], me.all_obj.traffic.points[3]],
            // 右下
            [me.all_obj.traffic.points[2], me.all_obj.traffic.points[1]],
            // 左下
            [me.all_obj.traffic.points[0], me.all_obj.traffic.points[1]]
          ];
        },
        // 搜索初始化
        _search_p_data: function(cb) {
          me.all_obj.traffic.search_arr.length = 0;

          me._search_ev("国道")
            .then(function(arr) {
              me._search_p_gen_arr(arr);
              return me._search_ev("省道");
            })
            .then(function(arr) {
              me._search_p_gen_arr(arr);

              return me._search_ev("县道");
            })
            .then(function(arr) {
              me._search_p_gen_arr(arr);

              return me._search_ev("高速");
            })
            .then(function(arr) {
              me._search_p_gen_arr(arr);

              return me._search_ev("高速口");
            })
            .then(function(arr) {
              me._search_p_gen_arr(arr);

              return me._search_ev("路口");
            })
            .then(function(arr) {
              me._search_p_gen_arr(arr);

              // console.log(me.all_obj.traffic.search_arr);
              cb && cb();
            });
        },
        // 搜索后的数据推入数组
        _search_p_gen_arr: function(arr) {

          arr.forEach(function(ele, index) {
            me.all_obj.traffic.search_arr.push(ele);
          });
        },
        // 开始搜索
        _search_ev: function(key) {
          return new Promise(function(resolve, reject) {
            me.all_obj.traffic.gd_search_tool
              .searchInBounds(
                // 
                key,
                // 
                new AMap.Polygon({
                  path: me.all_obj.traffic.points_4,
                }),
                // 
                function(status, result) {
                  // console.log();
                  resolve(result.poiList.pois);
                });
          });
        },

        // ===============================
        // 拿到的数据进行处理
        _search_p16_data: function() {

          // 用于收集子数组
          var p_arr = [];

          // 子数组：用于收集16个点；
          var s_arr = null;

          // 设置每组下标的+16后的下标
          var index_limit = 0;
          me.all_obj.traffic.search_arr.forEach(function(ele, index) {
            // 16的倍数
            if (index % 16 == 0) {
              index_limit = index + 16;
              s_arr = [];
            }

            // 目前的16倍数的index在总长度内部
            if (index_limit < me.all_obj.traffic.search_arr.length) {
              // 
              s_arr.push(ele);

              // 收集完成后，添加到父数组
              if (s_arr.length == 16) {
                p_arr.push(s_arr);
              }
            }
            // 收集到最后：16倍数的index操作总长度
            else {
              s_arr.push(ele);

              // 判断收集完成的时候，添加到父数组
              if (index == me.all_obj.traffic.search_arr.length - 1) {
                p_arr.push(s_arr);
              }
            }
          });

          // 收集到16点，数组；
          me.all_obj.traffic.search_16ps_arr = p_arr;
        },


        // ===============================
        // 拿到的数据进行渲染
        _search_p16_render: function(index) {
          // 拿到一条16点要再次进行搜索的数据
          var p_obj = me._one_16_opts(me.all_obj.traffic.search_16ps_arr[index], index);

          // 渲染数据
          me._one_16_render(p_obj, function() {
            index++;
            if (index == me.all_obj.traffic.search_16ps_arr.length) {
              layer.close(me.all_obj.traffic.load);
              return;
            }
            me._search_p16_render(index);
          });
        },

        // 一条线的数据生成
        _one_16_opts: function(line_arr, line_index) {
          // console.log(line_arr, line_index);

          var start_line = null,
            end_line = null,
            start_p = null,
            end_p = null;
          // 第一条线
          if (line_index == 0) {
            // 前面那个线
            start_line = me.all_obj.traffic.search_16ps_arr[me.all_obj.traffic.search_16ps_arr.length - 1];
            // 后面那根线
            end_line = me.all_obj.traffic.search_16ps_arr[line_index + 1];
          }
          // 最后一根线
          else if (line_index == (me.all_obj.traffic.search_16ps_arr.length - 1)) {
            start_line = me.all_obj.traffic.search_16ps_arr[line_index - 1];
            end_line = me.all_obj.traffic.search_16ps_arr[0];
          }
          // 中间线
          else {
            start_line = me.all_obj.traffic.search_16ps_arr[line_index - 1];
            end_line = me.all_obj.traffic.search_16ps_arr[line_index + 1];
          }
          // 
          start_p = start_line[start_line.length - 1];
          end_p = end_line[0];


          // 中间点
          var waypoints = [];
          line_arr.forEach(function(p, index) {
            waypoints.push(new AMap.LngLat(p.location.lng, p.location.lat));
          });

          return {
            start_p: new AMap.LngLat(start_p.location.lng, start_p.location.lat),
            end_p: new AMap.LngLat(end_p.location.lng, end_p.location.lat),
            waypoints: waypoints,
          };
        },

        // ======================================
        // 渲染数据
        _one_16_render: function(p_obj, cb) {

          me.all_obj.traffic.gd_traffic_tool
            .search(p_obj.start_p, p_obj.end_p, { waypoints: p_obj.waypoints },
              function(status, result) {

                // 渲染
                me._one_16_render_init(result.routes[0].steps);

                // 
                cb && cb();
              }
            );
        },
        // 搜索到数据
        _one_16_render_init: function(arr) {
          arr.forEach(function(ele, index) {
            ele.tmcsPaths.forEach(function(line, index) {
              me._one_16_line(line);
            });
          });
        },
        // 单个数据
        _one_16_line: function(line) {

          // 数据处理
          var new_line = [];
          line.path.forEach(function(p, index) {
            new_line.push([p.lng, p.lat])
          });
          var _data = new ol.Feature({
            geometry: new ol.geom.LineString(new_line)
          });

          _data.setStyle(me.conf.traffic.style[line.status]);

          // 注入数据层
          me.all_obj.traffic.data_c.addFeature(_data);

          _data = null;
          new_line = null;
        },


        // ==========================================
        // 高德初始化
        _gd: function(cb) {
          me.gd_map = new AMap.Map("map_gd", {
            zoom: me.conf.gd_map.zoom,
            zooms: me.conf.gd_map.zooms,
          });
          me.gd_map.on('complete', function(e) {
            // 搜索插件
            me.gd_map.plugin(["AMap.PlaceSearch"], function() {

              // 搜索工具 构造地点查询类
              me.all_obj.traffic.gd_search_tool = new AMap.PlaceSearch({
                pageSize: me.conf.search_num,
                pageIndex: 1,
                map: me.gd_map,
                children: 1,
                type: '道路附属设施|交通设施服务|地名地址信息',
                extensions: "all",
              });


              // 路径规划
              me.gd_map.plugin(["AMap.Driving"], function() {

                // 构造路线导航类
                me.all_obj.traffic.gd_traffic_tool = new AMap.Driving({
                  map: me.gd_map,
                });

                cb && cb();
              });
            });
          });
        },



        // =====================最优视角
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
