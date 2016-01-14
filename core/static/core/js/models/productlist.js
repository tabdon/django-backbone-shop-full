var app = app || {};

app.ProductList = Backbone.Model.extend({
    urlRoot: '/api/product/',
    parse: function(response) {
        response.objects = new app.ProductListCol(response.objects);
        return response;
    }
});
