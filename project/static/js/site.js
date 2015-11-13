// printf helper function for strings
String.prototype.printf = function(){
    //http://stackoverflow.com/questions/610406/
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number){
        return typeof args[number] !== 'undefined' ? args[number] : match;
    });
};


(function ($) {
    /*
     * Sending Django objects via AJAX with CSRF protection.
     * https://docs.djangoproject.com/en/1.8/ref/csrf/
     */
    var getCookie = function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    },
    csrftoken = getCookie('csrftoken'),
    sessionid = getCookie('sessionid'),
    csrfSafeMethod = function(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));  // safe methods
    };

    $.ajaxSetup({
        crossDomain: false,
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
                xhr.setRequestHeader("sessionid", sessionid);
            }
        }
    });
})(jQuery);
