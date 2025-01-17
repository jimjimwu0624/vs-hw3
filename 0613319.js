(function (d3) {
    'use strict';
    const drag = simulation => {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
        }

        function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    };

    var highlightLink = [];
    var allLinkID = {};

    const renderFDG = (nodes, links, max) => {
        const svg = d3.select('#svg1');
        const width = +svg.attr('width');
        const height = +svg.attr('height');
        const g = svg.append('g');

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));
        svg.attr("viewBox", [200, 200, width, height]);

      //link
        const link = g.attr("stroke", "#999")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#bfbfbf")
        .attr("stroke-width", d => Math.sqrt(d.value))
        .attr("id", d => "L" + d.source.id + "x" +d.target.id)
        .style("opacity", 0.3);


        const classColor = {"1": "#69647b","2": "#e2cdbc","3": "#a56c41","4": "#2d241f","5": "#7b8b6f"};

      //node
        const node = svg.append("g")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .style("fill", function(d) { return classColor[d.group];})
        .call(drag(simulation))

        .on("click", datum => {
            var id = datum.path[0].childNodes[0].__data__.id;
            d3.selectAll("rect")
            .style("stroke-width", "1px")
            .style("stroke", "#bfbfbf");
            highlightLink.forEach((d) => {
                d3.select(d)
                .attr("stroke-width", 1)
                .attr("stroke", "#999");
            });
            highlightLink.length = 0;
            for(var i=1;i<=max;i++) {
            d3.select("#g"+i+"x"+id).style("stroke-width", "3px").style("stroke", "#965454");
            d3.select("#g"+id+"x"+i).style("stroke-width", "3px").style("stroke", "#965454");
            }
            d3.select("#t1")
            .attr("fill", "#656565")
            .attr("font-size",25)
            .text("Selected node:" + id + ", row and column has been highlighted.");
            
                });


        d3.select('svg').call(
            d3.zoom()
            .extent([[0, 0],[450, 600],])
            .scaleExtent([1, 8])
            .on('zoom', zoomFunct));

        function zoomFunct({ transform }) {
            link.attr('transform', transform);
            node.attr('transform', transform);
        }


        node.append("title")
        .text(d => d.id);

        simulation.on("tick", () => {
            link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        });

        return svg.node();
    };


    const renderAD = (matrix, nodes) => {
        const margin = { top: 10, right: 40, bottom: 50, left: 10};
        const size = 7;
        var svg2=d3.select("#ad").append("svg")
        .attr("width", 3000)
        .attr("height", 3000)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

        svg2.append('text')
        .attr('id', 't1')
        .attr('y', +40)
        .attr('x', +50)
        .attr("fill", "#656565")
        .attr("font-size",20)
        .text('Node-link Diagrams vs. Adjacency Matrix');

        matrix.forEach((m,i) => {
        svg2.append("g")
        .attr("transform","translate(50,50)")
        .attr("id","row"+(i+1))
        .selectAll("rect")
        .data(m)
        .enter()
        .append("rect")
        .attr("class","grid")
        .attr("width",size)
        .attr("height",size)
        .attr("x", d=> d.x*size)
        .attr("y", d=> d.y*size)
        .attr("id", d=> "g" + (d.x+1)+"x"+(d.y+1))
        .style("fill-opacity", d=> d.weight * 1)

        .on("click", datum => {
            d3.selectAll("rect").style("stroke-width", "1px").style("stroke", "#bfbfbf");
            highlightLink.forEach((d) => {
                d3.select(d).attr("stroke-width", 1).attr("stroke", "#999");
            });
            highlightLink.length = 0;
            d3.select("#"+datum.path[0].id).style("stroke-width", "3px").style("stroke", "#965454");
            if(datum.path[0].style['fillOpacity'] == "0"){
                var tmp = datum.path[0].id.replace('g', '');
                tmp = tmp.split('x');
                d3.select("#t1").text("There is no link between node " + tmp[0] + " and node " + tmp[1]);
            }
            else {
                var tmp = datum.path[0].id.replace('g', '');
                tmp = tmp.split('x');
                if(allLinkID[datum.path[0].id.replace('g', 'L')]){
                    d3.select("#t1")
                    .attr("fill", "#656565")
                    .attr("font-size",20)
                    .text("The link between node " + tmp[0] + " and node " + tmp[1] + " has been highlighted.");
                    d3.select("#"+datum.path[0].id.replace('g', 'L')).attr("stroke-width", 3).attr("stroke", "#965454");
                    highlightLink.push("#"+datum.path[0].id.replace('g', 'L'));
                }
                else {
                    d3.select("#t1")
                    .attr("fill", "#656565")
                    .attr("font-size",20)
                    .text("The link between node " + tmp[0] + " and node " + tmp[1] + " has been highlighted.");
                    d3.select("#L"+tmp[1]+"x"+tmp[0]).attr("stroke-width", 3).attr("stroke", "#965454");
                    highlightLink.push("#L"+tmp[1]+"x"+tmp[0]);
                }
            }
            });
        });  

        const classColor = {"1": "#69647b","2": "#e2cdbc","3": "#a56c41","4": "#2d241f","5": "#7b8b6f"};

        svg2
        .append("g")
        .attr("transform","translate(50,47)")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("x", (d,i) => i * size + size/2)
        .text(d => d.id)
        .style("text-anchor","middle")
        .style("font-size","5px")
        .style("fill", function(d) { return classColor[d.group];});

        svg2
        .append("g").attr("transform","translate(45,52.5)")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("y",(d,i) => i * size + size/2)
        .text(d => d.id)
        .style("text-anchor","middle")
        .style("font-size","5px")
        .style("fill", function(d) { return classColor[d.group];});
    };

    // Read Dataset
    d3.csv('infect-dublin.edges').then( data => {
        var max = 0;
        var min = 9999;
        var links = [];
        var countLinks = [];
        for (var i = 0; i <= 1000; i++) {
            countLinks.push(0);
        }
        var key = Object.keys(data[0])[0];
        links.push({source: key.split(' ')[0], target: key.split(' ')[1], value : 1});
        allLinkID["L"+key.split(' ')[0]+"x"+key.split(' ')[1]] = 1;
        data.forEach((d) => {
            key = Object.keys(d);
            var tmp = d[Object.keys(d)].split(' ');
            delete d[Object.keys(d)];
            d.source = tmp[0];
            d.target = tmp[1];
            d.value = 1;
            if(parseInt(tmp[0], 10) > max) max = d.source;
            if(parseInt(tmp[1], 10) > max) max = d.target;
            if(parseInt(tmp[0], 10) < min) min = d.source;
            if(parseInt(tmp[1], 10) < min) min = d.target;
            links.push(d);
            allLinkID["L"+d.source+"x"+d.target] = 1;
            countLinks[parseInt(tmp[0], 10)] += 1;
            countLinks[parseInt(tmp[1], 10)] += 1;
        });
        var nodes = [];
        for (var i = min; i <= max; i++) {
        nodes.push({
        id: String(i),
        group: Math.ceil(countLinks[i]/10)
                });
        }
        var edgeHash = {};
        links.forEach((d) => {
            var id = d.source + "-" + d.target;
            edgeHash[id] = 1;
            var id = d.target + "-" + d.source;
            edgeHash[id] = 1;
        });

        var matrix = [];
        for(var y=min; y<=max; y++) {
            var row = [];
            for(var x=min; x<=max; x++) {
                var grid = {x: x-1, y: y-1, weight: 0};
                if(edgeHash[y + "-" + x]){
                    grid.weight = 1;
                }
            row.push(grid);
            }
        matrix.push(row);
        }
        renderFDG(nodes, links, max);
        renderAD(matrix, nodes);
    });

}(d3));