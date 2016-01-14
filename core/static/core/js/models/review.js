var app = app || {};

app.Review = Backbone.Model.extend({
    defaults: {
        full_name: '',
        rating: 0,
        comment: '',
        product: null
    },

    // override sync method to use a different URL for creation given the current API
    sync: function(method, model, options) {
        options || (options = {});

        if (method === 'create') {
            options.url = '/api/review/';
        }

        Backbone.sync(method, model, options);
    }
});
