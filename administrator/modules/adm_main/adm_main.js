$(document).ready(function() {
    /*изменияем размеры tab-ов по размеру окна*/
    var l_height = $('.wrapper').height() - $('header').height() - $('.ui-tabs-nav').height() - 15;
    $('.ui-tabs-panel').height(l_height);
    
    $('#tabs').removeClass('ui-widget');
});