var app = app || {};

app.ReviewListView = Backbone.View.extend({
    el: '.reviews',
    template: _.template($('#reviews').html()),

    // set the initialize function
    initialize: function(product) {
        this.product = product;
        this.collection = new app.Reviews(this.product);
        this.collection.fetch({reset: true});

        this.reviewsContainer = null;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'add', this.prependReview);
    },

    // add the events
    events: {
        'click a.showForm': 'showForm',
        'click .review-form button': 'submitForm'
    },

    // show form event
    showForm: function(e) {
        e.preventDefault();
        if (typeof this.$reviewFrom === 'undefined') {
            this.$reviewFrom = this.$el.find('.review-form');
            this.$showFormLink = this.$(e.target);
        }

        this.$reviewFrom.show();
        this.$showFormLink.hide();
    },

    // submit form event
    submitForm: function(e) {
        e.preventDefault();

        var formData = {
            'product': this.product.get('id')
        };

        var hasErrors = false;

        // find the form element & iterate over each child element
        this.$reviewFrom.find('.form-group').each(function(i, el) {
            var group = $(el);
            var formElement = group.find(':input');

            // if child element has a non-blank value, add it to formData
            if (formElement.val() != '') {
                group.removeClass('has-error');
                formData[formElement.attr('name')] = formElement.val();
            } else {
                group.addClass('has-error');
                hasErrors = true;
            }
        });

        console.log(formData);

        // create a new collection item with the formData
        if (!hasErrors) {
            this.collection.create(formData);
        }
    },

    // render method
    render: function() {
        this.$el.html(this.template());

        // set the rating's plugin settings
        if (!this.reviewsContainer) {
            this.reviewsContainer = this.$el.find('.review-list');

            this.$el.find('.rating').rating({
                showCaption:false,
                showClear:false,
                size: 'xs',
                step:1
            });
        }

        this.reviewsContainer.empty();

        // iterate through review items; append to the page
        var self = this;
        this.collection.each(function(review) {
            self.appendReview(review);
        });
    },

    // appendReview method
    appendReview: function(review) {
        this.renderReview(review, false);
    },

    // prependReview method
    prependReview: function(review) {
        this.renderReview(review, true);
        this.$reviewFrom.hide();
        this.$reviewFrom.find('.form-group :input').val('');
        this.$showFormLink.show();
    },

    // renderReview method
    renderReview: function(review, prepend) {
        var reviewView = new app.ReviewView({
            model: review
        });

        if (!prepend){
            this.reviewsContainer.append(reviewView.render().el);
        } else {
            this.reviewsContainer.prepend(reviewView.render().el);
        }
    }


});
