var app = app || {};

var _chunk = function(array, chunkSize) {
    var len = array.length,out = [], i = 0;
    while (i < len) {
        var size = Math.ceil((len - i) / chunkSize--);
        out.push(array.slice(i, i += size));
    }
    return out;
};

var _parseURL = function (url) {
    /* http://james.padolsey.com/javascript/parsing-urls-with-the-dom/ */
    var a = document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function () {
            var ret = {},
                seg = a.search.replace(/^\?/, '').split('&'),
                len = seg.length, i = 0, s;
            for (; i < len; i++) {
                if (!seg[i]) {
                    continue;
                }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^\/])/, '/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
        segments: a.pathname.replace(/^\//, '').split('/')
    };
};

app.ProductListView = Backbone.View.extend({

    // set html container and template
    el: '#container',
    template: _.template($('#productList').html()),

    // Initialize function
    initialize: function(columns) {

        // sets the number of columns to display products in
        this.columns = columns || 2;

        // sets up null object values for pagination that will be used later on
        this.paginationContainer = null,
            this.nextButton = null,
            this.previousButton = null;

        // inserts HTML for paginate prev/next buttons
        this.insertPaginationMarkup();

        // creates a new instance of the controller & performs a fetch
        this.controller = new app.ProductList();
        this.controller.fetch({reset: true});

        // what does this do?
        this.listenTo(this.controller, 'change', this.render);
    },

    // inserts HTML for paginate prev/next buttons
    insertPaginationMarkup: function() {
        this.$el.html('<div class="pagination">\
                            <button class="prev">Prev</button>\
                            <button class="next">Next</button>\
                        </div>');

        this.paginationContainer = this.$('.pagination');
        this.nextButton = this.$('.next');
        this.previousButton = this.$('.prev');
    },

    // events mapping
    events: {
        'click .next': 'nextPage',
        'click .prev': 'prevPage'
    },

    // next page event
    nextPage: function() {
        this.loadPagedProducts(this.controller.get('links').next);
    },

    // prev page event
    prevPage: function() {
        this.loadPagedProducts(this.controller.get('links').prev);
    },

    // load paged products
    loadPagedProducts: function(paginationUrl) {
        if (paginationUrl) {
            var params = _parseURL(paginationUrl).params;
            if (params) {
                this.controller.fetch({data: params});
            }
        }
    },

    // determine whether to show paginate links or not
    togglePaginationVisibility: function() {

        // this looks at the JSON response object for a 'links' value
        var pageObj = this.controller.get('links');
        var canPaginate = pageObj.prev != null || pageObj.next != null;

        if (canPaginate) {
            this.paginationContainer.show();
            if (pageObj.prev) {
                this.previousButton.show();
            } else {
                this.previousButton.hide();
            }

            if (pageObj.next) {
                this.nextButton.show();
            } else {
                this.nextButton.hide();
            }
        } else {
            this.paginationContainer.hide();
        }
    },

    // render function
    render: function() {

        // clear the product list in case it's on the page
        this.$el.find('.product-list').remove();

        // determine whether or not to display next/prev buttons
        this.togglePaginationVisibility();

        // create two product list arrays from the JSON response
        var productGroups = _chunk(this.controller.get('objects'), this.columns);

        // iterate over product list, insert each one into the page
        for (var i = 0, l = productGroups.length; i < l; i++) {
            var products = productGroups[i];
            var html = this.template();
            this.$el.append(html);

            var innerView = this.$el.find('.product-list')[i];

            for (var j = 0, le = products.length; j < le; j++) {
                var product = products[j];
                this.renderProduct(innerView, product);
            }
        }
    },

    // does this insert the code into the page?
    renderProduct: function(container, item) {
        var itemView = new app.ProductListItemView({
            model: item
        });
        this.$(container).append(itemView.render().el);
    }


});
