function Node(id, name, type) {
    if (typeof(name)==='undefined') type = id;
    if (typeof(type)==='undefined') type = 'analysis';
    this.id   = id;
    this.name = name; 
    this.type = type;
}

function Edge(id, name, row, col) {
    this.id = id;
    this.name = name;
    this.row = row;
    this.col = col;
    this.iotype = row<col?"in":"out";
}

function Cell(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width  = width;
    this.height = height;
}

function Graph(mdo) {
    this.nodes = [new Node("__U__", "__U__", "user")];
    this.edges = [];
    this.chains = [];
    
    _.each(mdo.nodes, function(item) {
        this.nodes.push(new Node(item.id, item.name, item.type));
    }, this);

    _.each(mdo.edges, function(item){
        var ids=_.map(this.nodes, function(elt) {return elt.id;});
        var idA = _.indexOf(ids, item.from);
        var idB = _.indexOf(ids, item.to);
        console.log("Edge "+item.from+"-"+item.to, item.name, idA, idB);
        this.edges.push(new Edge(item.from+"-"+item.to, item.name, idA, idB));
    }, this);  
    
    _.each(mdo.chains, function(chain, i) {
        if (chain.length < 2) {
            console.log("Bad process chain ("+chain.length+"elt)");
        } else {  
            this.chains.push([]);
            _.each(chain, function(item, j) {
                if (j!==0) {
                    var ids=_.map(this.nodes, function(elt) {return elt.id;});
                    var idA = _.indexOf(ids, chain[j-1]);
                    var idB = _.indexOf(ids, chain[j]);
                    this.chains[i].push([idA, idB]);
                }
            }, this);
        }
    }, this);
}

d3.json("xdsm.json", function(error, mdo) {
    if (error) throw error;
    var graph = new Graph(mdo);
    console.log(graph);
    xdsm(graph);
});

function xdsm(graph) {
    var WIDTH = 1000;
    var HEIGHT = 500;
    var X_ORIG = 0;
    var Y_ORIG = 0;
    var PADDING = 20;
    var CELL_W = 150;
    var CELL_H = 75;
    var svg = d3.select(".xdsm").append("svg")
                .attr("width", WIDTH)
                .attr("height", HEIGHT)
                .attr("id", "main");
    var grid  = [];
    
    // kind: node || edge
    function createTextGroup(kind) {
        return svg.selectAll("."+kind)
                        .data(graph[kind+"s"])
                      .enter().append("g")
                        .attr("class", function (d, i) { 
                            var klass = kind==="node"?d.type:"dataInter";
                            return kind+" "+klass; })
                        .each(function(d, i) {
                            var that = d3.select(this);
                            if (d.name[0]==='_' && d.name[d.name.length-1]==='_') {
                                that.append("text")
                                   .text(function(d) { return d.name.substr(1, d.name.length-1); });
                            } else {
                                that.append("foreignObject")
                                   .text(function(d) { return "$"+d.name+"$"; });
                            }
                        });
    }
    
    var edges = createTextGroup("edge");
    var nodes = createTextGroup("node");
    
    MathJax.Hub.Register.StartupHook("End Typeset", function () { 
             
        // Workflow       
        svg.selectAll(".workflow")
            .data(graph.chains)
          .enter().insert("g", ":first-child")
            .attr("class", "workflow")
            .selectAll("polyline")
            .data(function (d) { return d; })
          .enter().insert("polyline", ":first-child")
            .attr("points", function (d, i) {
                var i1 = d[0]<d[1]?d[1]:d[0];
                var i2 = d[0]<d[1]?d[0]:d[1];                   
                var w = CELL_W*(i1-i2);
                var h = CELL_H*(i1-i2);                      
                if (d[0]<d[1]) {
                    var p1 = (-w)+",0";     
                    var p3 = "0,"+h;     
                } else {
                    var p3 = w+",0";     
                    var p1 = "0,"+(-h);     
                }
                var p2 = "0,0";
                return [p1, p2, p3].join(" ");
        })   
        .attr("transform", function(d) { 
                     var i1 = d[0]<d[1]?d[1]:d[0];
                     var i2 = d[0]<d[1]?d[0]:d[1];                   
                     if (d[0]<d[1]) {
                        var w = CELL_W*i1+X_ORIG;
                        var h = CELL_H*i2+Y_ORIG;
                     } else {
                        var w = CELL_W*i2+X_ORIG;
                        var h = CELL_H*i1+Y_ORIG;   
                     } 
                     return "translate("+ (X_ORIG+w) +"," + (Y_ORIG+h) + ")";
         });            
                    
                    
        function layoutText(items) {
            items.each(function(d, i) {
                var item = d3.select(this);
                if (grid[i]===undefined) {
                    grid[i] = new Array(items.length);
                }
                item.select("foreignObject svg")
                    .each(function(d, j) {
                        var that = d3.select(this);
                        var data = item.data()[0];
                        var m = (data.row===undefined)?i:data.row;
                        var n = (data.col===undefined)?i:data.col;
                        grid[m][n] = new Cell(-that[0][j].width.baseVal.value/2, -that[0][j].height.baseVal.value/2, 
                                               that[0][j].width.baseVal.value, that[0][j].height.baseVal.value);
                        
                        var foreign = item.select("foreignObject");
                        foreign.attr("x", function () { return grid[m][n].x; })
                               .attr("y", function () { return grid[m][n].y; })
                               .attr("width", function () { return grid[m][n].width; })
                               .attr("height", function () { return grid[m][n].height; });
                    });
                    
                item.select("text")
                    .each(function(d, j)  {
                        var that = d3.select(this);
                        var data = item.data()[0];
                        var m = (data.row===undefined)?i:data.row;
                        var n = (data.col===undefined)?i:data.col;
                        grid[m][n] = new Cell(-that[0][j].getBBox().width/2, that[0][j].getBBox().height/3, 
                                               that[0][j].getBBox().width, that[0][j].getBBox().height);
                        that.attr("x", function () { return grid[m][n].x; })
                            .attr("y", function () { return grid[m][n].y; })
                            .attr("width", function () { return grid[m][n].width; })
                            .attr("height", function () { return grid[m][n].height; });
                    });
            }); 
            
            items.attr("transform", function(d, i) { 
                                var m = (d.col===undefined)?i:d.col;
                                var n = (d.row===undefined)?i:d.row;
                                var w = CELL_W*m+X_ORIG;
                                var h = CELL_H*n+Y_ORIG; 
                                return "translate("+ (X_ORIG+w) +"," + (Y_ORIG+h) + ")";
                           });
        }            
             
        // layout text
        layoutText(nodes);
        layoutText(edges);
                
        // rectangles for nodes
        var rects = nodes.insert("rect", ":first-child")
            .attr("x", function (d, i) {return grid[i][i].x - PADDING;})
            .attr("y", function (d, i) {return -Math.abs(grid[i][i].y) - PADDING;})
            .attr("width", function (d, i) {return grid[i][i].width + (PADDING*2);})
            .attr("height", function (d, i) {return grid[i][i].height + (PADDING*2);})
            .attr("rx", function (d, i) { 
                var rounded = d.type==='optimization' || d.type==='mda' || d.type==='doe';
                return rounded?(grid[i][i].height + (PADDING*2))/2:0;})
            .attr("ry", function (d, i) { 
                var rounded = d.type==='optimization' || d.type==='mda' || d.type==='doe';                
                return rounded?(grid[i][i].height + (PADDING*2))/2:0;});
        
        // trapezium for edges
        var trapz = edges.insert("polygon", ":first-child")
            .attr("points", function (d, i) {
               var pad = 10;
               var w = grid[d.row][d.col].width;
               var h = grid[d.row][d.col].height;
               var topleft = (-2*pad+5-w/2)+", "+(-h);
               var topright = (5+w/2+pad)+", "+(-h);
               var botright = (w/2+pad)+", "+(pad+h/2);
               var botleft = (-2*pad-w/2)+", "+(pad+h/2);
               var tpz = [topleft, topright, botright, botleft].join(" ");
               return tpz;
            });
                            
        
        // Dataflow
        var dataflow = svg.insert("g", ":first-child")
            .attr("class", "dataflow");
            
        edges.each(function (d, i) {
            dataflow.insert("polyline", ":first-child")
                .attr("points", function () {
                    console.log(d);
                    var i1 = (d.iotype === "in")?d.col:d.row;
                    var i2 = (d.iotype === "in")?d.row:d.col;                    
                    var w = CELL_W*(i1-i2);
                    var h = CELL_H*(i1-i2);                      
                    if (d.iotype === "in") {
                        var p1 = (-w)+",0";     
                        var p3 = "0,"+h;     
                    } else {
                        var p3 = w+",0";     
                        var p1 = "0,"+(-h);     
                    }
                    var p2 = "0,0";
                    return [p1, p2, p3].join(" ");
                })
                .attr("transform", function() { 
                                var m = (d.col===undefined)?i:d.col;
                                var n = (d.row===undefined)?i:d.row;
                                console.log(d, m, n);
                                var w = CELL_W*m+X_ORIG;
                                var h = CELL_H*n+Y_ORIG; 
                                console.log(w, h);
                                return "translate("+ (X_ORIG+w) +"," + (Y_ORIG+h) + ")";
                           });
           });
    
        // set svg size
        var w = CELL_W*(graph.nodes.length+1)+X_ORIG; 
        var h = CELL_H*(graph.nodes.length+1)+Y_ORIG; 
        svg.attr("width", w).attr("height", h);
    
            
    });  // Startup Hook
}
