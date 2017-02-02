
(function($) {

    // ===== Plugin =====

    $.fn.imagesGrid = function(options) {

        var args = arguments;

        return this.each(function() {

            if ($.isPlainObject(options)) {
                // Create ImagesGrid
                var opts = $.extend({}, $.fn.imagesGrid.defaults, options);
                opts.element = $(this);
                this._imgGrid = new ImagesGrid(opts);
                return;
            }

            if (this._imgGrid instanceof ImagesGrid) {
                switch (options) {
                    case 'modal.open':
                        this._imgGrid.modal.open(args[1]);
                        break;
                    case 'modal.close':
                        this._imgGrid.modal.close();
                        break;
                }
            }

        });

    };

    // ===== Plugin default options =====

    $.fn.imagesGrid.defaults = {
        images: [],
        cells: 5,
        align: false,
        nextOnClick: true,
        getViewAllText: function(imagesCount) {
            return 'View all ' + imagesCount + ' images';
        },
        onGridRendered: $.noop,
        onGridItemRendered: $.noop,
        onGridLoaded: $.noop,
        onGridImageLoaded: $.noop,
        onModalOpen: $.noop,
        onModalClose: $.noop,
        onModalImageClick: $.noop
    };

    // ===== ImagesGrid =====

    /*
      ImagesGrid constructor
        opts         - Options
        opts.element - jQuery element
        opts.images  - Array of images urls of images option objects
        opts.align   - Aling diff-size images
        opts.cells   - Max grid cells (1-6)
        opts.getViewAllText     - Returns text for "view all images" link,
        opts.onGridRendered     - Called when grid items added to the DOM
        opts.onGridItemRendered - Called when grid item added to the DOM
        opts.onGridLoaded       - Called when grid images loaded
        opts.onGridImageLoaded  - Called when grid image loaded
    */
    function ImagesGrid(opts) {

        this.opts = opts || {};

        this.$window = $(window);
        this.$element = this.opts.element;
        this.$gridItems = [];

        this.modal = null;
        this.imageLoadCount = 0;

        var cells = this.opts.cells;
        this.opts.cells = (cells < 1)? 1: (cells > 6)? 6: cells;

        this.init();
    }

    ImagesGrid.prototype.init = function()  {

        this.applyGridClass();
        this.renderGridItems();
        this.initModal();

        this.$window.on('resize', this.onWinResize.bind(this));
    };

    ImagesGrid.prototype.initModal = function() {

        var opts = this.opts;

        this.modal = new ImagesGridModal({
            images: opts.images,
            nextOnClick: opts.nextOnClick,
            onModalOpen: opts.onModalOpen,
            onModalClose: opts.onModalClose,
            onModalImageClick: opts.onModalImageClick
        });
    };

    ImagesGrid.prototype.applyGridClass = function() {

        // Remove previous grid class
        this.$element.removeClass(function(index, classNames) {
            if (/(imgs-grid-\d)/.test(classNames)) {
                return RegExp.$1;
            }
        });

        var opts = this.opts,
            imgsLen = opts.images.length,
            cellsCount = (imgsLen < opts.cells)? imgsLen: opts.cells;

        this.$element.addClass('imgs-grid imgs-grid-' + cellsCount);
    };

    ImagesGrid.prototype.renderGridItems = function() {

        var opts = this.opts,
            imgs = opts.images,
            imgsLen = imgs.length;

        if (!imgs) {
            return;
        }

        this.$element.empty();
        this.$gridItems = [];

        for (var i = 0; i < imgsLen; ++i) {
            if (i == opts.cells) {
                break;
            }
            this.renderGridItem(imgs[i], i);
        }

        if (imgsLen > opts.cells) {
            this.renderViewAll();
        }

        opts.onGridRendered(this.$element);
    };

    ImagesGrid.prototype.renderGridItem = function(image, index) {

        var src = image,
            alt = '',
            title = '',
            opts = this.opts;

        if ($.isPlainObject(image)) {
            src = image.src;
            alt = image.alt || '';
            title = image.title || '';
        }

        var item = $('<div>', {
            class: 'imgs-grid-image',
            click: this.onImageClick.bind(this),
            data: { index: index }
        });

        item.append(
            $('<div>', {
                class: 'image-wrap'
            }).append(
                $('<img>', {
                    src: src,
                    alt: alt,
                    title: title,
                    on: {
                        load: function(event) {
                            this.onImageLoaded(event, $(this), image);
                        }.bind(this)
                    }
                })
            )
        );

        this.$gridItems.push(item);
        this.$element.append(item);

        opts.onGridItemRendered(item, image);
    };

    ImagesGrid.prototype.renderViewAll = function() {

        var opts = this.opts;

        this.$element.find('.imgs-grid-image:last .image-wrap').append(
            $('<div>', {
                class: 'view-all'
            }).append(
                $('<span>', {
                    class: 'view-all-cover',
                }),
                $('<span>', {
                    class: 'view-all-text',
                    text: opts.getViewAllText(opts.images.length)
                })
            )
        );
    };

    ImagesGrid.prototype.onWinResize = function(event) {
        if (this.opts.align) {
            this.align();
        }
    };

    ImagesGrid.prototype.onImageClick = function(event) {
        var imageIndex = $(event.currentTarget).data('index');
        this.modal.open(imageIndex);
    };

    ImagesGrid.prototype.onImageLoaded = function(event, imageEl, image) {

        var opts = this.opts;

        ++this.imageLoadCount;

        opts.onGridImageLoaded(event, imageEl, image);

        if (this.imageLoadCount == this.$gridItems.length) {
            this.imageLoadCount = 0;
            this.onAllImagesLoaded()
        }
    };

    ImagesGrid.prototype.onAllImagesLoaded = function() {

        var opts = this.opts;

        if (opts.align) {
            this.align();
        }

        opts.onGridLoaded(this.$element);
    };

    ImagesGrid.prototype.align = function() {

        var itemsLen = this.$gridItems.length;

        switch (itemsLen) {
            case 2:
            case 3:
                this.alignItems(this.$gridItems);
                break;
            case 4:
                this.alignItems(this.$gridItems.slice(0, 2));
                this.alignItems(this.$gridItems.slice(2));
                break;
            case 5:
            case 6:
                this.alignItems(this.$gridItems.slice(0, 3));
                this.alignItems(this.$gridItems.slice(3));
                break;
        }
    };

    ImagesGrid.prototype.alignItems = function(items) {

        var itemsHeight = items.map(function(item) {
            return item.find('img').height();
        });

        var itemHeight = Math.min.apply(null, itemsHeight);

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

    /*
      ImagesGridModal constructor
        opts             - Options
        opts.images      - Array of string or objects
        opts.nextOnClick - Show next image when click on modal image
        opts.onModalOpen       - Called when modal opened
        opts.onModalClose      - Called when modal closed
        opts.onModalImageClick - Called on modal image click
    */
    function ImagesGridModal(opts) {

        this.opts = opts || {};

        this.imageIndex = null;

        this.$document = $(document);
        this.$modal = null;
        this.$indicator = null;
    }

    ImagesGridModal.prototype.open = function(imageIndex) {

        if (this.$modal && this.$modal.is(':visible')) {
            return;
        }

        this.imageIndex = parseInt(imageIndex) || 0;
        this.render();
    };

    ImagesGridModal.prototype.close = function(event) {

        if (!this.$modal) {
            return;
        }

        var opts = this.opts;

        this.$modal.animate({
            opacity: 0
        }, {
            duration: 100,
            complete: function() {
                this.$modal.remove();
                this.$modal = null;
                this.$indicator = null;
                this.imageIndex = null;
                opts.onModalClose();
            }.bind(this)
        });

        this.$document.off('keyup', this.onKeyUp);
    };

    ImagesGridModal.prototype.render = function() {

        var opts = this.opts;

        this.renderModal();
        this.renderCaption();
        this.renderCloseButton();
        this.renderInnerContainer();
        this.renderIndicatorContainer();

        this.onKeyUp = this.onKeyUp.bind(this);
        this.$document.on('keyup', this.onKeyUp);

        this.$modal.animate({
            opacity: 1
        }, {
            duration: 100,
            complete: function() {
                opts.onModalOpen(this.$modal);
            }.bind(this)
        });
    };

    ImagesGridModal.prototype.renderModal = function() {
        this.$modal = $('<div>', {
            class: 'imgs-grid-modal'
        }).appendTo('body');
    };

    ImagesGridModal.prototype.renderCaption = function() {
        this.$caption = $('<div>', {
            class: 'modal-caption',
            text: this.getImageCaption(this.imageIndex)
        }).appendTo(this.$modal);
    };

    ImagesGridModal.prototype.renderCloseButton = function() {
        this.$modal.append($('<div>', {
            class: 'modal-close',
            click: this.close.bind(this)
        }));
    };

    ImagesGridModal.prototype.renderInnerContainer = function() {

        var opts = this.opts,
            image = this.getImage(this.imageIndex);

        this.$modal.append(
            $('<div>', {
                class: 'modal-inner'
            }).append(
                $('<div>', {
                    class: 'modal-image'
                }).append(
                    $('<img>', {
                        src: image.src,
                        alt: image.alt,
                        title: image.title,
                        on: {
                            load: this.onImageLoaded.bind(this),
                            click: function(event) {
                                this.onImageClick(event, $(this), image);
                            }.bind(this)
                        }
                    }),
                    $('<div>', {
                        class: 'modal-loader',
                        text: 'loading...'
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

        if (opts.images.length <= 1) {
            this.$modal.find('.modal-control').hide();
        }
    };

    ImagesGridModal.prototype.renderIndicatorContainer = function() {

        var opts = this.opts,
            imgsLen = opts.images.length;

        if (imgsLen == 1) {
            return;
        }

        this.$indicator = $('<div>', {
            class: 'modal-indicator'
        });

        var list = $('<ul>'), i;
        for (i = 0; i < imgsLen; ++i) {
            list.append($('<li>', {
                class: this.imageIndex == i? 'selected': '',
                click: this.indicatorClick.bind(this),
                data: { index: i }
            }));
        }

        this.$indicator.append(list);
        this.$modal.append(this.$indicator);
    };

    ImagesGridModal.prototype.prev = function() {

        var imgsLen = this.opts.images.length;

        if (this.imageIndex > 0) {
            --this.imageIndex;
        } else {
            this.imageIndex = imgsLen - 1;
        }

        this.updateImage();
    };

    ImagesGridModal.prototype.next = function() {

        var imgsLen = this.opts.images.length;

        if (this.imageIndex < imgsLen - 1) {
            ++this.imageIndex;
        } else {
            this.imageIndex = 0;
        }

        this.updateImage();
    };

    ImagesGridModal.prototype.updateImage = function() {

        var image = this.getImage(this.imageIndex);

        this.$modal.find('.modal-image img').attr({
            src: image.src,
            alt: image.alt,
            title: image.title
        });

        this.$modal.find('.modal-caption').text(
            this.getImageCaption(this.imageIndex) );

        if (this.$indicator) {
            var indicatorList = this.$indicator.find('ul');
            indicatorList.children().removeClass('selected');
            indicatorList.children().eq(this.imageIndex).addClass('selected');
        }

        this.showLoader();
    };

    ImagesGridModal.prototype.onImageClick = function(event, imageEl, image) {

        var opts = this.opts;

        if (opts.nextOnClick) {
            this.next();
        }

        opts.onModalImageClick(event, imageEl, image);
    };

    ImagesGridModal.prototype.onImageLoaded = function() {
        this.hideLoader();
    };

    ImagesGridModal.prototype.indicatorClick = function(event) {
        var index = $(event.target).data('index');
        this.imageIndex = index;
        this.updateImage();
    };

    ImagesGridModal.prototype.onKeyUp = function(event) {

        if (!this.$modal) {
            return;
        }

        switch (event.keyCode) {
            case 27: // Esc
                this.close();
                break;
            case 37: // Left arrow
                this.prev();
                break;
            case 39: // Right arrow
                this.next();
                break;
        }
    };

    ImagesGridModal.prototype.getImage = function(index) {

        var opts = this.opts,
            image = opts.images[index];

        if ($.isPlainObject(image)) {
            return image;
        } else {
            return { src: image, alt: '', title: '' }
        }
    };

    ImagesGridModal.prototype.getImageCaption = function(imgIndex) {
        var img = this.getImage(imgIndex);
        return img.caption || '';
    };

    ImagesGridModal.prototype.showLoader = function() {
        if (this.$modal) {
            this.$modal.find('.modal-image img').hide();
            this.$modal.find('.modal-loader').show();
        }
    };

    ImagesGridModal.prototype.hideLoader = function() {
        if (this.$modal) {
            this.$modal.find('.modal-image img').show();
            this.$modal.find('.modal-loader').hide();
        }
    };

})(jQuery);
