/*  ---------------------------------------------------
    Template Name: Sona
    Description: Sona Hotel Html Template
    Author: Colorlib
    Author URI: https://colorlib.com
    Version: 1.0
    Created: Colorlib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    //Offcanvas Menu
    $(".canvas-open").on('click', function () {
        $(".offcanvas-menu-wrapper").addClass("show-offcanvas-menu-wrapper");
        $(".offcanvas-menu-overlay").addClass("active");
    });

    $(".canvas-close, .offcanvas-menu-overlay").on('click', function () {
        $(".offcanvas-menu-wrapper").removeClass("show-offcanvas-menu-wrapper");
        $(".offcanvas-menu-overlay").removeClass("active");
    });

    // Search model
    $('.search-switch').on('click', function () {
        $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    /*------------------
		Navigation
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*------------------
        Hero Slider
    --------------------*/
   $(".hero-slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: true,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        mouseDrag: false
    });

    /*------------------------
		Testimonial Slider
    ----------------------- */
    $(".testimonial-slider").owlCarousel({
        items: 1,
        dots: false,
        autoplay: true,
        loop: true,
        smartSpeed: 1200,
        nav: true,
        navText: ["<i class='arrow_left'></i>", "<i class='arrow_right'></i>"]
    });

    /*------------------
        Magnific Popup
    --------------------*/
    $('.video-popup').magnificPopup({
        type: 'iframe'
    });

    /*------------------
		Date Picker
	--------------------*/
    // $(".date-input").datepicker({
    //     minDate: 0,
    //     dateFormat: 'dd MM, yy',
    // });
    // $(".date-output").datepicker(
    //     {
    //     minDate: $(".date-input").value,
    //     dateFormat: 'dd MM, yy',
    //     onSelect: function(dateText) {
    //         console.log(  $(".date-input").val() );
    //     }
    // });
    var dateToday = new Date(Date.now()+ 1 * 24*60*60*1000); 
    var dateTomorrow = new Date(dateToday.getTime() + 1 * 24*60*60*1000); 
    $( function() {
    $( "#date-in" ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat:'dd MM, yy',
        minDate: dateToday,
        onClose: function (selected) {
        if(selected.length <= 0) {
            // selected is empty
            $("#date-out").datepicker('disable');
        } else {
            $("#date-out").datepicker('enable');
        }
        $("#date-out").datepicker("option", "minDate", new Date(new Date(selected).getTime() + 1 * 24*60*60*1000));
        }
    });

    console.log("EIEI")
    
    $( "#date-out" ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat:'dd MM, yy',
        minDate: dateTomorrow,
        onClose: function (selected) {
        if(selected.length <= 0) {
            // selected is empty
            $("#date-in").datepicker('disable');
        } else {
            $("#date-in").datepicker('enable');
        }
        // $("#date-in").datepicker("option", "maxDate", selected);
        }
    });
    }); 
    /*------------------
		Nice Select
	--------------------*/
    $("select").niceSelect();

})(jQuery);
