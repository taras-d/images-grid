
function PhotoGrid(cfg) {

    cfg = cfg || {};

    this.images = cfg.images;
    this.isAlign = cfg.align;
    this.maxGridCells = 5;

    this.$el = cfg.element;
    this.$gridItems = [];

    var imageLoadCount = 0;

    this.render = function() {

        this._setGridClass();
        this._renderGridImages();

        $(document)
            .off('keyup', this._keyPress)
            .on('keyup', this._keyPress.bind(this));

        $(window)
            .off('resize', this._resize)
            .on('resize', this._resize.bind(this));

    };

    this._setGridClass = function() {

        var classEnd = (this.images.length > this.maxGridCells)?
            this.maxGridCells: this.images.length;

        this.$el.removeClass(function(index, classNames) {
            if (/(photo-grid-\d)/.test(classNames)) {
                return RegExp.$1;
            }
        });

        this.$el.addClass('photo-grid photo-grid-' + classEnd);

    };

    this._renderGridImages = function() {

        if (!this.images) {
            return;
        }

        this.$el.empty();
        this.$gridItems = [];

        var i, item;
        for (i = 0; i < this.images.length; ++i) {

            if (i == this.maxGridCells) {
                break;
            }

            item = $('<div>', {
                class: 'photo-grid-image',
                click: this._imageClick.bind(this),
                data: { index: i }
            });

            item.append(
                $('<div>', {
                    class: 'image-wrap'
                }).append(
                    $('<img>', {
                      src: this.images[i],
                      load: this._imageLoaded.bind(this)
                    })
                )
            );

            this.$gridItems.push(item);

        }

        this.$el.append(this.$gridItems);

        if (this.images.length > this.maxGridCells) {
            this._renderSeeAll();
        }

    };

    this._renderSeeAll = function() {

        this.$el.find('.photo-grid-image:last .image-wrap').append(
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

    this._keyPress = function(event) {

        if (!this.modal.$modal) {
            return;
        }

        switch (event.keyCode) {
            case 27: // Esc
                this.modal.close();
                break;
            case 37: // Left arrow
                this.modal.prev();
                break;
            case 39: // Right arrow
                this.modal.next();
                break;
        }

    };

    this._resize = function(event) {
        this._align();
    };

    this._imageClick = function(event) {
        var data = $(event.currentTarget).data();
        this.modal.open(data.index);
    };

    this._imageLoaded = function() {
        ++imageLoadCount;
        if (imageLoadCount == this.$gridItems.length) {
            imageLoadCount = 0;
            this._allImagesLoaded()
        }
    };

    this._allImagesLoaded = function() {
        this._align();
    };

    this._align = function() {

        if (!this.isAlign) {
            return;
        }

        var len = this.$gridItems.length;

        switch (len) {
            case 2:
            case 3:
                this._alignItems(this.$gridItems);
                break;
            case 4:
                this._alignItems(this.$gridItems.slice(0, 2));
                this._alignItems(this.$gridItems.slice(2));
                break;
            case 5:
                this._alignItems(this.$gridItems.slice(0, 3));
                this._alignItems(this.$gridItems.slice(3));
                break;
        }

    };

    this._alignItems = function(items) {

        var height = items.map(function(item) {
            return item.find('img').height();
        });

        var itemHeight = Math.min.apply(null, height);

        $(items).each(function() {
            var item = $(this),
                imgWrap = item.find('.image-wrap'),
                img = item.find('img'),
                imgHeight = img.height();
            imgWrap.height(itemHeight);
            if (imgHeight > itemHeight) {
                var top = Math.floor((imgHeight - itemHeight) / 2);
                img.css({ top: -top });
            }
        });

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
