# images-grid

Images grid jQuery plugin

[Demo](https://taras-d.github.io/images-grid)

## Usage
Add Images grid plugin to html page
```html
<script src="src/images-grid.js"></script>
<link rel="stylesheet" href="src/images-grid.css">
```
Init Images grid
```html
<div id="imgs"></div>
<script>
  $('#imgs').imagesGrid({
    images: ['img1.png', ... , 'imgN.png']
  });
</script>
```

## Options

##### **`images {array}`**
Array of images. Array element can be string or object
```javascript
images: [
  'hello.png',
  'preview.jpg',
  {
    src: 'car.png',      // url
    alt: 'Car',          // alternative text
    title: 'Car',        // title
    caption: 'Supercar'  // modal caption
  }
]
```

##### **`cells {number}`**
Maximum number of cells (min: 1, max: 6, default: 5)
```javascript
cells: 5
```

##### **`align {boolean}`**
Align images with different height (default: false)
```javascript
align: false
```

##### **`nextOnClick {boolean}`**
Show next image when click on modal image (default: true)
```javascript
nextOnClick: true
```

##### **`showViewAll {string|boolean}`**
Show view all text (default: 'more')
```javascript
// Possible values:
showViewAll: 'more'   // show if number of images greater than number of cells
             'always' // always show
             false    // never show
```

##### **`getViewAllText {function}`**
Callback function returns text for "view all images" link
```javascript
getViewAllText: function(imagesCount) {
  return 'View all ' + imagesCount + ' images';
}
```

#### Grid Events:

##### **`onGridRendered {function}`**
Callback function fired when grid items added to the DOM
```javascript
onGridRendered: function($grid) { }
```

##### **`onGridItemRendered {function}`**
Callback function fired when grid item added to the DOM
```javascript
onGridItemRendered: function($item, image) { }
```

##### **`onGridLoaded {function}`**
Callback function fired when grid images loaded
```javascript
onGridLoaded: function($grid) { }
```

##### **`onGridImageLoaded {function}`**
Callback function fired when grid image loaded
```javascript
onGridImageLoaded: function(event, $img, image) { }

```

#### Modal Events:

##### **`onModalOpen {function}`**
Callback function called when modal opened
```javascript
onModalOpen: function($modal) { }
```

##### **`onModalClose {function}`**
Callback function called when modal closed
```javascript
onModalClose: function() { }
```

##### **`onModalImageClick {function}`**
Callback function called on modal image click
```javascript
onModalImageClick: function(event, $img, image) { }
```

## Methods:

##### **modal.open**
Open modal window (optional second parameter is image index)
```javascript
$('#imgs').imagesGrid('modal.open', 0)
```

##### **modal.close**
Close modal window
```javascript
$('#imgs').imagesGrid('modal.close')
```

##### **destroy**
Destroy images grid (remove DOM nodes and event listeners)
```javascript
$('#imgs').imagesGrid('destroy')
```

## Default options
Default options can be found [here](https://github.com/taras-d/images-grid/blob/master/src/images-grid.js#L49-L69)
