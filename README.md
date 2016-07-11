# images-grid
Display first 5 images in grid view.<br>
Rest of images can be view in modal box.
```
 _____________________________
|         |         |         |
| image 1 | image 2 | image 3 |
|_________|_________|_________|
|              |              |
|    image 4   |    image 5   |
|______________|______________|

```
Usage
```javascript
$('#images').imagesGrid({
  images: ['img1.png', ... , 'imgN.png']
});
```
Options
```javascript
images: [],                      // array of images urls
aling: false,                    // align diff-size images
getSeeAllText: function() {...}  // returns "See all N images" text if images more than five 
```
