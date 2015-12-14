var helpers = {
    noop: function(){
    },
    fetchGet: {
        credentials: 'same-origin',
    },
    fetchPost: function(csrf, obj, verb='POST'){
        obj['csrfmiddlewaretoken'] = csrf;
        return {
            credentials: 'same-origin',
            method: verb,
            headers: new Headers({
                'X-CSRFToken': csrf,
                'content-type': 'application/json',
            }),
            body: JSON.stringify(obj),
        };
    },
};

export default helpers;
