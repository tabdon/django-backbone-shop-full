var app = app || {};

app.ProductListItemView = Backbone.View.extend({
    tagName: 'div',
    template: _.template($('#productListItem').html()),

    render: function() {
        this.$el.html(this.template(this.model.attributes));

        return this;
    }
});
