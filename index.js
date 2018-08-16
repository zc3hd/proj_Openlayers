(function($, window) {
  function CC(opts) {
    var me = this;


    me.conf = {
      // 追踪模式
      monitor: {
        // 起点坐标
        p: [116.06, 39.67],
        // 波动系数
        set_num: 0.05,
        // 线的样式
        line_style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            width: 3,
            color: [255, 0, 0, 1],
            lineDash: [10, 10],
          })
        }),
        // 刷新时间
        time: 200,
      },

      // 监控
      all_monitor: {
        // 刷新时间
        time: 1000,
      },

      // 历史轨迹
      history: {
        // 运动标识
        move_key: false,
        // 轨迹时间
        time: 100,
      },


      // fence
      fence: {
        // 1有数据 2没有数据 3编辑模式
        mode: 2,


        // 图标数据
        icon: {
          icon_1: { type: 'icon', src: './img/1.png' },
          icon_2: { type: 'icon', src: './img/2.png' },
          icon_3: { type: 'icon', src: './img/3.png' },
          icon_4: { type: 'icon', src: './img/4.png' },
          icon_5: { type: 'icon', src: './img/5.png' },
          icon_6: { type: 'icon', src: './img/6.png' },
          icon_7: { type: 'icon', src: './img/7.png' },
          icon_8: { type: 'icon', src: './img/8.png' },
          icon_9: { type: 'icon', src: './img/9.png' },
          icon_10: { type: 'icon', src: './img/10.png' },
          icon_11: { type: 'icon', src: './img/11.png' },
          icon_12: { type: 'icon', src: './img/12.png' },
          icon_13: { type: 'icon', src: './img/13.png' },
          icon_14: { type: 'icon', src: './img/14.png' },
          icon_15: { type: 'icon', src: './img/15.png' },
          icon_16: { type: 'icon', src: './img/16.png' },
          car: { type: 'icon', src: './img/car.png' },
          user: { type: 'icon', src: './img/user.png' },
          Point: { type: 'Point', src: './img/Point.png' },
          LineString: { type: 'LineString', src: './img/LineString.png' },
          Circle: { type: 'Circle', src: './img/Circle.png' },
          Polygon: { type: 'Polygon', src: './img/Polygon.png' },
        },
        // 选择的绘制模式的ID
        type_id: '',
        // 选择的绘制模式
        type: null,

        // 选择类型后的样式
        style: {
          // 图标样式
          icon: null,

          // 点
          Point: new ol.style.Style({
            // 绘制的那个标记
            image: new ol.style.Circle({
              radius: 20,
              stroke: new ol.style.Stroke({
                color: 'rgb(18,150,219)'
              }),
              fill: new ol.style.Fill({
                color: 'rgb(18,150,219)'
              })
            }),
          }),
          // 
          LineString: new ol.style.Style({
            // 线
            stroke: new ol.style.Stroke({
              color: 'rgb(212,35,122)',
              width: 5
            }),
            // 绘制的那个标记
            image: new ol.style.Circle({
              radius: 5,
              stroke: new ol.style.Stroke({
                color: 'rgb(212,35,122)'
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.6)'
              })
            }),
          }),
          // 
          Circle: new ol.style.Style({
            // 填充
            fill: new ol.style.Fill({
              color: 'rgba(0,0,0, 0.1)'
            }),
            // 线
            stroke: new ol.style.Stroke({
              color: 'rgb(212,35,122)',
              width: 5
            }),


            // 绘制的那个标记
            image: new ol.style.Circle({
              radius: 5,
              stroke: new ol.style.Stroke({
                color: 'rgb(212,35,122)'
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.6)'
              })
            }),
          }),
          // 
          Polygon: new ol.style.Style({
            // 填充
            fill: new ol.style.Fill({
              color: 'rgba(0,0,0, 0.1)'
            }),
            // 线
            stroke: new ol.style.Stroke({
              color: 'rgb(212,35,122)',
              width: 5
            }),


            // 绘制的那个标记
            image: new ol.style.Circle({
              radius: 5,
              stroke: new ol.style.Stroke({
                color: 'rgb(212,35,122)'
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.6)'
              })
            }),
          }),
        },

      },







      center: [116.06, 39.67],
    };


    me.all_obj = {

      // 全局的模式
      key: null,

      // =======================追踪
      monitor: {
        // 
        layer: null,
        // 数据层
        data_c: null,
        // marker
        p_data: null,

        // 定时器标识
        timer: null,
        // 刷新标识
        key: true,
      },

      // =======================监控
      all_monitor: {
        // 
        layer: null,
        // 数据层
        data_c: null,
        // marker
        p_data: null,

        // 定时器标识
        timer: null,
        // 刷新标识
        key: true,
      },

      // =======================历史轨迹
      history: {
        // 
        layer: null,
        // 数据层
        data_c: null,
        // marker
        p_data: null,
      },


      // ======================电子围栏
      fence: {
        // 
        layer: null,
        // 数据层
        data_c: null,

        // 绘画工具
        draw_tool: null,
        // 编辑模式
        modify_tool: null,
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
          me._map();

          // 导航
          me._nav();
        },
        _nav: function() {
          var key = null;
          $('#nav')
            .on('click', '.item', function(e) {
              // 上是轨迹且运动中
              if ((me.all_obj.key == 3) && me.conf.history.move_key) {
                layer.msg('请等待轨迹模拟完成');
                return;
              }

              // 其他item
              if (!$(e.currentTarget).hasClass('ac')) {
                $('#nav>.item').removeClass('ac');
                $(e.currentTarget).addClass('ac');

                key = $(e.currentTarget).attr('key');


                // 上个模式的的清除
                me._nav_mode_clear();

                // 进入模式选择
                setTimeout(function() {
                  me._nav_mode(key);
                }, 500);

              }
            });


          me._nav_mode($('#nav>.ac').attr('key'));
        },




        // 模式清除
        _nav_mode_clear: function() {
          // 没有复制
          if (me.all_obj.key == null) {
            return;
          }
          // 上次是追踪模式
          else if (me.all_obj.key == 1) {

            console.log('_clear_monitor');
            me._monitor_clear();
          }
          // 上次是监控模式
          else if (me.all_obj.key == 2) {

            console.log('_clear_all_m');
            me._all_m_clear();
          }
          // 上次是轨迹模式
          else if (me.all_obj.key == 3) {

            console.log('_clear_history');
            me._history_clear();
          }
          // 上次是电子围栏
          else if (me.all_obj.key == 4) {

            console.log('_clear_fence');
            me._fence_layer_clear();
          }
        },
        // 模式选择
        _nav_mode: function(key) {


          // 追踪模式
          if (key == 1) {
            me._monitor();
          }
          // 实时监控
          else if (key == 2) {
            me._all_m();
          }
          // 历史轨迹
          else if (key == 3) {
            me._history();
          }
          // 绘制
          else if (key == 4) {
            me._fence();
          }

          // 全局拿到模式的标识--用于清除时判断上一次的业务。
          me.all_obj.key = key;
        },





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




        // ==========================================================
        // 
        _monitor: function() {
          // 初始化参数
          me._monitor_set();
          // 层构建
          me._monitor_layer();
          // 打点
          me._monitor_p();



          // 开始移动
          me._monitor_init();
        },
        // 初始化参数
        _monitor_set: function() {
          me.all_obj.monitor.key = true;
        },
        // 层数据
        _monitor_layer: function() {

          // 层
          me.all_obj.monitor.layer = new ol.layer.Vector();

          // 数据容器
          me.all_obj.monitor.data_c = new ol.source.Vector();

          // 注入层
          me.all_obj.monitor.layer.setSource(me.all_obj.monitor.data_c);

          // 打到地图上
          me.map.addLayer(me.all_obj.monitor.layer);
        },

        // 点
        _monitor_p: function() {
          // console.log(mk_data_c);
          // 创建一个活动图标需要的Feature，并设置位置
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point(me.conf.monitor.p)
          });


          p_data.setStyle(new ol.style.Style({
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
          }));

          // 数据层收集marker
          me.all_obj.monitor.data_c.addFeature(p_data);

          // 最优一次
          // 最优一次
          me._map_fit(me.all_obj.monitor.data_c);

          // 拿到全局
          me.all_obj.monitor.p_data = p_data;
        },
        // 开始追踪
        _monitor_init: function() {
          // 追踪
          var old_p = null;
          var new_p = [0, 0];


          me.all_obj.monitor.timer = setTimeout(function() {
            // 得到旧的点
            old_p = me.all_obj.monitor.p_data.getGeometry().flatCoordinates;


            // ***********************************模拟数据
            if (Math.random() > 0.5) {
              new_p[0] = old_p[0] + Math.random() * me.conf.monitor.set_num;
            } else {
              new_p[0] = old_p[0] - Math.random() * me.conf.monitor.set_num;
            }


            if (Math.random() > 0.5) {
              new_p[1] = old_p[1] + Math.random() * me.conf.monitor.set_num;
            } else {
              new_p[1] = old_p[1] - Math.random() * me.conf.monitor.set_num;
            }
            // *******************************************



            if (me.all_obj.monitor.key) {
              // 移动点--改变这个数据就行了
              me.all_obj.monitor.p_data.setGeometry(new ol.geom.Point(new_p));


              me.all_obj.monitor.p_data.getStyle().getImage()
                .setRotation(me._map_p_rotation(new_p, old_p));

              // 线的数据
              me._monitor_init_line(new_p, old_p);

              // 
              me._monitor_init();

              console.log('monitor');
            }
          }, me.conf.monitor.time);
        },
        // 初始化线
        _monitor_init_line: function(new_p, old_p) {

          var line_data = new ol.Feature({
            geometry: new ol.geom.LineString([old_p, new_p])
          });
          line_data.setStyle(me.conf.monitor.line_style);

          // 注入容器
          me.all_obj.monitor.data_c.addFeature(line_data);
        },
        // 清除
        _monitor_clear: function() {
          // 清除定时器
          clearTimeout(me.all_obj.monitor.timer);
          me.all_obj.monitor.key = false;

          // 清除所有数据
          me.all_obj.monitor.data_c.clear();
          // 清除这层
          me.map.removeLayer(me.all_obj.monitor.layer);
        },



        // ==========================================================
        _history: function() {
          me._history_set();
          // 层
          me._history_layer();


          // 点
          me._history_p();
          // 线
          me._history_lines();


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
          p_data.setStyle(
            new ol.style.Style({
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
                rotation: me._map_p_rotation(lines_arr[1], lines_arr[0]),
              }),

              text: new ol.style.Text({
                // 对其方式
                textAlign: 'center',
                // 基准线
                textBaseline: 'middle',
                offsetY: -25,
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
                  color: 'rgba(0,0,0,0.6)'
                }),
              })
            })
          );

          // 数据层收集marker
          me.all_obj.history.data_c.addFeature(p_data);

          // 拿到全局
          me.all_obj.history.p_data = p_data;
        },
        // 
        _history_lines: function() {
          var lines_data = new ol.Feature({
            geometry: new ol.geom.LineString(lines_arr)
          });

          lines_data.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
              width: 8,
              color: [255, 0, 0, 1],
              lineDash: [10, 10],
            })
          }));

          // 注入数据层
          me.all_obj.history.data_c.addFeature(lines_data);
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
        // 清除
        _history_clear: function() {

          // 清除所有数据
          me.all_obj.history.data_c.clear();
          // 清除这层
          me.map.removeLayer(me.all_obj.history.layer);

          $('#tool')
            .hide();
        },





























        // ========================================
        _fence: function() {

          // 层
          me._fence_layer();

          // 初始化数据
          me._fence_init();

          // 设置
          me._fence_ev_mode();
        },
        // 
        _fence_layer: function() {

          // 矢量容器层
          me.all_obj.fence.layer = new ol.layer.Vector();

          // 注入数据层--可以注入多个Feature，每个feature有自己的数据和样式
          me.all_obj.fence.data_c = new ol.source.Vector();

          // 
          me.all_obj.fence.layer.setSource(me.all_obj.fence.data_c);

          // 打到地图上
          me.map.addLayer(me.all_obj.fence.layer);
        },

        // 初始化数据
        _fence_init: function() {
          // 拿到数据
          me._fence_storage_get();
          var marker = null;

          if (fence_data.length == 0) {
            layer.msg('本地没有数据');
            return;
          }

          fence_data.forEach(function(ele, index) {
            // 图标
            if (ele.type == 'icon') {
              marker = me._fence_init_icon(ele);
            }
            // 点 
            else if (ele.type == 'Point') {
              marker = me._fence_init_Point(ele);
            }
            // 线 
            else if (ele.type == 'LineString') {
              marker = me._fence_init_LineString(ele);
            }
            // 线 
            else if (ele.type == 'Circle') {
              marker = me._fence_init_Circle(ele);
            }
            // 多边形
            else if (ele.type == 'Polygon') {
              marker = me._fence_init_Polygon(ele);
            }

            // 挂载属性
            marker.type = ele.type;
            marker.type_id = ele.style;

            // 数据层收集marker
            me.all_obj.fence.data_c.addFeature(marker);
          });

          me._map_fit(me.all_obj.fence.data_c);
        },
        // 图标
        _fence_init_icon: function(ele) {
          var marker = new ol.Feature({
            geometry: new ol.geom.Point(ele.path)
          });
          marker.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
              src: me.conf.fence.icon[ele.style].src,
              anchor: [0.5, 0.5],
              // 这个直接就可以控制大小了
              scale: 0.5
            }),
          }));

          return marker;
        },
        // 点 
        _fence_init_Point: function(ele) {
          var marker = new ol.Feature({
            geometry: new ol.geom.Point(ele.path)
          });
          marker.setStyle(me.conf.fence.style[ele.style]);

          return marker;
        },
        // 线
        _fence_init_LineString: function(ele) {
          var marker = new ol.Feature({
            geometry: new ol.geom.LineString(ele.path)
          });
          marker.setStyle(me.conf.fence.style[ele.style]);

          return marker;
        },
        // 圆
        _fence_init_Circle: function(ele) {
          var marker = new ol.Feature({
            geometry: new ol.geom.Circle(ele.center, ele.r)
          });
          marker.setStyle(me.conf.fence.style[ele.style]);

          return marker;
        },
        // 多边形
        _fence_init_Polygon: function(ele) {
          var marker = new ol.Feature({
            geometry: new ol.geom.Polygon(ele.path)
          });
          marker.setStyle(me.conf.fence.style[ele.style]);

          return marker;
        },


        // 围栏事件的模式选择
        _fence_ev_mode: function() {
          // me._fence_sel();

          // 有数据--可以清除画布 可以编辑画布
          if (me.conf.fence.mode == 1) {

            $('#tool')
              .show()
              .html(`
                <div class="item mode_2" id="f_edit_ing">开启编辑</div>
                <div class="item mode_2" id="f_edit_done">编辑完成</div>
                <div class="item mode_2" id="f_edit_out">退出编辑</div>
                `)
              .off()
              // 开启编辑
              .on('click', '#f_edit_ing', function() {
                me._fence_edit_ing();
              })
              // 编辑完成
              .on('click', '#f_edit_done', function() {
                me._fence_edit_done();
              })
              .on('click', '#f_edit_out', function() {
                me._fence_edit_out();
              });


            // 编辑完成先影藏
            $('#f_edit_ing').show();
            $('#f_edit_done').hide();
          }
          // 没有数据--选择样式/绘画完成
          else if (me.conf.fence.mode == 2) {

            $('#tool')
              .show()
              .html(`
                <div class="item mode_1" id="f_sel">选择样式</div>
                <div class="item mode_1" id="f_draw_done">绘画完成</div>
                <div class="item mode_1" id="f_in_edit">进入编辑</div>

                <div class="item mode_place" >**</div>

                <div class="item mode_red" id="f_clear">清除画布</div>
                <div class="item mode_green" id="f_save">保存画布</div>
                `)
              .off()
              // 选择样式
              .on('click', '#f_sel', function() {
                me._fence_sel();
              })
              // 绘制完成
              .on('click', '#f_draw_done', function() {
                me._fence_draw_done();
              })
              // 进入编辑
              .on('click', '#f_in_edit', function() {
                me._fence_in_edit();
              })
              // 清除
              .on('click', '#f_clear', function() {
                me._fence_clear();
              })
              // 保存数据
              .on('click', '#f_save', function() {
                me._fence_save();
              });
          }
        },
        // ==========================编辑模式
        // 开启编辑
        _fence_edit_ing: function() {
          // ing 隐藏
          $('#f_edit_ing').hide();
          // done 显示
          $('#f_edit_done').show();


          // 开启编辑模式
          me.all_obj.fence.modify_tool = new ol.interaction.Modify({
            source: me.all_obj.fence.data_c
          });

          me.map.addInteraction(me.all_obj.fence.modify_tool);
        },
        // 完成编辑
        _fence_edit_done: function() {
          // 编辑完成先影藏
          $('#f_edit_ing').show();
          $('#f_edit_done').hide();

          // 清除模式
          me.map.removeInteraction(me.all_obj.fence.modify_tool);
          me.all_obj.fence.modify_tool = null;

          // 围栏保存
          me._fence_save();
        },
        // 退出编辑
        _fence_edit_out: function() {
          // 没有编辑完成
          if (me.all_obj.fence.modify_tool != null) {
            layer.msg('请先完成编辑');
            return;
          }
          // 完成编辑了
          else {

            // 绘画模式
            me.conf.fence.mode = 2;
            me._fence_ev_mode();
          }
        },
        // ==========================绘画模式
        // 绘制选择
        _fence_sel: function() {

          layer.open({
            type: 1,
            title: false,
            area: ['520px', '600px'],
            skin: 'cc_layer',
            anim: 1,
            shade: 0.6,
            closeBtn: 0,
            btn: false,
            content: `
            <div class='layer_core' id="layer_core_page">

              <div class="title">
                选择样式
              </div>

              <div class="box">
                
                <div class="main_box" id="sel_box">


                </div>

                <div class="tool">
                  <div class="box">
                    <span class="cancel" id="cancel">cancel</span>
                    <span class="save" id="save">save</span>
                  </div>
                </div>
                
              </div>
            </div>
            `,
            success: function(layero, index) {

              // 取消事件
              me._fence_sel_cancel(index);

              // 加载图片
              me._fence_sel_img();

              // 绘画初始化
              me._fence_sel_init(index);
            },
          });
        },
        // 取消事件
        _fence_sel_cancel: function(index) {
          // 取消
          $('#cancel')
            .off()
            .on('click', function() {
              layer.close(index);
            });
        },
        // 开始绘制的加载图片
        _fence_sel_img: function() {
          var str = '';
          // 加载图标
          for (var name in me.conf.fence.icon) {
            str += `
                <div class="normal">
                  <div class="box" type=${me.conf.fence.icon[name].type} type_id=${name}>
                    <div class="title">${name}</div>
                    <img src=${me.conf.fence.icon[name].src} alt="">
                  </div>
                </div>
                `;
          }

          $('#sel_box').html(str);

          var key = null;
          $('#sel_box')
            .off()
            .on('click', '.box', function(e) {
              key = $(e.currentTarget).hasClass('ac');
              // 点击其他项目
              if (!key) {
                $('#sel_box .box').removeClass('ac');
                $(e.currentTarget).addClass('ac');

                // 全局拿到绘制的样式的ID
                me.conf.fence.type = $(e.currentTarget).attr('type');
                me.conf.fence.type_id = $(e.currentTarget).attr('type_id');
              }
            });
        },
        // 开始绘制初始化
        _fence_sel_init: function(index) {
          $('#save')
            .off()
            .on('click', function() {

              // 初始化工具
              me._fence_sel_tool_drawing();

              // 关闭图层
              layer.close(index);
            });
        },
        // 初始化绘画工具绘画中
        _fence_sel_tool_drawing: function() {
          // 清除工具
          if (me.all_obj.fence.draw_tool != null) {
            me.map.removeInteraction(me.all_obj.fence.draw_tool);
          }


          // 不是icon
          if (me.conf.fence.type != 'icon') {
            // 工具
            me.all_obj.fence.draw_tool = new ol.interaction.Draw({
              type: me.conf.fence.type,
              // 注意设置source，这样绘制好的线，就会添加到这个source里
              source: me.all_obj.fence.data_c,
              // 设置绘制时的样式
              style: me.conf.fence.style[me.conf.fence.type],
            });
          }
          // icon
          else {
            // 设置样式
            me.conf.fence.style[me.conf.fence.type] = new ol.style.Style({
              // 绘制的那个标记
              image: new ol.style.Icon({
                src: me.conf.fence.icon[me.conf.fence.type_id].src,

                // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
                anchor: [0.5, 0.5],
                // 这个直接就可以控制大小了
                scale: 0.5
              }),
            });

            // 工具
            me.all_obj.fence.draw_tool = new ol.interaction.Draw({
              type: "Point",
              // 注意设置source，这样绘制好的线，就会添加到这个source里
              source: me.all_obj.fence.data_c,
              // 设置绘制时的样式
              style: me.conf.fence.style[me.conf.fence.type],
            });
          }
          // 添加工具
          me.map.addInteraction(me.all_obj.fence.draw_tool);




          // 每次绘制完成
          me.all_obj.fence.draw_tool
            .on('drawend', function(event) {

              // event.feature 就是当前绘制完成的线的Feature
              event.feature.setStyle(me.conf.fence.style[me.conf.fence.type]);

              // 挂载属性
              event.feature.type = me.conf.fence.type;
              event.feature.type_id = me.conf.fence.type_id;


              // console.log(me.conf.fence.type,me.conf.fence.type_id)
            });
        },
        // ==================================
        // 绘画完成
        _fence_draw_done: function() {
          // 清除绘制工具
          me.map.removeInteraction(me.all_obj.fence.draw_tool);
          me.all_obj.fence.draw_tool = null;

          layer.msg('绘制完成');
        },
        // 进入编辑
        _fence_in_edit: function() {
          // 没有数据
          if (me.all_obj.fence.data_c.getFeatures().length == 0) {
            layer.msg('您还没有绘制');
            return;
          }
          // 有数据
          else {
            // 绘画中
            if (me.all_obj.fence.draw_tool != null) {
              layer.msg('请先完成绘制，再进入编辑');
              return;
            }
            // 画完了
            else {
              // 清除绘制工具
              me.map.removeInteraction(me.all_obj.fence.draw_tool);
              me.all_obj.fence.draw_tool = null;

              // 进入模式1
              me.conf.fence.mode = 1;
              // 重新进入模式
              me._fence_ev_mode();
            }

          }
        },
        // ==================================
        // 清除画布
        _fence_clear: function() {
          // 清除画布
          me.all_obj.fence.data_c.clear();

          // 清除数据
          window.localStorage.setItem("fence_data", JSON.stringify([]));

          layer.msg('清除完成');

          // 不清除工具
          // me.map.removeInteraction(me.all_obj.fence.draw_tool);
          // me.all_obj.fence.draw_tool = null;
        },
        // ==================================
        // 提交数据
        _fence_save: function() {
          // 没有数据
          if (me.all_obj.fence.data_c.getFeatures().length == 0) {
            layer.msg('您还没有进行绘制');
            return;
          }
          // 有数据
          else {
            // 绘画中
            if (me.all_obj.fence.draw_tool != null) {
              layer.msg('请先完成绘制，再进行保存');
              return;
            }
            // 画完了
            else {
              // 清除绘制工具
              me.map.removeInteraction(me.all_obj.fence.draw_tool);
              me.all_obj.fence.draw_tool = null;

              // 抽取数据
              me._fence_save_data();

              // 本地数据存储成功
              me._fence_storage_set();

              console.log(1);
            }

          }
        },
        // 抽取数据
        _fence_save_data: function() {
          fence_data.length = 0;
          me.all_obj.fence.data_c.getFeatures().forEach(function(ele, index) {

            // 圆圈
            if (ele.type == 'Circle') {
              fence_data.push({
                // 类别样式
                type: ele.type,
                // 具体的样式
                style: ele.type_id,
                // 中心点
                center: ele.getGeometry().getCenter(),
                // 半径
                r: ele.getGeometry().getRadius(),
              });
            }
            // icon 点 线 多边形
            else {
              fence_data.push({
                // 类别样式
                type: ele.type,
                // 具体的样式
                style: ele.type_id,
                // 中心点
                path: ele.getGeometry().getCoordinates(),
              });
            }
          });

          // console.log(fence_data);
        },
        // ==================================
        // 本地数据存储
        _fence_storage_set: function() {
          window.localStorage.setItem("fence_data", JSON.stringify(fence_data));
          layer.msg('本地数据存储成功，字段名为fence_data');
        },
        // 读取本地数据
        _fence_storage_get: function() {
          fence_data = JSON.parse(window.localStorage.getItem("fence_data"));
        },
        // ==================================
        // 数据容器
        _fence_layer_clear: function() {

          $('#tool').hide()
            // 清除所有数据
          me.all_obj.fence.data_c.clear();
          // 清除这层
          me.map.removeLayer(me.all_obj.fence.layer);
        },






























        // ==========================================================
        // 实时监控所有
        _all_m: function() {

          // 参数设置
          me._all_m_set();

          // 设置层
          me._all_m_layer();

          // 初始化
          me._all_m_init(ps_arr);

          // 最优一次
          me._map_fit(me.all_obj.all_monitor.data_c);
        },
        // 初始化参数
        _all_m_set: function() {
          me.all_obj.all_monitor.key = true;
        },
        _all_m_layer: function() {
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
        _all_m_init: function() {


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
          ps_arr.forEach(function(ele, index) {
            // 添加点
            me._all_m_init_marker(ele);
          });


          me.all_obj.all_monitor.timer = setTimeout(function() {
            if (me.all_obj.all_monitor.key) {
              console.log('all_monitor');
              me.all_obj.all_monitor.data_c.clear();
              me._all_m_init();
            }

          }, me.conf.all_monitor.time);
        },
        // 添加点
        _all_m_init_marker: function(ele) {
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point(ele.lnglat),
          });

          p_data.setStyle(new ol.style.Style({
            // 设置一个标识
            image: new ol.style.Icon({
              src: `./img/icon_${ele.state}.png`,

              // 这个是相当于是进行切图了
              // size: [50,50],

              // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
              anchor: [0.5, 1],
              // 这个直接就可以控制大小了
              scale: 0.5
            }),

            text: new ol.style.Text({
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
            })
          }));

          // 属性关注
          p_data.ele = ele;


          // 数据层收集
          me.all_obj.all_monitor.data_c.addFeature(p_data);
        },
        // 数据容器
        _all_m_clear: function() {
          // 清除定时器
          clearTimeout(me.all_obj.all_monitor.timer);
          me.all_obj.all_monitor.key = false;

          // 清除所有数据
          me.all_obj.all_monitor.data_c.clear();
          // 清除这层
          me.map.removeLayer(me.all_obj.all_monitor.layer);
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





























      };


      for (var k in fn) {
        me[k] = fn[k];
      };
    },
  };
  window.CC = CC;
})(jQuery, window);
