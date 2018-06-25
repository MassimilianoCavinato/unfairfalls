var fs =  require('file-system');
var map = require('./finalmap');

function convertMap(map){
    let result = {
      Ground: null,
      Water: null
    };

    map.layers.forEach(function(l){
      if(l.name==='Ground'){
        let Ground = [];
        l.objects.map(g1 => {
          offset = {x: g1.x, y: g1.y}
          let polyTriangles = triangulatePoly(g1.polygon, offset);
          Ground.push.apply(Ground, polyTriangles);
        });
        result.Ground = Ground;
      }
      if(l.name==='Water'){
        let Water = [];
        l.objects.map(w1 => {
          Water.push([w1.x, w1.y, w1.width, w1.height]);
        });
        result.Water = Water;
      }
    });

    result = JSON.stringify(result);
    console.log(result);
    fs.writeFile('./../assets/physicsData/map.json', result, function(err) {
      console.log(err || "All good, output saved to map.json");
    });
}

convertMap(map);

function triangulatePoly(poly, offset){
  let triangles = [];
  if(poly.length === 3){
      let triangle = poly.map((p) => [p.x+offset.x, p.y+offset.y]);
      triangle = sortTriangle(triangle);
      let shape_obj = {shape: [
          triangle[0][0], triangle[0][1],
          triangle[1][0], triangle[1][1],
          triangle[2][0], triangle[2][1],
      ]};
      triangles.push(shape_obj);
  }
  else{
      let c = getCenter(poly, offset);
      poly.map((p, i) => {
          let current = poly[i];
          let next = poly[i+1] || poly[0];
          let triangle = [[current.x+offset.x, current.y+offset.y], [next.x+offset.x, next.y+offset.y], [c.x, c.y] ];
          triangle = sortTriangle(triangle);
          let shape_obj = {shape: [
              triangle[0][0], triangle[0][1],
              triangle[1][0], triangle[1][1],
              triangle[2][0], triangle[2][1],
          ]};
          triangles.push(shape_obj);
      });
  }
  return triangles;
}

function getCenter(poly, offset){
    let Xs = poly.map( p => p.x+offset.x);
    let Ys = poly.map( p => p.y+offset.y);
    return {
        x: ( ( Math.max(...Xs) + Math.min(...Xs) ) / 2 ) ,
        y: ( ( Math.max(...Ys) + Math.min(...Ys) ) / 2 ),
    }
}

function sortTriangle(triangle){
    let eq = (triangle[0][0]*triangle[1][1]) + (triangle[1][0]*triangle[2][1]) + (triangle[2][0]*triangle[0][1]) - (triangle[1][1]*triangle[2][0]) - (triangle[2][1]*triangle[0][0]) - (triangle[0][1]*triangle[1][0])
    return eq > 0 ? triangle : [triangle[0], triangle[2], triangle[1]];
}
//
// let result =  JSON.stringify({Ground: triangles, Water: water});
// fs.writeFile('./../assets/physicsData/map2.json', result, function(err) {
//   console.log(err || "All good, output saved to map.json");
// });
