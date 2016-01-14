var app = app || {};

app.ReviewView = Backbone.View.extend({
    tagName: 'div',
    template: _.template($('#review').html()),

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        this.$el.find('.rating').rating({
                showCaption:false,
                showClear:false,
                size: 'xs',
                readonly: true,
                step:1
            });

        return this;
    }
});
