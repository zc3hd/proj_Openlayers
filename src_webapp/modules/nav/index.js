(function($, window) {
  function Nav(opts) {
    var me = this;

    // api
    me.api = {
      out: {
        url: '/logout.do'
      },
    };
  };
  Nav.prototype = {
    init: function() {
      var me = this;

      // 
      me._bind();

      // 折叠
      me._fold();

      // 
      me._nav_load();



    },
    _bind: function() {
      var me = this;
      var fn = {
        // 折叠
        _fold: function() {
          $('#zedie_btn').on('click', function() {
            // kai--->guan
            if ($('#zedie_btn').attr('key') == 1) {
              $('#zedie_btn').attr('key', 0).html('>>');
              $('#app').css('padding-left', 0);
              $('#left').css('left', '-220px');
            }
            // guan---kai
            else {
              $('#zedie_btn').attr('key', 1).html('<<');
              $('#app').css('padding-left', "220px");
              $('#left').css('left', 0);
            }
          });
        },
        _nav_load: function() {
          var str = '';
          nav_fuwu_data.forEach(function(ele, index) {
            str += `
                <div class="item" _url=${ele.url}>
                  <div class="box">
                    ${ele.name}
                  </div>
                </div>
              `;
          });

          $('#list')
            .html(str)
            .off()
            // 一级菜单绑定事件
            .on('click', '.item', function(e) {
              me._nav_item(e.currentTarget);
            });

          // 默认加载第一项
          // me._nav_first();
          me._nav_item($('#list>div').first()[0]);
        },
        _nav_item: function(dom) {
          if ($(dom).hasClass('ac')) {
            return;
          }
          // 一级菜单样式的变化
          $('#list>.item').removeClass('ac');

          // ac
          $(dom).addClass('ac');
          // 直接渲染
          $('#optionView').attr('src', $(dom).attr('_url'));
          
        },
      };
      for (var k in fn) {
        me[k] = fn[k];
      };
    },
  };
  conf.module["Nav"] = Nav;
})(jQuery, window);
