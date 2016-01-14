var app = app || {};

app.Product = Backbone.Model.extend({
    urlRoot: '/api/product',
    parse: function(response) {
        response.id = response.product_id;
        return response;
    }
});
