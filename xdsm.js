/*
 * XDSMjs
 * Copyright 2016 Rémi Lafage
 */

const WIDTH = 1000;
const HEIGHT = 500;
const X_ORIG = 50;
const Y_ORIG = 20;
const PADDING = 20;
const CELL_W = 200;
const CELL_H = 75;
const UID = "_U_";
const PLAINTEXT_SEP = "_";
const MULTI_TYPE = "_multi";
const MULTI_OFFSET = 3;

function Node(id, name, type) {
    if (typeof(name)==='undefined') type = id;
    if (typeof(type)==='undefined') type = 'analysis';
    this.id   = id;
    this.name = name; 
    this.isMulti = (type.search(/_multi$/)>=0);
    this.type = this.isMulti?type.substr(0,type.length-MULTI_TYPE.length):type;
}

function Edge(from, to, name, row, col, isMulti) {
    this.id = from+"-"+to;
    this.name = name;
    this.row = row;
    this.col = col;
    this.iotype = row<col?"in":"out";
    this.io = {from_u: (from==UID), to_u: (to==UID)};
    this.isMulti = isMulti;
}
Edge.prototype.isIO = function() {return this.io.from_u || this.io.to_u;};

function Cell(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width  = width;
    this.height = height;
}

function Graph(mdo) {
    this.nodes = [new Node(UID, UID, "user")];
    this.edges = [];
    this.chains = [];
    
    mdo.nodes.forEach(function(item) {
        this.nodes.push(new Node(item.id, item.name, item.type));
    }, this);

    mdo.edges.forEach(function(item){
        var ids = this.nodes.map(function(elt) {return elt.id;});
        var idA = ids.indexOf(item.from);
        var idB = ids.indexOf(item.to);
        //console.log("Edge "+item.from+"-"+item.to, item.name, idA, idB);
        //console.log(item.from, item.to, this.nodes[idB]);
        var isMulti = this.nodes[idA].isMulti || this.nodes[idB].isMulti; 
        this.edges.push(new Edge(item.from, item.to, item.name, idA, idB, isMulti));
    }, this);  
    
    mdo.chains.forEach(function(chain, i) {
        if (chain.length < 2) {
            console.log("Bad process chain ("+chain.length+"elt)");
        } else {  
            this.chains.push([]);
            chain.forEach(function(item, j) {
                if (j!==0) {
                    var ids = this.nodes.map(function(elt) {return elt.id;});
                    var idA = ids.indexOf(chain[j-1]);
                    var idB = ids.indexOf(chain[j]);
                    this.chains[i].push([idA, idB]);
                }
            }, this);
        }
    }, this);
}

d3.json("xdsm.json", function(error, mdo) {
    if (error) throw error;
    var graph = new Graph(mdo);
    //console.log(graph);
    xdsm(graph);
});

function xdsm(graph) {
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
                            if (klass==="dataInter" && d.isIO()) { klass = "dataIO";}
                            return kind+" "+klass; })
                        .each(function(d, i) {
                            var that = d3.select(this);
                            if (d.name[0] === PLAINTEXT_SEP && d.name[d.name.length-1] === PLAINTEXT_SEP) {
                                that.append("text")
                                   .text(function(d) { return d.name.substr(1, d.name.length-2); })
                                   .attr("class", "plaintext");
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
                var points = [];              
                if (d[0]<d[1]) {
                    if (d[0]!=0) { points.push((-w)+",0"); }
                    points.push("0,0");  
                    if (d[1]!=0) { points.push("0,"+h); }     
                } else {
                    if (d[0]!=0) { points.push(w+",0"); }     
                    points.push("0,0");  
                    if (d[1]!=0) { points.push("0,"+(-h)); }     
                }
                return points.join(" ");
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
                               .attr("height", function () { return grid[m][n].height+5; });  // +5 adjustment for Firefox
                    });
                    
                item.select(".plaintext")
                    .each(function(d, j)  {
                        var that = d3.select(this);
                        var data = item.data()[0];
                        var m = (data.row===undefined)?i:data.row;
                        var n = (data.col===undefined)?i:data.col;
                        //console.log(that);
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
        function customRect(node, d, i, offset){
            node.insert("rect", ":first-child").attr("x", function () {return grid[i][i].x+offset - PADDING;})
            .attr("y", function () {return -Math.abs(grid[i][i].y) - PADDING - offset;})
            .attr("width", function () {return grid[i][i].width + (PADDING*2);})
            .attr("height", function () {return grid[i][i].height + (PADDING*2);})
            .attr("rx", function () { 
                var rounded = d.type==='optimization' || d.type==='mda' || d.type==='doe';
                return rounded?(grid[i][i].height + (PADDING*2))/2:0;})
            .attr("ry", function () { 
                var rounded = d.type==='optimization' || d.type==='mda' || d.type==='doe';                
                return rounded?(grid[i][i].height + (PADDING*2))/2:0;});
        }
        nodes.each(function (d, i) {
            that = d3.select(this);
            that.call(customRect, d, i, 0);
            if (d.isMulti) {
                that.call(customRect, d, i, 1*MULTI_OFFSET);
                that.call(customRect, d, i, 2*MULTI_OFFSET);
            }
        });
            
        // trapezium for edges
        function customTrapz(edge, d, i, offset) {
            edge.insert("polygon", ":first-child")
            .attr("points", function (d, i) {
               var pad = 10;
               var w = grid[d.row][d.col].width;
               var h = grid[d.row][d.col].height;
               var topleft = (-2*pad+5-w/2+offset)+", "+(-h-offset);
               var topright = (5+w/2+pad+offset)+", "+(-h-offset);
               var botright = (w/2+pad+offset)+", "+(pad+h/2-offset);
               var botleft = (-2*pad-w/2+offset)+", "+(pad+h/2-offset);
               var tpz = [topleft, topright, botright, botleft].join(" ");
               return tpz; });
        }
        edges.each(function (d, i) {
            that = d3.select(this);
            that.call(customTrapz, d, i, 0);
            if (d.isMulti) {
                that.call(customTrapz, d, i, 1*MULTI_OFFSET);
                that.call(customTrapz, d, i, 2*MULTI_OFFSET);
            }
        });
        
        // Dataflow
        var dataflow = svg.insert("g", ":first-child")
            .attr("class", "dataflow");
            
        edges.each(function (d, i) {
            dataflow.insert("polyline", ":first-child")
                .attr("points", function () {
                    //console.log(d);
                    var i1 = (d.iotype === "in")?d.col:d.row;
                    var i2 = (d.iotype === "in")?d.row:d.col;                    
                    var w = CELL_W*(i1-i2);
                    var h = CELL_H*(i1-i2);
                    points = [];                      
                    if (d.iotype === "in") {
                        if (!d.io.from_u) { points.push((-w)+",0"); }    
                        points.push("0,0");
                        if (!d.io.to_u) { points.push("0,"+h); }
                    } else {
                        if (!d.io.from_u) { points.push(w+",0"); }
                        points.push("0,0"); 
                        if (!d.io.to_u) { points.push("0,"+(-h)); }     
                    }
                    return points.join(" ");
                })
                .attr("transform", function() { 
                                var m = (d.col===undefined)?i:d.col;
                                var n = (d.row===undefined)?i:d.row;
                                var w = CELL_W*m+X_ORIG;
                                var h = CELL_H*n+Y_ORIG; 
                                return "translate("+ (X_ORIG+w) +"," + (Y_ORIG+h) + ")";
                           });
           });
    
        // set svg size
        var w = CELL_W*(graph.nodes.length+1)+X_ORIG; 
        var h = CELL_H*(graph.nodes.length+1)+Y_ORIG; 
        svg.attr("width", w).attr("height", h);
    
            
    });  // Startup Hook
}
