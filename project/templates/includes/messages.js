<script type="text/javascript">
    var opts = {
        closeButton: true,
        debug: false,
        newestOnTop: false,
        progressBar: false,
        positionClass: 'toast-top-right',
        preventDuplicates: false,
        onclick: null,
        showDuration: 500,
        hideDuration: 500,
        timeOut: 0,
        extendedTimeOut: 1000,
        showEasing: 'swing',
        hideEasing: 'linear',
        showMethod: 'fadeIn',
        hideMethod: 'fadeOut'
    };

    {% for message in messages %}
        toastr["{{message.tags}}"]("{{ message|safe }}", opts)
    {% endfor %}

    window.setInterval(function(){
        $.get('{% url "analysis:poll_messages" %}', function(d){
            d.messages.forEach(function(resp){
                toastr[resp.status](resp.message, opts);
            });
        });
    }, 5000);
</script>
