# images-grid

[Demo](https://taras-d.github.io/images-grid)

Images grid jQuery plugin

## Usage
Add Images grid plugin to your html page
```html
<script src="src/images-grid.js"></script>
<link rel="stylesheet" href="src/images-grid.css">
```
Create Images grid in selected element(s)
```javascript
$('#imgs').imagesGrid({
  images: ['img1.png', ... , 'imgN.png']
});
```

## Options

#####**`images {Array}`**
Array of images URLs. Array element can be string or object
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

#####**`cells {Number}`**
Max grid cells. Values from 1 to 6 (default: 5)
```javascript
cells: 5
```

#####**`align {Boolean}`**
Aling diff-size images (default: false)
```javascript
align: false
```

#####**`nextOnClick {Boolean}`**
Show next image when user click on modal image (default: true)
```javascript
nextOnClick: true
```

#####**`getViewAllText {Function}`**
Function returns text for "view all images" link
```javascript
getViewAllText: function(imagesCount) {
  return 'View all ' + imagesCount + ' images';
}
```

#### Events:

#####**`onGridRendered {Function}`**
Function called when grid items added to the DOM
```javascript
onGridRendered: function($grid) { }
```

#####**`onGridItemRendered {Function}`**
Function called when grid item added to the DOM
```javascript
onGridItemRendered: function($item, image) { }
```

#####**`onGridLoaded {Function}`**
Function called when grid images loaded
```javascript
onGridLoaded: function($grid) { }
```

#####**`onGridImageLoaded {Function}`**
Function called when grid image loaded
```javascript
onGridImageLoaded: function(event, $img, image) { }

```
#####**`onModalOpen {Function}`**
Function called when modal opened
```javascript
onModalOpen: function($modal) { }
```

#####**`onModalClose {Function}`**
Function called when modal closed
```javascript
onModalClose: function() { }
```

#####**`onModalImageClick {Function}`**
Function called on modal image click
```javascript
onModalImageClick: function(event, $img, image) { }
```

## Methods

#####**`.imagesGrid('modal.open', 0)`**
Open modal window. Second parameter is image index
```javascript
$('#imgs').imagesGrid('modal.open', 0)
```

#####**`.imagesGrid('modal.close')`**
Close modal window
```javascript
$('#imgs').imagesGrid('modal.close')
```

## Default options
Set default options for all images grid instances
```javascript
$.fn.imagesGrid.defaults.nextOnClick = false;
$.fn.imagesGrid.defaults.cells = 6;
```
