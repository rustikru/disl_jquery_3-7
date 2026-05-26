$(document).ready(function() {
    function recalcLayout() {
        var l_height = $('.wrapper').height() - $('header').height() - $('.options').height() - 10;
        $('aside,section').height(l_height);
    }
    recalcLayout();
    $(window).on('resize', recalcLayout);
});
