(function($, window) {
  function CC(opts) {
    var me = this;


    me.conf = {
      center: [116.06, 39.67],

      // 第一次加载的开关
      ps_first_load_key: true,
    }


    me.all_obj = {

      // 所有点的收集
      ps_obj: {},

      // 点的数组集合
      ps_arr: [],

      // 点的层容器
      ps_Vector: null,



      // =======================追踪的一些
      monitor: {
        // 数据层
        all_data_c: null,
        // marker
        p_data: null,
      },

      // 历史轨迹
      history: {
        // 数据层
        all_data_c: null,
        // marker
        p_data: null,
      },


      // 电子围栏
      fence: {
        // 数据层
        all_data_c: null,

        // 绘画工具
        tool: null,
        // 编辑模式
        modify_tool: null,

        // 当前画的ft
        ac_feature: null,


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

          // console.log(new ol.layer.Tile({ source: new ol.source.OSM() }));

          me._map();


          // ============追踪模式
          // me._monitor();


          // ************实时监控
          // me._all_p();
          // me._all_p_ev();


          // ************历史轨迹
          // me._history();


          // ***********电子围栏
          me._fence();






          // 传统方式操作打点
          // me._fn_8();


          // me._fn_4();

          // me._fn_5();

          // me._fn_6();

        },
        // ========================================
        _fence: function() {
          /* body... */
          // 层
          me._fence_layer();

          // 绘制
          // me._fence_Polygon();

          // 开始绘制
          me._fence_start();

          // 开始编辑
          me._fence_edit();

          // 编辑完成
          me._fence_edit_done();

          // 删除绘制
          me._fence_del();

        },
        // 
        _fence_layer: function() {

          // 矢量容器层
          var layer = new ol.layer.Vector();

          // 注入数据层--可以注入多个Feature，每个feature有自己的数据和样式
          var all_data_c = new ol.source.Vector();
          me.all_obj.fence.all_data_c = all_data_c;

          // 
          layer.setSource(all_data_c);

          // 打到地图上
          me.map.addLayer(layer);
        },
        // 电子围栏
        _fence_Polygon: function() {
          var polygon_data = new ol.Feature({
            // 注意这里竟然是这样的数据格式 ol.geom.Polygon  [ 里面是我们拿到的数组 ]
            geometry: new ol.geom.Polygon([duo_arr])
          });
          polygon_data.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 0, 0, 0.5)'
            }),
            stroke: new ol.style.Stroke({
              color: 'red',
              width: 2
            }),
          }));

          // 注入数据层
          me.all_obj.fence.all_data_c.addFeature(polygon_data);
        },

        // ==================================
        // 开始绘制
        _fence_start: function() {
          var type = null;
          var style = null;
          $('#draw_start').on('click', function() {
            // 获取类型
            type = $('#draw_type').val();

            // 清除工具
            if (me.all_obj.fence.tool != null) {
              me.map.removeInteraction(me.all_obj.fence.tool);
            }
            // 初始化工具
            me._fence_tool(type);

            // 添加工具
            me.map.addInteraction(me.all_obj.fence.tool);
          });
        },
        // 初始化绘画工具
        _fence_tool: function(type) {
          me.all_obj.fence.tool = new ol.interaction.Draw({
            type: type,
            // 注意设置source，这样绘制好的线，就会添加到这个source里
            source: me.all_obj.fence.all_data_c,
            // 设置绘制时的样式
            style: new ol.style.Style({
              // 填充
              fill: new ol.style.Fill({
                color: 'rgba(220,20,60, 0.2)'
              }),
              stroke: new ol.style.Stroke({
                color: 'rgba(220,20,60, 0.8)',
                width: 2
              }),


              // 绘制的那个标记
              image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                  color: 'red'
                }),
                fill: new ol.style.Fill({
                  color: 'rgba(255, 255, 255, 0.2)'
                })
              })
            }),
          });

          // me.all_obj.fence.edit = new ol.interaction.Modify({source: me.all_obj.fence.all_data_c});

          // 每次重新绑定工具都是绑定该事件一次
          me.all_obj.fence.tool
            .on('drawend', function(event) {
              // event.feature 就是当前绘制完成的线的Feature
              me.all_obj.fence.ac_feature = event.feature;

              me.all_obj.fence.ac_feature.setStyle(new ol.style.Style({
                fill: new ol.style.Fill({
                  color: 'rgba(255, 255, 255, 0.5)'
                }),
                stroke: new ol.style.Stroke({
                  color: 'blue',
                  width: 5
                }),
              }));


              // 清除绘制工具
              me.map.removeInteraction(me.all_obj.fence.tool);



            });
        },


        // ==================================
        // 开始编辑
        _fence_edit: function() {
          $('#draw_edit').on('click', function() {

            // 编辑模式的样式
            me.all_obj.fence.ac_feature.setStyle(new ol.style.Style({
              fill: new ol.style.Fill({
                color: 'rgba(255, 0, 0, 0.5)'
              }),
              stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
              }),
            }));

            // 开启编辑模式
            me.all_obj.fence.modify_tool = new ol.interaction.Modify({
              source: me.all_obj.fence.all_data_c
            });

            me.map.addInteraction(me.all_obj.fence.modify_tool);
          });
        },
        // ==================================
        // 编辑完成
        _fence_edit_done: function() {

          $('#draw_edit_done').on('click', function() {
            // 恢复样式
            me.all_obj.fence.ac_feature.setStyle(new ol.style.Style({
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.5)'
              }),
              stroke: new ol.style.Stroke({
                color: 'blue',
                width: 5
              }),
            }));

            // 清除模式
            me.map.removeInteraction(me.all_obj.fence.modify_tool);
          });
        },

        // ==================================
        _fence_del:function () {
          $('#draw_del').on('click',function () {
            // console.log();
            // 清除
            me.all_obj.fence.all_data_c.removeFeature(me.all_obj.fence.ac_feature);
            // 参数重置
            me.all_obj.fence.ac_feature = null;
          });
        },

        // ==================================
        _fence_yes:function () {
          $('#draw_yes').on('click',function () {
            // console.log();
            console.log(me.all_obj.fence.ac_feature);
          });
        },






















































        // ========================================
        _history: function() {
          $('#his_s').show();
          // 层
          me._history_layer();
          // 点
          me._history_p();
          // 线
          me._history_lines();

          // 多边形
          me._history_Polygon();
          // me._history_start(0);
        },
        _history_layer: function() {


          // 矢量容器层
          var layer = new ol.layer.Vector();

          // 注入数据层--可以注入多个Feature，每个feature有自己的数据和样式
          var all_data_c = new ol.source.Vector();
          me.all_obj.history.all_data_c = all_data_c;

          // 
          layer.setSource(all_data_c);

          // 打到地图上
          me.map.addLayer(layer);
        },
        _history_p: function() {
          // console.log(mk_data_c);
          // 创建一个活动图标需要的Feature，并设置位置
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point(me.conf.center)
          });
          p_data.setStyle(
            new ol.style.Style({
              // 设置一个标识
              image: new ol.style.Icon({
                src: './img/cors_1.png',

                // 这个是相当于是进行切图了
                // size: [50,50],

                // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
                anchor: [0.5, 1],
                // 这个直接就可以控制大小了
                scale: 1
              }),

              text: new ol.style.Text({
                // 对其方式
                textAlign: 'center',
                // 基准线
                textBaseline: 'middle',
                offsetY: -50,
                // 文字样式
                font: 'normal 16px 黑体',
                // 文本内容
                text: "cors:aaa",
                // 文本填充样式
                fill: new ol.style.Fill({
                  color: 'rgba(255,255,255,1)'
                }),
                padding: [5, 5, 5, 5],
                backgroundFill: new ol.style.Fill({
                  color: 'rgba(0,0,0,0.6)'
                }),
                // 描边
                // stroke: new ol.style.Stroke({
                //   color: 'rgba(0,0,0,0.2)',
                //   width: 10
                // })
              })
            })
          );

          // 数据层收集marker
          me.all_obj.history.all_data_c.addFeature(p_data);

          // 拿到全局
          me.all_obj.history.p_data = p_data;
        },
        _history_lines: function() {
          var lines_data = new ol.Feature({
            geometry: new ol.geom.LineString(lines_arr)
          });
          lines_data.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
              width: 8,
              color: [0, 0, 0, 0.5]
            })
          }));

          // 注入数据层
          me.all_obj.history.all_data_c.addFeature(lines_data);
        },
        // 开始运动
        _history_start: function(index) {
          // 开始运动

          setTimeout(function() {
            index++;
            if (index == lines_arr.length) {
              layer.msg('运动完毕');
              return;
            }
            // 
            else {
              me.all_obj.history.p_data.setGeometry(new ol.geom.Point(lines_arr[index]));
              me._history_start(index);
            }
          }, 1000);
        },















        // =========================================
        // marker 标识---在一个数据层上解决所有问题
        _monitor: function() {

          // 层构建
          me._monitor_layer();

          // 打点
          me._monitor_p();

          // 开始移动
          me._monitor_start();

















          // ===================================================
          var data_c = new ol.source.Vector();


          // 矢量容器层
          var layer_line = new ol.layer.Vector({
            // 矢量数据层
            source: data_c,
            style: new ol.style.Style({
              stroke: new ol.style.Stroke({
                width: 3,
                color: [255, 0, 0, 1]
              })
            })
          });


          // line_feature.setStyle();
          // layer_line.getSource()

          // 打到地图上
          // me.map.addLayer(layer_line);
        },
        _monitor_layer: function() {


          // 矢量容器层
          var layer = new ol.layer.Vector();

          // 注入数据层--可以注入多个Feature，每个feature有自己的数据和样式
          var all_data_c = new ol.source.Vector();
          me.all_obj.monitor.all_data_c = all_data_c;

          // 
          layer.setSource(all_data_c);

          // 打到地图上
          me.map.addLayer(layer);
        },
        _monitor_p: function() {
          // console.log(mk_data_c);
          // 创建一个活动图标需要的Feature，并设置位置
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point(me.conf.center)
          });
          p_data.setStyle(
            new ol.style.Style({
              // 设置一个标识
              image: new ol.style.Icon({
                src: './img/cors_1.png',

                // 这个是相当于是进行切图了
                // size: [50,50],

                // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
                anchor: [0.5, 1],
                // 这个直接就可以控制大小了
                scale: 1
              }),

              text: new ol.style.Text({
                // 对其方式
                textAlign: 'center',
                // 基准线
                textBaseline: 'middle',
                offsetY: -50,
                // 文字样式
                font: 'normal 16px 黑体',
                // 文本内容
                text: "cors:aaa",
                // 文本填充样式
                fill: new ol.style.Fill({
                  color: 'rgba(255,255,255,1)'
                }),
                padding: [5, 5, 5, 5],
                backgroundFill: new ol.style.Fill({
                  color: 'rgba(0,0,0,0.6)'
                }),
                // 描边
                // stroke: new ol.style.Stroke({
                //   color: 'rgba(0,0,0,0.2)',
                //   width: 10
                // })
              })
            })
          );

          // 数据层收集marker
          me.all_obj.monitor.all_data_c.addFeature(p_data);

          // 拿到全局
          me.all_obj.monitor.p_data = p_data;
        },
        // 开始追踪
        _monitor_start: function() {
          // 追踪
          var old_p = null;
          var new_p = [0, 0];


          setInterval(function() {
            // 得到旧的点
            old_p = me.all_obj.monitor.p_data.getGeometry().flatCoordinates;


            // ***********************************模拟数据
            new_p[0] = old_p[0] + Math.random() * 0.01;
            new_p[1] = old_p[1] + Math.random() * 0.01;
            // *******************************************

            // 移动点--改变这个数据就行了
            me.all_obj.monitor.p_data.setGeometry(new ol.geom.Point(new_p));

            // 
            me._monitor_line(new_p, old_p);

          }, 2000);
        },
        // 初始化线
        _monitor_line: function(new_p, old_p) {

          var line_data = new ol.Feature({
            geometry: new ol.geom.LineString(
              [
                // 
                old_p,
                // 
                new_p
              ])
          });
          line_data.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
              width: 3,
              color: [255, 0, 0, 1]
            })
          }));

          me.all_obj.monitor.all_data_c.addFeature(line_data);
        },
        _monitor_test: function() {
          // =============================================文字标识
          // var layer_text = new ol.layer.Vector({
          //   source: new ol.source.Vector()
          // });
          // // 设置坐标
          // var text_Feature = new ol.Feature({
          //   geometry: new ol.geom.Point(me.conf.center)
          // });

          // // 设置文字style
          // text_Feature.setStyle(new ol.style.Style({
          //   // 
          //   text: new ol.style.Text({
          //     // 默认这个字体，可以修改成其他的，格式和css的字体设置一样
          //     font: '20px sans-serif',
          //     text: 'asdasd',
          //     fill: new ol.style.Fill({
          //       color: 'red'
          //     }),
          //     backgroundFill: new ol.style.Fill({
          //       color: 'yellow'
          //     }),
          //     offsetX: 0,
          //     offsetY: -50,
          //   })
          // }));
          // layer_text.getSource().addFeature(text_Feature);
          // // 打到地图上
          // me.map.addLayer(layer_text);





          // 监听视图层--地图层级变化
          // me.map.getView()
          //   .on('change:resolution', function() {
          //     // 特征中拿到样式类
          //     var style = marker_Feature.getStyle();


          //     // 样式中拿到图片类
          //     // 图片类可以进行设置一些列方法
          //     style.getImage().setScale(me.map.getView().getZoom() / 10);
          //     marker_Feature.setStyle(style);
          //   });

          // 到了这
          // 就是设置是走的面向对象实例化，方法得到的也是面向对象实例化




          // 监听地图点击事件
          // me.map.on('click', function(event) {
          //   var feature = me.map.forEachFeatureAtPixel(event.pixel, function(feature) {
          //     return feature;
          //   });

          //   // console.log(feature);
          //   if (feature) {

          //     var style = feature.getStyle();
          //     style.getImage().setScale(2.5);
          //     feature.setStyle(style);

          //   }
          // });
        },


        // =================================
        // 实时监控所有
        _all_p: function() {

          ps_arr = ps_arr;

          // ********************************************模拟数据
          ps_arr.forEach(function(ele, index) {
            if (Math.random() > 0.5) {
              ele.state = 1;
            } else {
              ele.state = 0;
            }
          });

          // ********************************************模拟数据

          // 第一次加载
          if (me.conf.ps_first_load_key) {
            me.conf.ps_first_load_key = false;
            // 所有点初始化
            me._all_p_init(ps_arr);
          }
          // 注入数据
          else {
            me._all_p_inj(ps_arr);
          }


          // 收集到所有
          // console.log(me.all_obj.ps_obj);


          // 
          setTimeout(function() {
            console.log(1);
            me._all_p();
          }, 1000);
        },
        // 所有点的初始化
        _all_p_init: function(arr) {

          // 数据容器
          var ps_source_c = new ol.source.Vector(
            // {
            //   // 这里尽然可以设置多个数据
            //   features: me.all_obj.ps_arr
            // }
          );

          // 矢量容器层
          var ps_Vector = new ol.layer.Vector();
          // 
          ps_Vector.setSource(ps_source_c);

          // 放到地图上
          me.map.addLayer(ps_Vector);

          // 拿到全局
          me.conf.ps_Vector = ps_Vector;




          // console.log(ps_arr);
          // console.log(ps_arr);
          var p_data = null;

          // 收集点
          // 渲染打点
          arr.forEach(function(ele, index) {
            // 添加点
            p_data = me._all_p_init_marker(ele);
            // 属性挂载
            p_data.ele = ele;
            // 对象收集
            me.all_obj.ps_obj[ele.id] = p_data;

            // 数组收集
            // me.all_obj.ps_arr.push(p_data);
            // ps_Vector.getSource().addFeature(p_data);
            ps_source_c.addFeature(p_data);
          });
        },
        // 添加点
        _all_p_init_marker: function(ele) {
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point(ele.lnglat),
          });

          p_data.setStyle(new ol.style.Style({
            // 设置一个标识
            image: new ol.style.Icon({
              src: `./img/cors_${ele.state}.png`,

              // 这个是相当于是进行切图了
              // size: [50,50],

              // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
              anchor: [0.5, 1],
              // 这个直接就可以控制大小了
              scale: 1
            }),

            text: new ol.style.Text({
              // 对其方式
              textAlign: 'center',
              // 基准线
              textBaseline: 'middle',
              offsetY: -50,
              // 文字样式
              font: 'normal 16px 黑体',
              // 文本内容
              text: ele.name,
              // 文本填充样式
              fill: new ol.style.Fill({
                color: 'rgba(255,255,255,1)'
              }),
              padding: [5, 5, 5, 5],
              backgroundFill: new ol.style.Fill({
                color: 'rgba(0,0,0,0.6)'
              }),
              // 描边
              // stroke: new ol.style.Stroke({
              //   color: 'rgba(0,0,0,0.2)',
              //   width: 10
              // })
            })
          }));




          return p_data;

          // p_data.id = 1;






          // ****************************最优化一组覆盖物
          // 一堆覆盖物
          // me.map.getView()
          //   .fit([
          //     me.conf.center[0],
          //     me.conf.center[1],
          //     me.conf.center[0] + Math.random() * 0.5,
          //     me.conf.center[1] + Math.random() * 0.5
          //   ], {
          //     size: me.map.getSize(),
          //     padding: [30, 30, 30, 30],
          //     constrainResolution: false
          //   });


          // console.log(me.map);

          // *****************************得到所有覆盖物
          // me.map.getLayers()



          // ******************************清除覆盖物
          // setTimeout(function() {
          //   // me.map
          //   me.map.removeLayer(layer_marker);
          // }, 2000);
        },
        // 数据容器
        _all_p_inj: function(arr) {
          arr.forEach(function(ele, index) {

            // 拿到Ft  FT一改就全部改了
            me.all_obj.ps_obj[ele.id]
              .setStyle(new ol.style.Style({
                // 设置一个标识
                image: new ol.style.Icon({
                  src: `./img/cors_${ele.state}.png`,

                  // 这个是相当于是进行切图了
                  // size: [50,50],

                  // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
                  anchor: [0.5, 1],
                  // 这个直接就可以控制大小了
                  scale: 1
                }),

                text: new ol.style.Text({
                  // 对其方式
                  textAlign: 'center',
                  // 基准线
                  textBaseline: 'middle',
                  offsetY: -50,
                  // 文字样式
                  font: 'normal 16px 黑体',
                  // 文本内容
                  text: ele.name,
                  // 文本填充样式
                  fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,1)'
                  }),
                  padding: [5, 5, 5, 5],
                  backgroundFill: new ol.style.Fill({
                    color: 'rgba(0,0,0,0.6)'
                  }),
                  // 描边
                  // stroke: new ol.style.Stroke({
                  //   color: 'rgba(0,0,0,0.2)',
                  //   width: 10
                  // })
                })
              }));
          });
        },
        // 点击事件
        _all_p_ev: function() {
          // ******************************监听地图点击事件
          var feature = null;
          me.map.on('singleclick', function(event) {

            // 这个是找数据的
            // forEachFeatureAtPixel---
            feature = me.map.forEachFeatureAtPixel(event.pixel, function(feature) {
              return feature;
            });

            // 点击的就是那个点的数据 
            console.log(feature);

          });
        },























        // 
        _fn_8: function() {
          // **********************************************模拟数据
          var num = 500;
          markers_data.length = 0;
          var lng = 0;
          var lat = 0;

          for (var i = 0; i < num; i++) {
            if (Math.random() > 0.5) {
              lng = me.conf.center[0] + Math.random();
            } else {
              lng = me.conf.center[0] - Math.random();
            }

            if (Math.random() > 0.5) {
              lat = me.conf.center[1] + Math.random();
            } else {
              lat = me.conf.center[1] - Math.random();
            }

            markers_data.push({
              id: i + 1,
              lng: lng,
              lat: lat,
              name: `cors-${i+1}`,
            });
          }
          // **********************************************模拟数据


          // console.log(markers_data);
          $('#marker_box').html('');
          markers_data.forEach(function(ele, index) {
            // 生成DOM
            me._gen_dom(ele);
            me._gen_mk(ele);
          });


          me.map.getViewport();
        },
        // 生成DOM
        _gen_dom: function(ele) {
          $('#marker_box').append(`
            <div class="_marker" id='cors_${ele.id}'>
              <div class="info">${ele.name}</div>
            </div>
            `);
          // $(`#marker_box>#cors_${ele.id}`).show();
        },
        _gen_mk: function(ele) {
          // console.log(ele);
          var marker = new ol.Overlay({
            element: document.getElementById(`cors_${ele.id}`)
          });

          // 关键的一点，需要设置附加到地图上的位置
          marker.setPosition([ele.lng, ele.lat]);
          // 然后添加到map上
          me.map.addOverlay(marker);
        },


























        // 
        // 层上面简单的来个标识maker 点 和圆圈
        _fn_6: function() {

          // ==================================================
          // 矢量容器层
          var layer_marker = new ol.layer.Vector({
            // 矢量数据层
            source: new ol.source.Vector()
          });


          // 创建一个活动图标需要的Feature，并设置位置
          var marker_Feature = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point([116.06, 39.67])
          });

          // 设置样式 样式也类
          // 设置Feature的样式
          marker_Feature.setStyle(new ol.style.Style({
            // 设置一个标识
            image: new ol.style.Icon({
              src: './img/down.png',

              // 这个是相当于是进行切图了
              // size: [50,50],

              // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
              anchor: [0.5, 1],
              // 这个直接就可以控制大小了
              scale: 0.5
            })
          }));


          // 添加活动Feature到layer上，并把layer添加到地图中
          // 容器里可以可以获取数据层，数据层--添加--数据
          layer_marker.getSource().addFeature(marker_Feature);

          // 打到地图上
          me.map.addLayer(layer_marker);



          // ========================================================
          var layer_p = new ol.layer.Vector({
            source: new ol.source.Vector()
          });

          // 添加点
          var point_Feature = new ol.Feature({
            geometry: new ol.geom.Point([116.06, 39.67])
          });
          point_Feature.setStyle(new ol.style.Style({
            // 注意这个 添加圆圈
            image: new ol.style.Circle({
              radius: 10,
              fill: new ol.style.Fill({
                color: 'red'
              }),
              stroke: new ol.style.Stroke({
                color: 'red',
                size: 1
              })
            })
          }));
          layer_p.getSource().addFeature(point_Feature);
          // 打到地图上
          me.map.addLayer(layer_p);




          // ========================================================
          var layer_circle = new ol.layer.Vector({
            source: new ol.source.Vector()
          });

          // 添加点
          var circle_Feature = new ol.Feature({
            geometry: new ol.geom.Point([116.06, 39.67])
          });
          circle_Feature.setStyle(new ol.style.Style({
            // 注意这个 添加圆圈--目前不知道在哪调透明度
            image: new ol.style.Circle({
              radius: 100,
              // fill: new ol.style.Fill({
              //   color: 'red',
              // }),
              stroke: new ol.style.Stroke({
                color: 'red',
                // lineCap:'round',
                // lineDash:[5],
                width: 3
              })
            })
          }));
          layer_circle.getSource().addFeature(circle_Feature);
          // 打到地图上
          me.map.addLayer(layer_circle);
        },










        /*
         * 重新定义坐标系
         * 计算分辨率
         * new ol.source.TileImage 图片瓦片数据源
         */
        _fn_5: function() {
          $('#tool')
            .show()
            .html(`
              <span id='BD'>BD</span>
            `);

          // 自定义分辨率和瓦片坐标系
          var resolutions = [];
          var maxZoom = 18;

          // 计算百度使用的分辨率
          for (var i = 0; i <= maxZoom; i++) {
            resolutions[i] = Math.pow(2, maxZoom - i);
          }

          // 坐标系
          var tilegrid = new ol.tilegrid.TileGrid({
            origin: [0, 0], // 设置原点坐标
            resolutions: resolutions // 设置分辨率
          });

          // console.log(tilegrid);

          // 创建百度地图的数据源
          // 图片瓦片数据源
          var baiduSource = new ol.source.TileImage({
            // 坐标系
            projection: 'EPSG:3857',
            tileGrid: tilegrid,
            tileUrlFunction: function(tileCoord, pixelRatio, proj) {
              var z = tileCoord[0];
              var x = tileCoord[1];
              var y = tileCoord[2];

              // 百度瓦片服务url将负数使用M前缀来标识
              if (x < 0) {
                x = 'M' + (-x);
              }
              if (y < 0) {
                y = 'M' + (-y);
              }

              return "http://online0.map.bdimg.com/onlinelabel/?qt=tile&x=" + x + "&y=" + y + "&z=" + z + "&styles=pl&udt=20160426&scaler=1&p=0";
            }
          });

          // 百度地图层
          var baiduMapLayer2 = new ol.layer.Tile({
            source: baiduSource
          });



          $('#BD').on('click', function() {

            me.map.removeLayer(me.map.getLayers().item(0));
            me.map.addLayer(baiduMapLayer2);
          });
        },











        // 层数据源 Source
        /*
          * 层数据源 Source
          * ol.source.Tile对应的是瓦片数据源，现在网页地图服务中，
          *   绝大多数都是使用的瓦片地图，而OpenLayers 3作为一个WebGIS引擎，理所当然应该支持瓦片。
          * 
          * ol.source.Image对应的是一整张图，而不像瓦片那样很多张图，
              从而无需切片，也可以加载一些地图，适用于一些小场景地图。

          * ol.source.Vector对应的是矢量地图源，点，线，面等等常用的地图元素(Feature)，
              就囊括到这里面了。这样看来，只要这两种Source就可以搞定80%的需求了。。
        */
        _fn_4: function() {

          $('#tool')
            .show()
            .html(`
              <span id='OSM'>OSM</span>
              <span id= 'Bing'>Bing</span>
              <span id = "Stamen">Stamen</span>
              <span id = "GD">GD</span>
              <span id = "YaHoo">YaHoo</span>
              <span id = "Google">Google</span>
            `);


          // Open Street Map 地图层
          var openStreetMapLayer = new ol.layer.Tile({
            source: new ol.source.OSM()
          });



          // Bing地图层
          // 注意：有key的类型
          var bingMapLayer = new ol.layer.Tile({
            source: new ol.source.BingMaps({
              key: 'AkjzA7OhS4MIBjutL21bkAop7dc41HSE0CNTR5c6HJy8JKc7U9U9RveWJrylD3XJ',
              imagerySet: 'Road'
            })
          });

          // Stamen地图层
          var stamenLayer = new ol.layer.Tile({
            source: new ol.source.Stamen({
              layer: 'watercolor'
            })
          });

          // 高德地图层
          var gaodeMapLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
              url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
            })
          });

          // yahoo地图层
          var yahooMapLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
              tileSize: 512,
              url: 'https://{0-3}.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/512/png8?lg=ENG&ppi=250&token=TrLJuXVK62IQk0vuXFzaig%3D%3D&requestid=yahoo.prod&app_id=eAdkWGYRoc4RfxVo0Z4B'
            })
          });


          // 百度地图层
          var baiduMapLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
              tilePixelRatio: 2,
              // 瓦片函数
              tileUrlFunction: function(tileCoord) {
                // 参数tileCoord为瓦片坐标
                var z = tileCoord[0];
                var x = tileCoord[1];
                var y = tileCoord[2];

                // 计算当前层级下瓦片总数的一半，用于定位整个地图的中心点
                var halfTileNum = Math.pow(2, z - 1);
                // 原点移到中心点后，计算xy方向上新的坐标位置
                var baiduX = x - halfTileNum;
                var baiduY = y + halfTileNum;

                // 百度瓦片服务url将负数使用M前缀来标识
                if (baiduX < 0) {
                  baiduX = 'M' + (-baiduX);
                }
                if (baiduY < 0) {
                  baiduY = 'M' + (-baiduY);
                }

                // 返回经过转换后，对应于百度在线瓦片的url
                return 'http://online2.map.bdimg.com/onlinelabel/?qt=tile&x=' + baiduX + '&y=' + baiduY + '&z=' + z + '&styles=pl&udt=20160321&scaler=2&p=0';
              }
            })
          });

          // google地图层
          var googleMapLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
              url: 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0'
            })
          });


          $('#OSM').on('click', function() {

            me.map.removeLayer(me.map.getLayers().item(0));
            me.map.addLayer(openStreetMapLayer);
          });

          $('#Bing').on('click', function() {
            me.map.removeLayer(me.map.getLayers().item(0));
            me.map.addLayer(bingMapLayer);
          });

          $('#Stamen').on('click', function() {
            me.map.removeLayer(me.map.getLayers().item(0));
            me.map.addLayer(stamenLayer);
          });


          $('#GD').on('click', function() {
            me.map.removeLayer(me.map.getLayers().item(0));
            me.map.addLayer(gaodeMapLayer);
          });


          $('#YaHoo').on('click', function() {
            me.map.removeLayer(me.map.getLayers().item(0));
            me.map.addLayer(yahooMapLayer);
          });

          $('#Google').on('click', function() {
            me.map.removeLayer(me.map.getLayers().item(0));
            me.map.addLayer(googleMapLayer);
          });

          // 获取层的对象集合
          // me.map.getLayers()
          // 设置一个层
          // me.map.addLayer(stamenLayer);



          // XYZ的形式进行加载瓦片
          // var openStreetMapLayer = new ol.layer.Tile({
          //   source: new ol.source.XYZ({
          //     url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          //   })
          // });
        },







        /*
         * 1.坐标转换
         * 2.view 的初始化设置：层级限制，坐标系
         * 3.view 方法：获取中心点，设置中心点，渲染；层级的改变
         * 4.view 方法：层级的改变
         * 5.view 方法：最优显示某个范围
         * 
         */
        _fn_1: function() {
          // 坐标转换  注意转换的类型， 
          // 'EPSG:3857',转前类型  'EPSG:4326' 转后类型
          // WGS84 == EPSG:4326 全球通用的
          // EPSG:3857 == 900913 Mercator投影  一个是web地图专用的
          // ol.proj.transform([104.06, 30.67], 'EPSG:3857', 'EPSG:4326')



          // View 设置：地图一些视图上的东西在这设置
          // view: new ol.View({

          // 设置地图中心范围
          // extent: [102, 29, 104, 31],

          // 设置成都为地图中心
          // center: [104.06, 30.67],

          // 指定投影使用EPSG:4326
          // projection: 'EPSG:4326',

          // zoom: 10,

          // 限制地图缩放最大级别为14，最小级别为10
          // minZoom: 10,
          // maxZoom: 14
          //  }),



          // 视图对象--获取中心点
          // var view = me.map.getView();
          // // 获取中心点
          // var mapCenter = view.getCenter();
          // mapCenter[0] += 50000;
          // // 设置坐标点
          // view.setCenter(mapCenter);
          // // 用地图进行移动后的渲染
          // me.map.render();


          // 地图层级的改变
          // var view = me.map.getView();
          // // 让地图的zoom增加1，从而实现地图放大
          // view.setZoom(view.getZoom() + 1);

          // 视图窗口的大小
          // me.map.getSize();
          // 最优化一个范围
          // map.getView().fit([104, 30.6, 104.12, 30.74], map.getSize());
        },


        /*
         * 地图联动就是使用同一个视图层
         * 地图联动就是使用同一个视图层
         * 地图联动就是使用同一个视图层
         */
        _fn_2: function() {
          // 创建一个视图
          var view = new ol.View({
            center: [0, 0],
            zoom: 2
          });

          // 创建第一个地图
          new ol.Map({
            layers: [
              new ol.layer.Tile({ source: new ol.source.OSM() })
            ],
            view: view,
            target: 'map1'
          });

          // 创建第二个地图
          new ol.Map({
            layers: [
              new ol.layer.Tile({ source: new ol.source.OSM() })
            ],
            view: view,
            target: 'map2'
          });
        },


        /*
         * 矢量层加载，和最优化一个覆盖物
         * 每一个层 都有一个数据源和layer的对应 
         */



        _map: function() {
          me.map = new ol.Map({

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
              // 设置成都为地图中心，此处进行坐标转换， 
              // 把EPSG:4326的坐标，转换为EPSG:3857坐标，因为ol默认使用的是EPSG:3857坐标
              // center: ol.proj.transform([116.06, 39.67], 'EPSG:4326', 'EPSG:3857'),
            }),
            // 让id为map的div作为地图的容器
            target: 'map'
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
