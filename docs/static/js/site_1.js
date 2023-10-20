var Cookielaw = {
    createCookie: function(name, value, days) {
        var date = new Date()
          , expires = '';
        if (days) {
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    createCookielawCookie: function() {
        this.createCookie('cookielaw_accepted', '1', 10 * 365);
        if (typeof (window.jQuery) === 'function') {
            jQuery('#CookielawBanner').slideUp();
        } else {
            document.getElementById('CookielawBanner').style.display = 'none';
        }
    }
};
;(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}
)(function($) {
    var _previousResizeWidth = -1
      , _updateTimeout = -1;
    var _parse = function(value) {
        return parseFloat(value) || 0;
    };
    var _rows = function(elements) {
        var tolerance = 1
          , $elements = $(elements)
          , lastTop = null
          , rows = [];
        $elements.each(function() {
            var $that = $(this)
              , top = $that.offset().top - _parse($that.css('margin-top'))
              , lastRow = rows.length > 0 ? rows[rows.length - 1] : null;
            if (lastRow === null) {
                rows.push($that);
            } else {
                if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
                    rows[rows.length - 1] = lastRow.add($that);
                } else {
                    rows.push($that);
                }
            }
            lastTop = top;
        });
        return rows;
    };
    var _parseOptions = function(options) {
        var opts = {
            byRow: true,
            property: 'height',
            target: null,
            remove: false
        };
        if (typeof options === 'object') {
            return $.extend(opts, options);
        }
        if (typeof options === 'boolean') {
            opts.byRow = options;
        } else if (options === 'remove') {
            opts.remove = true;
        }
        return opts;
    };
    var matchHeight = $.fn.matchHeight = function(options) {
        var opts = _parseOptions(options);
        if (opts.remove) {
            var that = this;
            this.css(opts.property, '');
            $.each(matchHeight._groups, function(key, group) {
                group.elements = group.elements.not(that);
            });
            return this;
        }
        if (this.length <= 1 && !opts.target) {
            return this;
        }
        matchHeight._groups.push({
            elements: this,
            options: opts
        });
        matchHeight._apply(this, opts);
        return this;
    }
    ;
    matchHeight.version = 'master';
    matchHeight._groups = [];
    matchHeight._throttle = 80;
    matchHeight._maintainScroll = false;
    matchHeight._beforeUpdate = null;
    matchHeight._afterUpdate = null;
    matchHeight._rows = _rows;
    matchHeight._parse = _parse;
    matchHeight._parseOptions = _parseOptions;
    matchHeight._apply = function(elements, options) {
        var opts = _parseOptions(options)
          , $elements = $(elements)
          , rows = [$elements];
        var scrollTop = $(window).scrollTop()
          , htmlHeight = $('html').outerHeight(true);
        var $hiddenParents = $elements.parents().filter(':hidden');
        $hiddenParents.each(function() {
            var $that = $(this);
            $that.data('style-cache', $that.attr('style'));
        });
        $hiddenParents.css('display', 'block');
        if (opts.byRow && !opts.target) {
            $elements.each(function() {
                var $that = $(this)
                  , display = $that.css('display');
                if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
                    display = 'block';
                }
                $that.data('style-cache', $that.attr('style'));
                $that.css({
                    'display': display,
                    'padding-top': '0',
                    'padding-bottom': '0',
                    'margin-top': '0',
                    'margin-bottom': '0',
                    'border-top-width': '0',
                    'border-bottom-width': '0',
                    'height': '100px',
                    'overflow': 'hidden'
                });
            });
            rows = _rows($elements);
            $elements.each(function() {
                var $that = $(this);
                $that.attr('style', $that.data('style-cache') || '');
            });
        }
        $.each(rows, function(key, row) {
            var $row = $(row)
              , targetHeight = 0;
            if (!opts.target) {
                if (opts.byRow && $row.length <= 1) {
                    $row.css(opts.property, '');
                    return;
                }
                $row.each(function() {
                    var $that = $(this)
                      , style = $that.attr('style')
                      , display = $that.css('display');
                    if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
                        display = 'block';
                    }
                    var css = {
                        'display': display
                    };
                    css[opts.property] = '';
                    $that.css(css);
                    if ($that.outerHeight(false) > targetHeight) {
                        targetHeight = $that.outerHeight(false);
                    }
                    if (style) {
                        $that.attr('style', style);
                    } else {
                        $that.css('display', '');
                    }
                });
            } else {
                targetHeight = opts.target.outerHeight(false);
            }
            $row.each(function() {
                var $that = $(this)
                  , verticalPadding = 0;
                if (opts.target && $that.is(opts.target)) {
                    return;
                }
                if ($that.css('box-sizing') !== 'border-box') {
                    verticalPadding += _parse($that.css('border-top-width')) + _parse($that.css('border-bottom-width'));
                    verticalPadding += _parse($that.css('padding-top')) + _parse($that.css('padding-bottom'));
                }
                $that.css(opts.property, (targetHeight - verticalPadding) + 'px');
            });
        });
        $hiddenParents.each(function() {
            var $that = $(this);
            $that.attr('style', $that.data('style-cache') || null);
        });
        if (matchHeight._maintainScroll) {
            $(window).scrollTop((scrollTop / htmlHeight) * $('html').outerHeight(true));
        }
        return this;
    }
    ;
    matchHeight._applyDataApi = function() {
        var groups = {};
        $('[data-match-height], [data-mh]').each(function() {
            var $this = $(this)
              , groupId = $this.attr('data-mh') || $this.attr('data-match-height');
            if (groupId in groups) {
                groups[groupId] = groups[groupId].add($this);
            } else {
                groups[groupId] = $this;
            }
        });
        $.each(groups, function() {
            this.matchHeight(true);
        });
    }
    ;
    var _update = function(event) {
        if (matchHeight._beforeUpdate) {
            matchHeight._beforeUpdate(event, matchHeight._groups);
        }
        $.each(matchHeight._groups, function() {
            matchHeight._apply(this.elements, this.options);
        });
        if (matchHeight._afterUpdate) {
            matchHeight._afterUpdate(event, matchHeight._groups);
        }
    };
    matchHeight._update = function(throttle, event) {
        if (event && event.type === 'resize') {
            var windowWidth = $(window).width();
            if (windowWidth === _previousResizeWidth) {
                return;
            }
            _previousResizeWidth = windowWidth;
        }
        if (!throttle) {
            _update(event);
        } else if (_updateTimeout === -1) {
            _updateTimeout = setTimeout(function() {
                _update(event);
                _updateTimeout = -1;
            }, matchHeight._throttle);
        }
    }
    ;
    $(matchHeight._applyDataApi);
    $(window).bind('load', function(event) {
        matchHeight._update(false, event);
    });
    $(window).bind('resize orientationchange', function(event) {
        matchHeight._update(true, event);
    });
});
/*!
 * jPushMenu.js
 * 1.1.1
 * @author: takien
 * http://takien.com
 * Original version (pure JS) is created by Mary Lou http://tympanus.net/
 */
(function($) {
    $.fn.jPushMenu = function(customOptions) {
        var o = $.extend({}, $.fn.jPushMenu.defaultOptions, customOptions);
        $('body').addClass(o.bodyClass);
        $(this).addClass('jPushMenuBtn');
        $(this).click(function() {
            var target = ''
              , push_direction = '';
            if ($(this).is('.' + o.showLeftClass)) {
                target = '.cbp-spmenu-left';
                push_direction = 'toright';
            } else if ($(this).is('.' + o.showRightClass)) {
                target = '.cbp-spmenu-right';
                push_direction = 'toleft';
            } else if ($(this).is('.' + o.showTopClass)) {
                target = '.cbp-spmenu-top';
            } else if ($(this).is('.' + o.showBottomClass)) {
                target = '.cbp-spmenu-bottom';
            }
            $(this).toggleClass(o.activeClass);
            $(target).toggleClass(o.menuOpenClass);
            if ($(this).is('.' + o.pushBodyClass)) {
                $('body').toggleClass('cbp-spmenu-push-' + push_direction);
            }
            $('.jPushMenuBtn').not($(this)).toggleClass('disabled');
            return false;
        });
        var jPushMenu = {
            close: function(o) {
                $('.jPushMenuBtn,body,.cbp-spmenu').removeClass('disabled active cbp-spmenu-open cbp-spmenu-push-toleft cbp-spmenu-push-toright');
            }
        }
        if (o.closeOnClickOutside) {
            $(document).click(function() {
                jPushMenu.close();
            });
            $(document).on('click touchstart', function() {
                jPushMenu.close();
            });
            $('.cbp-spmenu,.toggle-menu').click(function(e) {
                e.stopPropagation();
            });
            $('.cbp-spmenu,.toggle-menu').on('click touchstart', function(e) {
                e.stopPropagation();
            });
        }
        if (o.closeOnClickLink) {
            $('.cbp-spmenu a').on('click', function() {
                jPushMenu.close();
            });
        }
    }
    ;
    $.fn.jPushMenu.defaultOptions = {
        bodyClass: 'cbp-spmenu-push',
        activeClass: 'menu-active',
        showLeftClass: 'menu-left',
        showRightClass: 'menu-right',
        showTopClass: 'menu-top',
        showBottomClass: 'menu-bottom',
        menuOpenClass: 'cbp-spmenu-open',
        pushBodyClass: 'push-body',
        closeOnClickOutside: true,
        closeOnClickInside: true,
        closeOnClickLink: true
    };
}
)(jQuery);
(function($) {
    var $w = $(window);
    $.fn.visible = function(partial, hidden, direction) {
        if (this.length < 1)
            return;
        var $t = this.length > 1 ? this.eq(0) : this
          , t = $t.get(0)
          , vpWidth = $w.width()
          , vpHeight = $w.height()
          , direction = (direction) ? direction : 'both'
          , clientSize = hidden === true ? t.offsetWidth * t.offsetHeight : true;
        if (typeof t.getBoundingClientRect === 'function') {
            var rec = t.getBoundingClientRect()
              , tViz = rec.top >= 0 && rec.top < vpHeight
              , bViz = rec.bottom > 0 && rec.bottom <= vpHeight
              , lViz = rec.left >= 0 && rec.left < vpWidth
              , rViz = rec.right > 0 && rec.right <= vpWidth
              , vVisible = partial ? tViz || bViz : tViz && bViz
              , hVisible = partial ? lViz || rViz : lViz && rViz;
            if (direction === 'both')
                return clientSize && vVisible && hVisible;
            else if (direction === 'vertical')
                return clientSize && vVisible;
            else if (direction === 'horizontal')
                return clientSize && hVisible;
        } else {
            var viewTop = $w.scrollTop()
              , viewBottom = viewTop + vpHeight
              , viewLeft = $w.scrollLeft()
              , viewRight = viewLeft + vpWidth
              , offset = $t.offset()
              , _top = offset.top
              , _bottom = _top + $t.height()
              , _left = offset.left
              , _right = _left + $t.width()
              , compareTop = partial === true ? _bottom : _top
              , compareBottom = partial === true ? _top : _bottom
              , compareLeft = partial === true ? _right : _left
              , compareRight = partial === true ? _left : _right;
            if (direction === 'both')
                return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop)) && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
            else if (direction === 'vertical')
                return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop));
            else if (direction === 'horizontal')
                return !!clientSize && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
        }
    }
    ;
}
)(jQuery);
function findBootstrapEnvironment() {
    var envs = ['xs', 'sm', 'md', 'lg'];
    var $el = $('<div>');
    $el.appendTo($('body'));
    for (var i = envs.length - 1; i >= 0; i--) {
        var env = envs[i];
        $el.addClass('hidden-' + env);
        if ($el.is(':hidden')) {
            $el.remove();
            return env
        }
    }
}
$('document').ready(function() {
    $('#email-subscribe-form input').addClass('form-control');
    $('#email-subscribe-form').submit(function(e) {
        e.preventDefault();
        if ($('#email-subscribe-form').hasClass('submitted')) {} else {
            $('#email-subscribe-form').addClass('submitted');
            $('#email_submit_label').text("Please wait...");
            $.ajax({
                type: "POST",
                url: $('#email-subscribe-form').attr('action'),
                data: $('#email-subscribe-form').serialize(),
                success: function(data) {
                    $('#email_subscribe_form_wrapper').html(data);
                }
            })
        }
    })
});
$(document).ready(function() {
    $('.readmore').each(function(i) {
        $(this).click(function(e) {
            e.preventDefault();
            var parent = $(this).parents('.corporate-text');
            parent.slideUp(500, function() {
                parent.height('auto');
                parent.find('.readmore-wrapper').hide();
                parent.find('.readless-wrapper').show();
                parent.slideDown();
            });
        })
    });
    $('.readless').each(function(i) {
        $(this).click(function(e) {
            e.preventDefault();
            var parent = $(this).parents('.corporate-text');
            parent.slideUp(500, function() {
                parent.height('auto');
                parent.find('.readmore-wrapper').show();
                parent.find('.readless-wrapper').hide();
                parent.slideDown();
            });
        })
    });
    var yup1 = findBootstrapEnvironment();
    var win = $(window);
    var fadeInUp = $('.my-fadeInUp');
    if (yup1 == "lg" || yup1 == "md" || yup1 == "sm" || yup1 == "xs") {
        fadeInUp.each(function(i, el) {
            var el = $(el);
            if (el.visible(true)) {
                el.removeClass('my-fadeInUp');
                el.addClass('animated fadeInUp')
            }
        });
        win.scroll(function(event) {
            fadeInUp.each(function(i, el) {
                var el = $(el);
                if (el.visible(true)) {
                    el.removeClass('my-fadeInUp');
                    el.addClass('animated fadeInUp')
                }
            });
        });
    }
    win.on("orientationchange", function() {
        var yup1 = findBootstrapEnvironment();
        if (yup1 == "lg" || yup1 == "md" || yup1 == "sm" || yup1 == "xs") {
            fadeInUp.each(function(i, el) {
                var el = $(el);
                if (el.visible(true)) {
                    el.removeClass('my-fadeInUp');
                    el.addClass('animated fadeInUp')
                }
            });
            win.scroll(function(event) {
                fadeInUp.each(function(i, el) {
                    var el = $(el);
                    if (el.visible(true)) {
                        el.removeClass('my-fadeInUp');
                        el.addClass('animated fadeInUp')
                    }
                });
            });
        }
    })
    jQuery('li.search i.fa').click(function() {
        if (jQuery('#header .search-box').is(":visible")) {
            jQuery('#header .search-box').fadeOut(300);
        } else {
            jQuery('.search-box').fadeIn(300);
            jQuery('#header .search-box form input').focus();
            if (jQuery('#header li.quick-cart div.quick-cart-box').is(":visible")) {
                jQuery('#header li.quick-cart div.quick-cart-box').fadeOut(300);
            }
        }
    });
    if (jQuery('#header li.search i.fa').size() != 0) {
        jQuery('#header .search-box, #header li.search i.fa').on('click', function(e) {
            e.stopPropagation();
        });
        jQuery('body').on('click', function() {
            if (jQuery('#header li.search .search-box').is(":visible")) {
                jQuery('#header .search-box').fadeOut(300);
            }
        });
    }
    jQuery(document).bind("click", function() {
        if (jQuery('#header li.search .search-box').is(":visible")) {
            jQuery('#header .search-box').fadeOut(300);
        }
    });
    jQuery("#closeSearch").bind("click", function(e) {
        e.preventDefault();
        jQuery('#header .search-box').fadeOut(300);
    });
});
