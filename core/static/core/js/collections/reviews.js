var app = app || {};

app.Reviews = Backbone.Collection.extend({
    model: app.Review,

    initialize: function(product) {
      this.product = product;
    },

    url: function(){
        return '/api/product/'+ this.product.id + '/reviews/';
    },

    parse: function(response) {
        var items = [];
        if (response.hasOwnProperty('objects')) {
            for(var i = 0, l = response.objects.length; i < l; i++) {
                var item = response.objects[i];
                item.product = this.product.get('id');
                items.push(new this.model(item));
            }
        }

        return items;
    }
});
