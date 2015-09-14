(function($) {

	var calview = getArgument('calview');
	if ( calview === 'grid' ) {
		$('html').addClass('calendargrid');
	}

    $(document).ready( function() {

        var tileTmpl = $('#tile-tmpl').html(),
            $tileContainer = $('.tile-container'),
            $secondaryNav = $('#secondary-nav-content'),
            $secondaryNavLink = $('.secondary-nav > a');

        Mustache.parse(tileTmpl); // speeds up future uses

        // awesomeness!!!
        $('body').hkrAwesomeBar({
            grayscale: true,
            templateURL: '//www.harker.org/uploaded/plugins/awesome-bar/awesome-bar.tpl.html'
        });

        if ( parent.admintab ) {
            $('html').addClass('isAdmin');
        }

        // move stuff around for portal header
        $('.greeting').html( $('.portalmod_content > div:first-child').text() );
        $('.primary-nav').html( $('.primary-nav-container a') );
        
        // calendar page
        formatCalendarItems();

        // create packery stamp for secondary nav
        if ( $tileContainer.length && $('html').hasClass('pagetype_portal') ) {
            $secondaryNav.addClass('stamp').prependTo( $tileContainer );
        }

        $(document).on('click', '.secondary-nav > a', function() {
            if ( $secondaryNav.hasClass('active') ) {
                $secondaryNav.removeClass('active');
                $secondaryNavLink.removeClass('active');
            } else {
                $secondaryNav.addClass('active');
                $secondaryNavLink.addClass('active');
            }

            $tileContainer.packery();

            return false;
        });

        // create tiles
        $('.tile').each( function(i) {
            var $link = $(this),
                $tile = $('<div class="tile '+$link.attr('class')+'" style="background-color:'+$link.data('color')+'" data-index="'+i+'" />').appendTo( $tileContainer ),
                data = {
                    label : $link.text(),
                    url : $link.attr('href'),
                    description : $link.attr('title'),
                    icon : $link.data('icon'),
                    color : $link.data('color'),
                    target : $link.attr('target')
                };

            // render template
            $tile.html( Mustache.render(tileTmpl, data) );

            // get content data
            var $tileContent = $tile.find('.tile-content'),
                portletID = $link.data('portlet-id'),
                selector = $link.data('content');

            // show more link
            $tile.on('tile-content-load', function() {
                var $slider = $tile.find('.flexslider'),
                    $slides = $slider.children('ul'),
                    path = $slider.data('path');

                if ( $slider.length ) {
                    if ( path !== undefined ) {
                        for ( var i=0; i < 10; i++ ) {
                            $slides.append('<li><img src="' + path + 'slide' + (i+1) + '.jpg" alt="Slide ' + (i+1) + '" /></li>');
                        }
                    }

                    $slider.flexslider({
                        animation: "fade",
                        slideshowSpeed: 3500,
                        animationSpeed: 1000, 
                        controlNav: false
                    });
                }
                
                if ( $tile.hasClass('tile-resources') ) {
                    $tile.find('.rss_page_link a').text('View all resources');
                    $tile.find('.tile-content').prepend('<div class="rss_header">Recently Posted</div>');
                }
                if ( $tile.hasClass('tile-announcements') ) {
                    $tile.find('.news_more_posts a').text('View all announcements');
                }

                if ( ! ($tile.hasClass('tile-overlay') || $tile.hasClass('tile-photos')) && $tileContent.outerHeight() > $tile.outerHeight() ) {
                    $('<a href="#" class="tile-show-more"><span class="tile-show-text"><i class="fa fa-chevron-down"></i>Show more</span><span class="tile-hide-text"><i class="fa fa-chevron-up"></i>Show less</span></a>')
                    .appendTo( $tile )
                    .click( function() {

                        if ( $tile.hasClass('tile-expanded') ) {
                            $tile.height('').removeClass('tile-expanded');
                        } else {
                            $tile.height( $tileContent.outerHeight() ).addClass('tile-expanded');
                        }
                        $tileContainer.packery();

                        return false;

                    });
                }

            });
            
            // get content
            if ( portletID ) {
                // load portal element content
                loadPortletContent( portletID, data.label, $tileContent, function() {
                    $tile.addClass('tile-has-content');
                    $tile.trigger('tile-content-load');
                });
                // console.log( $('#c_'+portletID).html() );
            } else if ( selector ) {
                var $contentEl = $(selector);

                if ( $contentEl.length ) {
                    $tileContent.html( $contentEl.html() );
                    $tile.addClass('tile-has-content');
                    $tile.trigger('tile-content-load');
                }   
                // console.log( $contentEl.html() );
            } else if ( $link.find('img').length ) {
                $link.find('img').appendTo($tileContent);

                $tile.addClass('tile-has-content');
                $tile.trigger('tile-content-load');
            }
            
            // $portletContent.on('portlet-content-load', function() {
            //     $tileContent.html( $(this).html() ).trigger('tile-content-load');
            //     $tile.addClass('tile-has-content');
            // });
            // triggerPortletContentLoad( portletID );
            
            // hide original links
            $link.removeClass('tile').hide();
        });

        // initialize packery
        $tileContainer.packery({
            itemSelector: '.tile',
            columnWidth: '.grid-sizer',
            rowHeight: '.grid-sizer',
            gutter: '.gutter-sizer',
            stamp: '.stamp',
            isInitLayout: false
        });

        // initialize tooltips
        $('.tile-controls .fa-info-circle').tooltipster({ 
            maxWidth: 450,
            touchDevices: true,
            contentAsHTML: true,
            trigger: 'click'
        });

        // get sort order
        var pckry = $tileContainer.data('packery'),
            sortOrder = [],
            storedSortOrder = localStorage.getItem('sortOrder_' + pageid);

        if ( pckry ) {
            $('html').addClass('packery');
        }

        if ( storedSortOrder ) {
            storedSortOrder = JSON.parse( storedSortOrder );
            
            // create a hash of items by index
            var itemsByIndex = {},
                itemIndex;

            for ( var i=0, len = pckry.items.length; i < len; i++ ) {
                var item = pckry.items[i];
                
                itemIndex = $( item.element ).data('index');
                itemsByIndex[ itemIndex ] = item;
            }

            // overwrite packery item order
            for (i=0, len = storedSortOrder.length; i < len; i++ ) {
                var j = i;

                itemIndex = storedSortOrder[i];
                while ( itemsByIndex[ itemIndex ] === undefined && j < len ) {
                    itemIndex = storedSortOrder[++j]; // item not found; check next stored item
                }
                if ( j >= len ) {
                    break; // reached end of stored items array
                }
                pckry.items[i] = itemsByIndex[ itemIndex ];
            }
        }

        // initialize layout with sort order
        $tileContainer.packery();

        // initialize draggabilly
        $( $tileContainer.packery('getItemElements') ).each( function( i, item ) {
            // make element draggable with Draggabilly
            var draggie = new Draggabilly( item, { handle : '.tile-controls .fa-reorder' });
            // bind Draggabilly events to Packery
            $tileContainer.packery( 'bindDraggabillyEvents', draggie );
        });

        // store order when layout changes
        $tileContainer.packery( 'on', 'layoutComplete', orderItems );
        $tileContainer.packery( 'on', 'dragItemPositioned', orderItems );
        
        // track portal links
        $(document).on('click', '.tile-link, .tile-content a', trackTileLinks);
        $(document).on('click', '#secondary-nav-content a', trackPortalMenuLinks);
        
        function trackTileLinks(e) {
            var $link = $(this),
                href = $link.attr('href'),
                tileLabel = $link.closest('.tile').find('.tile-label').text(),
                link = this,
                category = 'Portal: Tiles',
                action = 'click',
                label = '';
        
            if ( $link.hasClass('tile-link') ) {
                label = tileLabel;
            } else {
                label = tileLabel + '/' + $link.text();
            }

            if ( $link.attr('target') === '_blank' || (/^#/).test(href) ) {
                trackEvent(category, action, label);
            } else {
                e.preventDefault();
                trackOutboundEvent(link, category, action, label);
            }
        }
        
        function trackPortalMenuLinks(e) {
            var $link = $(this),
                href = $link.attr('href'),
                link = this,
                category = 'Portal: Portal Menu Links',
                action = 'click',
                label = $link.text();

            if ( $link.attr('target') === '_blank' || (/^#/).test(href) ) {
                trackEvent(category, action, label);
            } else {
                e.preventDefault();
                trackOutboundEvent(link, category, action, label);
            }
        }
        
        function formatCalendarItems() {
            $('.pagetype_calendar .event_time').each( function() {
        
				var $time = $(this),
					txt = $time.text(),
					amReg = /AM/g, amTxt = 'a.m.',
					pmReg = /PM/g, pmTxt = 'p.m.',
					zeroReg = /:00/g;

				if ( amReg.test(txt) ) {
					txt = txt.replace( amReg, amTxt );
				}
				if ( pmReg.test(txt) ) {
					txt = txt.replace( pmReg, pmTxt );
				}
				if ( zeroReg.test(txt) ) {
					txt = txt.replace( zeroReg, '' );
				}

				$time.text(txt);

			});
        }

        function orderItems() {
            var itemElems = pckry.getItemElements();
            // reset / empty order array
            sortOrder.length = 0;
            for (var i=0; i < itemElems.length; i++) {
                sortOrder[i] = $(itemElems[i]).data('index');
            }
            // save tabindex ordering
            localStorage.setItem('sortOrder_' + pageid, JSON.stringify(sortOrder) );
        }

        function loadPortletContent(id, title, target, success) {
            if ( id === undefined || id === null || id.length <= 0 || id <= 0 ) {
                return false;
            }

            $.ajax({
                url: "cf_elements/elementremote.cfc",
                cache: false,
                data: {
                    method: "buildElement",
                    id: id,
                    firstLoad: false,
                    inUnpublished: !!(window.topframe && window.topframe.unpublished)
                },
                type: "post",
                dataType: "html",
                success: function(data, textStatus) {
                    $(target).html( $(data) );
                    success();
                },
                error: function(e, textStatus) {
                    if ( ! (textStatus == "error" && e.status === 0) ) {
                        $.jGrowl("There was an error loading " + title + ".");
                    }
                    return false;
                }
            });
        }

        function triggerPortletContentLoad(id) {
            if ( id === undefined || id === null || id.length <= 0 || id <= 0 ) {
                return;
            }

            var maxAttempts = 10,
                attempts = 0,
                listen = function() {
                    if ( attempts > maxAttempts ) {
                        return;
                    }

                    var $contentEl = $('#c_' + id),
                        $children = $contentEl.children().not('script, style');

                    if ( $children.length ) {
                        $contentEl.trigger('portlet-content-load');
                    } else {
                        attempts++;
                        setTimeout( listen, 250 );
                    } 
                };

            listen();
        }

    });

})(jQuery);

function trackEvent(category, action, label) {
    try { 
        _gaq.push(['_trackEvent', category , action, label]); 
    } catch(err){}
}

function trackOutboundLink(link, category, action, label) { 
    label = label || action; // label is optional

    try { 
        _gaq.push(['_trackPageview', label]); 
    } catch(err){}

    try { 
        _gaq.push(['_trackEvent', category , action, label]); 
    } catch(err){}
     
    setTimeout(function() {
        document.location.href = link.href;
    }, 200);
}

function trackOutboundEvent(link, category, action, label) {
    label = label || link.href; // label is optional

    try { 
        _gaq.push(['_trackEvent', category , action, label]); 
    } catch(err){}
     
    setTimeout(function() {
        document.location.href = link.href;
    }, 100);
}

function getArgument(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
