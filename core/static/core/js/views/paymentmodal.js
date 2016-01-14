var app = app || {};

app.PaymentModalView = Backbone.View.extend({

    // set the el and template properties
    el: '.modal-content',
    template: _.template($('#paymentForm').html()),

    // initialize method
    initialize: function(product) {
        this.model = product;
        this.modal = null;
        this.render();
        this.isLoading = false;

        // validation map
        this.validationMap = {
            'email': 'validateEmail',
            'card': Stripe.validateCardNumber,
            'cvc': Stripe.validateCVC,
            'expiry': 'validateExpiry'
        };
    },

    // event hash
    events: {
      'click .modal-footer button': 'closeModal',
      'click .modal-body form button': 'submitForm'
    },

    // validate email method
    validateEmail: function(value) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(value);
    },

    // validate expiry; it is a string "mm / yy[yy]"
    parseExpiry: function(value) {
        var month, prefix, year, _ref;

        value = value || '';

        value = value.replace(/\s/g, '');
        _ref = value.split('/', 2), month = _ref[0], year = _ref[1];

        if ((year != null ? year.length : void 0) === 2 && /^\d+$/.test(year)) {
          prefix = (new Date).getFullYear();
          prefix = prefix.toString().slice(0, 2);
          year = prefix + year;
        }

        month = parseInt(month, 10);
        year = parseInt(year, 10);

        return {
          month: month,
          year: year
        };
    },

    // part of validate expiry
    validateExpiry: function(value) {
        value = this.parseExpiry(value);

        var month = value.month,
            year = value.year,
            prefix = null;

        if (year.length === 2) {
            prefix = (new Date).getFullYear();
            prefix = prefix.toString().slice(0, 2);
            year = prefix + year;
        }

        return Stripe.validateExpiry(month.toString(), year.toString());
    },

    // creates error string from Stripe error messages
    generateErrorText: function(errorData) {
        var text = '';
        if (errorData.detail) {
            text = errorData.detail;
        } else {
            for (var x in errorData) {
                text += errorData[x] + ' ';
            }
        }
        return text;
    },

    // inserts messages into the page
    displayMessage: function(css, message) {
        var messageEl = this.$el.find('.message');
        messageEl.addClass(css);
        messageEl.text(message);
    },

    // submits form for payment processing
    submitForm: function(e) {

        // prevent the default form action
        e.preventDefault();

        if (!this.isLoading) {
            this.isLoading = true;
            this.$el.find('.loading').show();

            var formData = {
                amount: this.model.get('price')
            };

            var hasErrors = false;

            var self = this;

            // find the form, then iterate through each of its elements
            this.$el.find('form .form-group').each(function (i, el) {
                var group = $(el);
                var formElement = group.find(':input');

                // if an element is an "input", and has a value, process it
                if (formElement.val() != '') {
                    var attrName = formElement.attr('name');

                    if (self.validationMap.hasOwnProperty(attrName)) {
                        var func = self.validationMap[attrName];

                        var isValid = false;

                        if (typeof func === 'function') {
                            isValid = func(formElement.val());
                        } else {
                            isValid = self[func](formElement.val());
                        }

                        if (!isValid) {
                            group.addClass('has-error');
                            hasErrors = true;
                            return false; // continue to the next iteration
                        }
                    }

                    group.removeClass('has-error');
                    formData[attrName] = formElement.val();
                } else {
                    group.addClass('has-error');
                    hasErrors = true;
                }
            });

            // create Stripe token & then submit to Django Order API
            if (!hasErrors) {
                var expiry = this.parseExpiry(formData.expiry);
                Stripe.createToken({
                        number: formData.card,
                        cvc: formData.cvc,
                        exp_month: expiry.month,
                        exp_year: expiry.year
                    },
                    function (status, response) {
                        if (response.error) {
                            self.displayMessage('text-danger', response.error.message);
                            self.$el.find('.loading').hide();
                        } else {
                            var order = new app.Order({
                                product: self.model.get('id'),
                                full_name: formData.name,
                                email: formData.email,
                                stripe_id: response.id
                            });

                            order.save(null, {success: function (model, response) {
                                self.displayMessage('text-success', 'Payment Successful');
                                self.isLoading = false;
                                self.$el.find('.loading').hide();
                            }, error: function (model, response) {
                                self.displayMessage('text-danger', self.generateErrorText(response.data));
                                self.isLoading = false;
                                self.$el.find('.loading').hide();
                            }});
                        }
                    });
            } else {
                this.isLoading = false;
                this.$el.find('.loading').hide();
            }
        }
    },

    // close modal action
    closeModal: function(e) {
        e.preventDefault();

        this.modal.modal('hide');
    },

    // render method
    render: function() {
        this.$el.html(this.template(this.model.attributes));

        this.modal = $('.modal').modal();

        return this;
    }

});
