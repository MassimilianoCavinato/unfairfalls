var fs =  require('file-system');
var map = require('./finalmap');

function convertMap(map){

    let result = {
      Ground: [],
      Water: []
    };

    let ground;
    let water;

    map.layers.forEach(function(l){
      if(l.name==='Ground'){
        l.objects.map(g1 => {
          let shape = {shape:[]};
          g1.polygon.forEach(function(g2){
            shape.shape.push(g2.x+g1.x);
            shape.shape.push(g2.y+g1.y);
          })
          result.Ground.push(shape)
        });
      }
      if(l.name==='Water'){
        l.objects.map(w1 => {
          result.Water.push([w1.x, w1.y, w1.width, w1.height]);
        });
      }
    });

    result = JSON.stringify(result);
    fs.writeFile('./../assets/physicsData/map.json', result, function(err) {
      console.log(err || "All good, output saved to map.json");
    });
}

convertMap(map);
