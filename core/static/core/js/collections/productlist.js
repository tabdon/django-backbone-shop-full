var app = app || {};

app.ProductListCol = Backbone.Collection.extend({
    model: app.Product,
    url: '/api/product'
});
