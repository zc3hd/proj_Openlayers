(function($, window) {
  function CC(opts) {
    var me = this;


    me.conf = {

      // fence
      fence: {
        // 1有数据 2没有数据 3编辑模式
        mode: 2,


        // 图标数据
        icon: {
          LineString: { type: 'LineString', src: './img/LineString.png' },
          Circle: { type: 'Circle', src: './img/Circle.png' },
          Polygon: { type: 'Polygon', src: './img/Polygon.png' },
          Point: { type: 'Point', src: './img/Point.png' },

          car: { type: 'icon', src: './img/car.png' },
          user: { type: 'icon', src: './img/user.png' },
        },

        // 选择的绘制模式的ID
        type_id: '',
        // 选择的绘制模式
        type: null,


        // 选择类型后的样式
        style: {
          // 汽车样式
          car: new ol.style.Style({
            // 绘制的那个标记
            image: new ol.style.Icon({
              src: './img/car.png',
              // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
              anchor: [0.5, 0.5],
              // 这个直接就可以控制大小了
              scale: 0.5
            }),
          }),
          // 用户样式样式
          user: new ol.style.Style({
            // 绘制的那个标记
            image: new ol.style.Icon({
              src: './img/user.png',
              // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
              anchor: [0.5, 0.5],
              // 这个直接就可以控制大小了
              scale: 0.5
            }),
          }),

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
          // 线的样式
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
          // 圆的样式
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
          // 多边形
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
      // 
      me._map();

      me._fence();
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
          var marker = null;

          if (fence_data.length == 0) {
            layer.msg('请选择样式进行绘制~');
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

          // 绘画
          $('#tool')
            .show()
            .html(`
                <div class="item f_sel" id="f_sel">选择样式</div>
                <div class="item f_draw_done" id="f_draw_done">绘画完成</div>`)
            .off()
            // 选择样式
            .on('click', '#f_sel', function() {
              me._fence_sel();
            })
            // 绘制完成
            .on('click', '#f_draw_done', function() {
              me._fence_draw_done();
            });

          // 提交数据
          $('#btn')
            .show()
            .html(`
                <div class="item f_save" id="f_save">提交数据</div>`)
            .off()
            // 保存数据
            .on('click', '#f_save', function() {
              me._fence_save();
            });
        },
        // ==========================绘画模式
        // 绘制选择
        _fence_sel: function() {

          layer.open({
            type: 1,
            title: false,
            area: ['620px', '200px'],
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

              // 加载图片
              me._fence_type_load();

              // 取消事件
              me._fence_sel_cancel(index);

              // 绘画初始化
              me._fence_sel_save(index);
            },
          });
        },
        // 开始绘制的加载图片
        _fence_type_load: function() {
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

                // 样式类型-->初始化工具用什么类型
                me.conf.fence.type = $(e.currentTarget).attr('type');
                // 绘制的样式用什么样式
                me.conf.fence.type_id = $(e.currentTarget).attr('type_id');
              }
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
        // 开始绘制初始化
        _fence_sel_save: function(index) {
          $('#save')
            .off()
            .on('click', function() {
              // 按钮
              $('#f_sel').hide();
              $('#f_draw_done').show();

              // 初始化工具
              me._fence_draw_start();

              // 关闭图层
              layer.close(index);
            });
        },


        // 初始化绘画工具，开始绘制
        _fence_draw_start: function() {
          // 清除工具
          if (me.all_obj.fence.draw_tool != null) {
            me.map.removeInteraction(me.all_obj.fence.draw_tool);
          }

          // 工具
          me.all_obj.fence.draw_tool = new ol.interaction.Draw({
            type: me.conf.fence.type == "icon" ? "Point" : me.conf.fence.type,
            // 注意设置source，这样绘制好的线，就会添加到这个source里
            source: me.all_obj.fence.data_c,
            // 设置绘制时的样式
            style: me.conf.fence.style[me.conf.fence.type_id],
          });

          // 添加工具
          me.map.addInteraction(me.all_obj.fence.draw_tool);



          // 每次绘制完成
          me.all_obj.fence.draw_tool
            .on('drawend', function(event) {

              // event.feature 就是当前绘制完成的线的Feature
              event.feature.setStyle(me.conf.fence.style[me.conf.fence.type_id]);

              // 属性
              event.feature.type = me.conf.fence.type;
              event.feature.type_id = me.conf.fence.type_id;
            });
        },

        // 绘画完成，重新进行选择
        _fence_draw_done: function() {
          // 清除绘制工具
          me.map.removeInteraction(me.all_obj.fence.draw_tool);
          me.all_obj.fence.draw_tool = null;

          layer.msg('绘制完成');

          // 按钮
          $('#f_sel').show();
          $('#f_draw_done').hide();
        },

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

              // 抽取数据
              me._fence_save_done();

              // 
              window.localStorage.setItem("fence_data", JSON.stringify(fence_data));
              layer.msg('localStorage存储成功，字段名为fence_data');
            }

          }
        },
        // 抽取数据
        _fence_save_done: function() {
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

        // ==================================

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
