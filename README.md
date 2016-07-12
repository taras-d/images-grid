# images-grid
Display first 6 images in grid view.<br>
Rest of images can be viewed in modal box.
#### Usage
```javascript
$('#images').imagesGrid({
  images: ['img1.png', ... , 'imgN.png']
});
```
#### Options
```javascript
images: [],                       // images urls
cells: 5,                         // max grid cells (1-6)
aling: false,                     // align diff-size images
getViewAllText: function() {...}  // returns text for "view all images" link
```
