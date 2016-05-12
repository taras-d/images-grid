
function PhotoGrid(cfg) {

    cfg = cfg || {};

    this.images = cfg.images;
    this.$el = cfg.element;
    this.maxGridCells = 5;

    this.render = function() {
        this._setGridClass();
        this._renderGridImages();
    };

    this._setGridClass = function() {

        var classEnd = (this.images.length > this.maxGridCells)?
            this.maxGridCells: this.images.length;

        this.$el
            .removeClass()
            .addClass('photo-grid photo-grid-' + classEnd);

    };

    this._renderGridImages = function() {

        if (!this.images) {
            return;
        }

        this.$el.empty();

        for (var i = 0; i < this.images.length; ++i) {

            if (i == this.maxGridCells) {
                break;
            }

            this.$el.append(
                $('<div>', {
                    class: 'photo-grid-image',
                    click: this._imageClick.bind(this),
                    data: { index: i }
                }).append(
                    $('<img>', {
                        src: this.images[i]
                    })
                )
            );

        }

        if (this.images.length > this.maxGridCells) {
            this._renderSeeAll();
        }

    };

    this._renderSeeAll = function() {

        this.$el.find('.photo-grid-image:last').append(
            $('<div>', {
                class: 'see-all'
            }).append(
                $('<span>', {
                    class: 'see-all-cover',
                }),
                $('<span>', {
                    class: 'see-all-text',
                    text: 'See all ' + this.images.length + ' photos'
                })
            )
        );

    };

    this._imageClick = function(event) {
        var data = $(event.currentTarget).data();
        this.modal.open(data.index);
    };

    this.modal = {

        images: this.images,
        imageIndex: null,
        $modal: null,
        $indicator: null,
        $body: $('body'),

        open: function(startIndex) {

            if (this.$modal) {
                return;
            }

            this.imageIndex = startIndex || 0;

            this._render();

            this.$body.css('overflow', 'hidden');

        },

        close: function() {

            this.$modal.animate({
                opacity: 0
            }, {
                duration: 100,
                complete: function() {
                    this.$modal.remove();
                    this.$modal = null;
                    this.$indicator = null;
                    this.imageIndex = null;
                }.bind(this)
            });

            this.$body.css('overflow', 'visible');

        },

        prev: function() {

            if (this.imageIndex > 0) {
                --this.imageIndex;
            } else {
                this.imageIndex = this.images.length - 1;
            }

            this._updateImage()

        },

        next: function() {

            if (this.imageIndex < this.images.length - 1) {
                ++this.imageIndex;
            } else {
                this.imageIndex = 0;
            }

            this._updateImage()

        },

        _renderCloseButton: function() {

            this.$modal.append($('<div>', {
                class: 'modal-close',
                click: this.close.bind(this)
            }));

        },

        _renderInnerContainer: function() {

            this.$modal.append(
                $('<div>', {
                    class: 'modal-inner'
                }).append(
                    $('<div>', {
                        class: 'modal-image'
                    }).append(
                        $('<img>', {
                            src: this.images[this.imageIndex],
                            click: this._imageClick.bind(this)
                        })
                    ),
                    $('<div>', {
                        class: 'modal-control left',
                        click: this.prev.bind(this)
                    }).append(
                        $('<div>', {
                            class: 'arrow left'
                        })
                    ),
                    $('<div>', {
                        class: 'modal-control right',
                        click: this.next.bind(this)
                    }).append(
                        $('<div>', {
                            class: 'arrow right'
                        })
                    )
                )
            );

            if (this.images.length <= 1) {
                this.$modal.find('.modal-control').hide();
            }

        },

        _renderIndicatorContainer: function() {

            if (this.images.length <= 1) {
                return;
            }

            this.$indicator = $('<div>', {
                class: 'modal-indicator'
            });

            var list = $('<ul>');

            for (var i = 0; i < this.images.length; ++i) {
                list.append($('<li>', {
                    class: this.imageIndex == i? 'selected': '',
                    click: this._indicatorClick.bind(this),
                    data: { index: i }
                }));
            }

            this.$indicator.append(list);

            this.$modal.append(this.$indicator);

        },

        _render: function() {

            this.$modal = $('<div>', {
                id: 'photo-grid-modal'
            });

            this._renderCloseButton();
            this._renderInnerContainer();
            this._renderIndicatorContainer();

            this.$body.append(this.$modal);

            this.$modal.animate({
                opacity: 1
            }, {
                duration: 100
            });

        },

        _updateImage: function() {

            var index = this.imageIndex;

            this.$modal.find('.modal-image img').attr('src', this.images[index]);

            if (this.$indicator) {
                var indicatorList = this.$indicator.find('ul');
                indicatorList.children().removeClass('selected');
                indicatorList.children().eq(index).addClass('selected');
            }

        },

        _imageClick: function(event) {
            this.next();
        },

        _indicatorClick: function(event) {

            var index = $(event.target).data('index');

            this.imageIndex = index;

            this._updateImage();

        }

    }

    if (cfg.autoRender) {
        this.render()
    }

}
