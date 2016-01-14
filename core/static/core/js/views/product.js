var app = app || {};

app.ProductView = Backbone.View.extend({
    el: '#container',
    template: _.template($('#product').html()),

    initialize: function(productId) {
        this.model = new app.Product({id: productId});

        this.model.fetch({reset: true});

        this.listenTo(this.model, 'change', this.render);
    },

    events: {
        'click button.buy-now': 'openModal'
    },

    openModal: function(e) {
        e.preventDefault();
        new app.PaymentModalView(this.model);
    },

    render: function() {
        this.$el.html(this.template(this.model.attributes));

        new app.ReviewListView(this.model);

        return this;
    }
});
