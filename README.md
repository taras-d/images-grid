# photo-grid
Display first 5 photos in grid view.<br>
Rest of photos can be view in modal box.
```
 _____________________________
|         |         |         |
| photo 1 | photo 2 | photo 3 |
|_________|_________|_________|
|              |              |
|    photo 4   |    photo 5   |
|______________|______________|

```
```javascript
new PhotoGrid({
  images: ['img1.png', ... , 'imgN.png'],
  element: $('#photos'),
  autoRender: true,
  aling: true // align different-size images
});
```
