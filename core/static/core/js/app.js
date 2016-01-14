var app = app || {};

app.Router = Backbone.Router.extend({
    routes: {
        '': 'productListRoute',
        'p/:productId': 'productDetailRoute'
    },

    productListRoute: function() {
        new app.ProductListView();
    },

    productDetailRoute: function(productId) {
        new app.ProductView(productId);
    }
});

$(function() {
    new app.Router();
    Backbone.history.start();
});
