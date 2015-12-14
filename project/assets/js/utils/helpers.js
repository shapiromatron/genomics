import _ from 'underscore';

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
    fetchDelete: function(csrf){
        return {
            credentials: 'same-origin',
            method: 'DELETE',
            headers: new Headers({
                'X-CSRFToken': csrf,
                'content-type': 'application/json',
            }),
            body: JSON.stringify({csrfmiddlewaretoken:  csrf}),
        };
    },
    getValue(target){
        switch(target.type){
        case 'checkbox':
            return target.checked;
        case 'text':
        case 'textarea':
        default:
            return target.value;
        }
    },
    getPatch(originalObj, newObj){
        let patch = {};
        _.each(newObj, function(v, k){
            if (originalObj[k] !== v) patch[k] = v;
        });
        return patch;
    },
    getObjectURL(base, id){
        return `${base}${id}/`;
    },
};

export default helpers;
