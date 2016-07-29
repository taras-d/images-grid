
(function($) {

    // Plugin
    $.fn.imagesGrid = function(options) {

        var args = arguments;

        return this.each(function() {

            if ($.isPlainObject(options)) {
                // Create ImagesGrid
                var cfg = $.extend({}, $.fn.imagesGrid.defaults, options);
                cfg.element = $(this);
                this._imgGrid = new ImagesGrid(cfg);
                this._imgGrid.render();
                return;
            }

            if (this._imgGrid) {
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

    // Plugin default options
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

    /*
      ImagesGrid constructor
       *cfg         - Configuration object
       *cfg.element - jQuery element
       *cfg.images  - Array of images urls of images option objects
        cfg.align   - Aling diff-size images
        cfg.cells   - Max grid cells (1-6)
        cfg.getViewAllText     - Returns text for "view all images" link,
        cfg.onGridRendered     - Called when grid items added to the DOM
        cfg.onGridItemRendered - Called when grid item added to the DOM
        cfg.onGridLoaded       - Called when grid images loaded
        cfg.onGridImageLoaded  - Called when grid image loaded
    */
    function ImagesGrid(cfg) {

        cfg = cfg || {};

        this.images = cfg.images;
        this.isAlign = cfg.align;
        this.maxGridCells = (cfg.cells < 1)? 1: (cfg.cells > 6)? 6: cfg.cells;
        this.imageLoadCount = 0;
        this.modal = null;

        this.$window = $(window);
        this.$el = cfg.element;
        this.$gridItems = [];

        this.render = function() {

            this.setGridClass();
            this.renderGridItems();

            this.modal = new ImagesGridModal({
                images: cfg.images,
                nextOnClick: cfg.nextOnClick,
                onModalOpen: cfg.onModalOpen,
                onModalClose: cfg.onModalClose,
                onModalImageClick: cfg.onModalImageClick
            });

            this.$window.on('resize', this.resize.bind(this));

        };

        this.setGridClass = function() {

            this.$el.removeClass(function(index, classNames) {
                if (/(imgs-grid-\d)/.test(classNames)) {
                    return RegExp.$1;
                }
            });

            var cellsCount = (this.images.length > this.maxGridCells)?
                this.maxGridCells: this.images.length;

            this.$el.addClass('imgs-grid imgs-grid-' + cellsCount);

        };

        this.renderGridItems = function() {

            if (!this.images) {
                return;
            }

            this.$el.empty();
            this.$gridItems = [];

            for (var i = 0; i < this.images.length; ++i) {
                if (i == this.maxGridCells) {
                    break;
                }
                this.renderGridItem(this.images[i], i);
            }

            if (this.images.length > this.maxGridCells) {
                this.renderViewAll();
            }

            cfg.onGridRendered(this.$el);

        };

        this.renderGridItem = function(image, index) {

            var src = image,
                alt = '',
                title = '';

            if ($.isPlainObject(image)) {
                src = image.src;
                alt = image.alt || '';
                title = image.title || '';
            }

            var item = $('<div>', {
                class: 'imgs-grid-image',
                click: this.imageClick.bind(this),
                data: { index: index }
            });

            var self = this;

            item.append(
                $('<div>', {
                    class: 'image-wrap'
                }).append(
                    $('<img>', {
                        src: src,
                        alt: alt,
                        title: title,
                        load: function(event) {
                            self.imageLoaded(event, $(this), image);
                        }
                    })
                )
            );

            this.$gridItems.push(item);

            this.$el.append(item);

            cfg.onGridItemRendered(item, image);

        };

        this.renderViewAll = function() {

            this.$el.find('.imgs-grid-image:last .image-wrap').append(
                $('<div>', {
                    class: 'view-all'
                }).append(
                    $('<span>', {
                        class: 'view-all-cover',
                    }),
                    $('<span>', {
                        class: 'view-all-text',
                        text: cfg.getViewAllText(this.images.length)
                    })
                )
            );

        };

        this.resize = function(event) {
            if (this.isAlign) {
                this.align();
            }
        };

        this.imageClick = function(event) {
            var imageIndex = $(event.currentTarget).data('index');
            this.modal.open(imageIndex);
        };

        this.imageLoaded = function(event, imageEl, image) {

            ++this.imageLoadCount;

            if (this.imageLoadCount == this.$gridItems.length) {
                this.imageLoadCount = 0;
                this.allImagesLoaded()
            }

            cfg.onGridImageLoaded(event, imageEl, image)

        };

        this.allImagesLoaded = function() {

            if (this.isAlign) {
                this.align();
            }

            cfg.onGridLoaded(this.$el);

        };

        this.align = function() {

            var len = this.$gridItems.length;

            switch (len) {
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

        this.alignItems = function(items) {

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

    }

    /*
      ImagesGridModal constructor
       *cfg             - Configuration object
       *cfg.images      - Array of string or objects
        cfg.nextOnClick - Show next image when click on modal image
        cfg.onModalOpen       - Called when modal opened
        cfg.onModalClose      - Called when modal closed
        cfg.onModalImageClick - Called on modal image click
    */
    function ImagesGridModal(cfg) {

        this.images = cfg.images;
        this.imageIndex = null;

        this.$modal = null;
        this.$indicator = null;
        this.$document = $(document);

        this.open = function(imageIndex) {

            if (this.$modal && this.$modal.is(':visible')) {
                return;
            }

            this.imageIndex = parseInt(imageIndex) || 0;

            this.render();

        };

        this.close = function(event) {

            if (!this.$modal) {
                return;
            }

            this.$modal.animate({
                opacity: 0
            }, {
                duration: 100,
                complete: function() {

                    this.$modal.remove();
                    this.$modal = null;
                    this.$indicator = null;
                    this.imageIndex = null;

                    cfg.onModalClose();

                }.bind(this)
            });

            this.$document.off('keyup', this.keyUp);

        };

        this.render = function() {

            this.renderModal();
            this.renderCaption();
            this.renderCloseButton();
            this.renderInnerContainer();
            this.renderIndicatorContainer();

            this.keyUp = this.keyUp.bind(this);
            this.$document.on('keyup', this.keyUp);

            var self = this;

            this.$modal.animate({
                opacity: 1
            }, {
                duration: 100,
                complete: function() {
                    cfg.onModalOpen(self.$modal);
                }
            });

        };

        this.renderModal = function() {
            this.$modal = $('<div>', {
                class: 'imgs-grid-modal'
            }).appendTo('body');
        };

        this.renderCaption = function() {

            this.$caption = $('<div>', {
                class: 'modal-caption',
                text: this.getImageCaption(this.imageIndex)
            }).appendTo(this.$modal);

        };

        this.renderCloseButton = function() {
            this.$modal.append($('<div>', {
                class: 'modal-close',
                click: this.close.bind(this)
            }));
        };

        this.renderInnerContainer = function() {

            var image = this.getImage(this.imageIndex),
                self = this;

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
                            click: function(event) {
                                self.imageClick(event, $(this), image);
                            }
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

        };

        this.renderIndicatorContainer = function() {

            if (this.images.length == 1) {
                return;
            }

            this.$indicator = $('<div>', {
                class: 'modal-indicator'
            });

            var list = $('<ul>');

            for (var i = 0; i < this.images.length; ++i) {
                list.append($('<li>', {
                    class: this.imageIndex == i? 'selected': '',
                    click: this.indicatorClick.bind(this),
                    data: { index: i }
                }));
            }

            this.$indicator.append(list);

            this.$modal.append(this.$indicator);

        };

        this.prev = function() {
            if (this.imageIndex > 0) {
                --this.imageIndex;
            } else {
                this.imageIndex = this.images.length - 1;
            }
            this.updateImage();
        };

        this.next = function() {
            if (this.imageIndex < this.images.length - 1) {
                ++this.imageIndex;
            } else {
                this.imageIndex = 0;
            }
            this.updateImage();
        };

        this.updateImage = function() {

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

        };

        this.imageClick = function(event, imageEl, image) {

            if (cfg.nextOnClick) {
                this.next();
            }

            cfg.onModalImageClick(event, imageEl, image);

        };

        this.indicatorClick = function(event) {
            var index = $(event.target).data('index');
            this.imageIndex = index;
            this.updateImage();
        };

        this.keyUp = function(event) {
            if (this.$modal) {
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
            }
        };

        this.getImage = function(index) {
            var image = this.images[index];
            if ($.isPlainObject(image)) {
                return image;
            } else {
                return { src: image, alt: '', title: '' }
            }
        };

        this.getImageCaption = function(imgIndex) {
            var img = this.getImage(imgIndex);
            return img.caption || '';
        };

    }

})(jQuery);
