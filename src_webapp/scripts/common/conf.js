/**
 * Created by cc on 2017/8/7
 */
(function(win, $) {
  var conf = win.conf = win.conf || {
    basePrefixURL: 'http://' + window.location.host + "/cors-mot",
    basePrefixImgUrl: "",
    // 挂载模块
    module: {},
    // --------------load样式的全局配置
    load_sty:0,
    // 大弹窗
    layer_big: {
      title: false,
      area: ['97%', '95%'],
    },
    // =============================
    // 同源服务器根路径设置
    root_path:'/cors-mot',
    // =============================
    // 本地测试跨域测试
    //开启跨域模式
    cors_key:true,
    cors_port:8080,
  };
})(window, jQuery);
