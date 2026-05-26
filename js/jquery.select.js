(function( $ ) {
    $.widget( "custom.combobox", {
        options: {
            menuMaxHeight: null,/*должен быть ввиде: 10em,10px add KuchukbaevRF*/
            menuWidth:null,      /*должен быть ввиде: 10 (просто число) add KuchukbaevRF*/
            use_val: false      /*add KuchukbaevRF*/
	},
        _create: function() {
            this.wrapper = $( "<span>" )
                                .addClass( "custom-combobox" )
                                .insertAfter( this.element );
        
            this.element.hide();
            this._createAutocomplete();
            this._createShowAllButton();
        },
 
         _createAutocomplete: function() {
            var selected = this.element.children( ":selected" ),
            val = this.options.use_val ? selected.val() : selected.text(),
            value = val ? val : "";
            
            var l_width = this.element.css('width');
            
            this.input = $( "<input>" )
                .appendTo( this.wrapper )
                .val( value )
                .attr( "title", "" )
                .addClass( "custom-combobox-input ui-widget ui-corner-left "+(this.element.hasClass('required')?'required':'') )
                .css({'border':'1px solid #AAA'})
                .css({'width':(l_width ? l_width : '')})
                .autocomplete({
                    delay: 0,
                    minLength: 0,
                    menuMaxHeight:this.options.menuMaxHeight,
                    menuWidth:this.options.menuWidth,
                    source: $.proxy( this, "_source" )
                  })
                .tooltip({
                    tooltipClass: "ui-state-highlight"
                });
 
            this._on( this.input, {
                autocompleteselect: function( event, ui ) {
                    ui.item.option.selected = true;
                    if (ui.item.option.disabled){
                        this.input.val('');
                        this.element.children("option:enabled:first-child").prop('selected', true);
                        this.element.trigger('select');
                        return false;
                    }
                    this._trigger( "select", event, {
                        item: ui.item.option
                    });
                    this.element.trigger('select');
                },
                autocompletechange: "_removeIfInvalid"
            });
        },
 
        _createShowAllButton: function() {
            var input = this.input;
            var l_input_height = input.outerHeight();
            
            wasOpen = false;
            
            $( "<a>" )
                .attr( "tabIndex", -1 )
                /*.attr( "title", "Показать все станции" )*/
                .tooltip()
                .appendTo( this.wrapper )
                .button({
                    icons: {
                        primary: "ui-icon-triangle-1-s"
                    },
                    text: false
                })
                .removeClass( "ui-corner-all" )
                .addClass( "custom-combobox-toggle ui-corner-right" )
                .css({'vertical-align':'top','height':((l_input_height-2)+'px')})
                .on('mousedown', function() {
                    wasOpen = input.autocomplete( "widget" ).is( ":visible" );
                })
                .on('click', function() {
                    input.focus();

                    // Close if already visible
                    if ( wasOpen ) {
                        return;
                    }

                    // Pass empty string as value to search for, displaying all results
                    input.autocomplete( "search", "" );
                });
        },
 
        _source: function( request, response ) {
            var count=0;
            var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
            var l_use_val = this.options.use_val;
            
            response( this.element.children( "option" ).map(function() {
                var text = $( this ).text();
                var val = $( this ).val();
                if ( this.value && ( !request.term || matcher.test(text) ) && count<100) {
                    count++;
                    return {
                        label: text,
                        value: (l_use_val ? val : text),
                        option: this,
                        style: (request.term=='' ? this.style.cssText : ''),
                        disabled: this.disabled,
                        title: $(this).attr('title')
                    };
                }
            }));
        },
 
        _removeIfInvalid: function( event, ui ) {
 
            // Selected an item, nothing to do
            if ( ui.item ) {
                return;
            }
                
            // Search for a match (case-insensitive)
            var l_use_val = this.options.use_val;
            var value = this.input.val(),
            valueLowerCase = value.toLowerCase(),
            valid = false;
            this.element.children( "option:enabled" ).each(function() {
                var searche_text = l_use_val ? $(this).val() : $(this).text();
                
                if ( searche_text.toLowerCase() === valueLowerCase ) {
                    this.selected = valid = true;
                    return false;
                } 
            });
 
            // Found a match, nothing to do
            if ( valid ) {
                this.element.trigger('select');
                return;
            }
 
            // Remove invalid value
            this.input.val( "" )
                      .attr( "title", value + " нет такого элемента или он заблокирован" )
                      .tooltip( "open" );
            this.element.val( "" );
            this._delay(function() {
                this.input.tooltip( "close" ).attr( "title", "" );
            }, 2500 );
            this.input.autocomplete( "instance" ).term = "";
            this.element.trigger('select');
        },
 
        _destroy: function() {
            this.wrapper.remove();
            this.element.show();
        },
        
        clear:function(){
            this.input.val('');
        }
    });
})( jQuery );
