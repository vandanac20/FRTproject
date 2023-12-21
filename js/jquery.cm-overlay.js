
(function ( $ ) {

    var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));


    var images = [];
    var $obj = null;

    var $cmOverlayMask = $('<div/>',{
            id:'cm-overlay-mask'
        }),
        $cmWrap = $('<div/>',{
            id:'cm-wrap'
        }),
        $cmOverlay = $('<div/>',{
            id:'cm-overlay'
        }),
        $cmContent = $('<div/>',{
            'class':'cm-content'
        }),
        $cmScale = $('<i/>',{
            'class':'cm-scale'
        }),
        $cmPrev = $('<a/>',{
            href:'javascript:;',
            title:'Previous',
            id:'cm-prev'
        }).text('prev'),
        $cmNext = $('<a/>',{
            href:'javascript:;',
            title:'Next',
            id:'cm-next'
        }).text('next'),
        $cmClose = $('<a/>',{
            href:'javascript:;',
            title:'Press ESC to close',
            id:'cm-close'
        }).text('close');

    var maxWidth = 900,
        aspectRatio = 0.5625, 
        maxHeightFraction = 0.9, 
        winHeight = 0, winWidth= 0, maxHeight = 0,
        $origin = 'none',
        $target = 'none'

    var closeOverlay = function(){
        if ($origin !== 'none') {
            $origin.prepend($target);
        }
        $cmOverlayMask.add($cmOverlay).stop().clearQueue();
        $cmWrap.css('visibility','hidden');
        $cmOverlayMask.fadeTo(500,0,function(){
            $(this).hide();
        });
        $cmOverlay.fadeTo(200,0).removeClass('cm-box').removeAttr('style').find($cmContent).empty();
        $('html').removeClass('overlay-visible');
    };
    var displayOverlay = function() {
        $cmOverlay.addClass('cm-box').fadeTo(0,1);
    };

    var windowSize = function() {
        if( typeof( window.innerWidth ) == 'number' ) {
            winWidth = window.innerWidth;
            winHeight = window.innerHeight;
        } else if ( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
            winWidth = document.documentElement.clientWidth;
            winHeight = document.documentElement.clientHeight;
        } else if ( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
            winWidth = document.body.clientWidth;
            winHeight = document.body.clientHeight;
        }
        maxHeight = Math.round((winHeight * 0.90) / 10) * 10;
    }
    var showArrows = function(i) {
        objLength = $obj.length - 1;
        if ( i === 0 ) {
            $cmPrev.hide();
            $cmNext.show();
            if ( i === objLength) {
                $cmNext.hide();
            }
        } else if ( i === objLength) {
            $cmPrev.show();
            $cmNext.hide();
        } else {
            $cmPrev.add($cmNext).show();
        }
    }

    var populateOverlay = function(i,callback) {

        windowSize();

        var $target = $($obj[i]);
        $cmContent.empty();
        $cmOverlay.fadeTo(0,0);

        var url = $target.attr('href');
        if ( $target.is('[rel]')) {
            $cmContent.prepend('<iframe width="640" height="360" frameborder="0" allowfullscreen="" src="'+url+'?autoplay=1;wmode=opaque;showinfo=0;rel=0;"></iframe>');
            var $iframe = $cmOverlay.find('iframe'),
            iframeWidth = $iframe.attr('width');
            if ( iframeWidth < maxWidth ) {
                iframeWidth = maxWidth;
            }
            var iframeHeight = iframeWidth * aspectRatio;
            $iframe.attr({
                width:iframeWidth,
                height:iframeHeight
            });
            callback();
        } else if ( $target.is('[href*="#"]') ) {
            location.hash = '';
            $origin = $(url).parent();
            $target = $(url).detach();
            $cmContent.prepend($target);
            callback();
        } else {
            if ( $target.is('[alt]')) {
                var alt = $target.attr('alt');
            }

            if ($.inArray(url,images) > -1 ) {
                $cmWrap.addClass('cm-loaded');
            } else {
                $cmWrap.removeClass('cm-loaded');
            }

            var $img = $('<img/>',{
                src:url,
                alt:alt
            });

            $cmContent.prepend($img.on('load',function(){
                    images.push(url);
                    var imgHeight = $img.height();
                    if ( maxHeight < imgHeight ) {
                        imgHeight = maxHeight;
                    }
                    $img.attr('height',imgHeight);
                    callback();
                })
            );
        }
    }

    $(window).on('swipeleft',function(){
        $cmNext.trigger('tap');
    });
    $(window).on('swiperight',function(){
        $cmPrev.trigger('tap');
    });

    $(document).keydown(function(e) {
        switch(e.which) {
            case 27: 
                closeOverlay();
            break;

            case 37: 
                $cmPrev.trigger('tap');
            break;

            case 38: 
            break;

            case 39: 
                $cmNext.trigger('tap');
            break;
            break;

            case 40: 
            break;

            default: return; 
        }
        e.preventDefault(); 
    });

    var showOverlay = function(i){

        var cmMove = function(dir) {
            var distance = winWidth - $cmOverlay.width();
            $cmOverlay.clearQueue();
            if ( dir == 'prev' ) {
                i--;
            } else {
                i++;
                distance = distance *= -1;
            }
            $cmOverlay.animate({'left':distance},150,function(){
                populateOverlay(i,function(){
                    var overlayWidth = $cmOverlay.width();
                    distance = (((winWidth - overlayWidth) / 2 ) + overlayWidth) + 60;
                    if ( dir == 'prev' ) {
                        distance = distance *= -1;
                    }
                    displayOverlay();
                    $cmOverlay.css('left',distance).animate({'left':0},150,function(){
                        $cmWrap.addClass('cm-loaded');
                    });
                    showArrows(i);
                });
            });
        }

        if ( !$('#overlay-mask').length ) {
            $('body').append(
                $cmOverlayMask.hide().fadeTo(0,0),
                $cmWrap.append(
                    $cmOverlay.append(
                        $cmContent
                    ),
                    $cmScale,
                    $cmPrev,
                    $cmNext,
                    $cmClose
                )
            );
            if ( isTouch === false ){
                $cmClose.tooltip({
                    position:'bottom center',
                    effect:'fade'
                });
            }
            $cmPrev.on('tap',function(){
                if ( $cmPrev.is(':visible')) {
                    cmMove('prev');
                }
            });
            $cmNext.on('tap',function(){
                if ( $cmNext.is(':visible')) {
                    cmMove('next');
                }
            });
            $cmWrap.on('tap',function(event){
                if (!$(event.target).is($($cmOverlay.find('*')).add($cmPrev).add($cmNext)) || $(event.target).is($($cmClose))) {
                    closeOverlay();
                }
            });
        }

        $('html').addClass('overlay-visible');
        showArrows(i);

        $cmOverlayMask.show().fadeTo(500,0.8,function(){
            $cmWrap.css('visibility','visible');
            populateOverlay(i,function(){
                displayOverlay();
            });
        });

    }

    $.fn.cmOverlay = function(){
        if ( $obj !== null ) {
            $obj.each(function(){
                $(this).off();
            });
        }
        $obj = this;
        return this.each(function(i) {
            $(this).on('tap',function(e){
                e.preventDefault();
                showOverlay(i);
            });
        });
    }

}( jQuery ));
