import grafhelpers from '../middleware/helperFunctions';

class helperAlgs {

    bfs(selectedNodes, links) {
        var data = grafhelpers.convertGrafData(links);
        var queue = new Array();
        var visited = new Map();
        var start = {node: selectedNodes[0].index, path:[{id: selectedNodes[0].index}]};
        queue.push(start);

        while(queue.length > 0) {
            var state = queue.shift();

            if (!(visited.has(state.node))) {
                var fringe = data[state.node];
                fringe.forEach(fNode => {
                    if (!(visited.has(fNode))) {
                        var next_path = JSON.parse(JSON.stringify(state.path));
                        next_path.push({id: fNode});
                        queue.push({node: fNode, path: next_path});
                    }
                });
                visited.set(state.node, state.path);
            }
        }

        return visited;
    }

    djikstra(selectedNodes, links) {
        var data = grafhelpers.convertGrafData(links);
        var queue = new Array();
        var visited = [];
        var start = {node: selectedNodes[0].index, path:[{id: selectedNodes[0].index}]};

        queue.push(start);

        while(queue.length > 0) {
            var state = queue.shift();

            if(state.node == selectedNodes[1].index) {
                return state.path;
            }

            else if (!(visited.includes(state.node))) {
                var fringe = data[state.node];
                fringe.forEach(fNode => {
                    if (!(visited.includes(fNode))) {
                        var next_path = JSON.parse(JSON.stringify(state.path));
                        next_path.push({id: fNode});
                        queue.push({node: fNode, path: next_path});
                    }
                });
                visited.push(state.node);
            }
        }
    }

    maxFlow(selectedNodes, links) {
        console.log("***** IN maxFlow *****");
        console.log("Starting node is " + selectedNodes[0].index);

        // ***** MODIFIED "convertGrafData" CODE *****
        var data = {};
        var flow_graph = {};
        var maxf = 0;
        for(let edge in links) {
            var lNode = links[edge].sid; // source node id
            var rNode = links[edge].tid; // target node id
            
            // TODO: Error checking to ensure links[edge].name is a POSITIVE INTEGER
            var weight = links[edge].name;
            var weight_first;
            var weight_second;

            if(links[edge].type === "Directed") {
                weight_first = parseInt(weight);
            } else {
                if (weight.indexOf("/") === -1) {
                    console.log("Undirected and bidirected edges must have \"/\" in their weight!");
                    return -1;
                }

                weight_first = parseInt(weight.slice(0, weight.indexOf("/")));
                weight_second = parseInt(weight.slice(weight.indexOf("/") + 1));
            }

            if (weight_first < 1 || isNaN(weight_first)) {
                // ERROR!
                console.log("First weight value is invalid!");
                return -1;
            }

            if(lNode in data) {
                data[lNode][rNode] = weight_first;

                flow_graph[lNode][rNode] = 0;
            } else {
                data[lNode] = {};
                data[lNode][rNode] = weight_first;

                flow_graph[lNode] = {};
                flow_graph[lNode][rNode] = 0;
            }

            if(links[edge].type === "Directed") {
                if(!(rNode in data)) {
                    data[rNode] = {};

                    flow_graph[rNode] = {};
                }
            } else {
                // TREAT UNDIRECTED AND BIDIRECTED EDGES THE SAME WAY
                
                // if there is a bidirected or undirected edge ...
                // from A to B with weight_first w, then there is a directed edge ...
                // from A to B with weight_first w AND a directed edge ...
                // from B to A with weight_first w.

                if (weight_second < 1 || isNaN(weight_second)) {
                    // ERROR!
                    console.log("Second weight value is invalid!");
                    return -1;
                }

                if(rNode in data) {
                    data[rNode][lNode] = weight_second;

                    flow_graph[rNode][lNode] = 0;
                } else {
                    data[rNode] = {};
                    data[rNode][lNode] = weight_second;

                    flow_graph[rNode] = {};
                    flow_graph[rNode][lNode] = 0;
                }
            }
        }
        console.log("Graph data structure is...");
        console.log(JSON.parse(JSON.stringify(data)));

        var path = grafhelpers.BFS_maxFlow(selectedNodes, data);
        var residual = data;

        while(path.length > 0) {
            var bottleneck = Infinity;
            var node1;
            var node2;
            for(let n = 0; n < path.length - 1; n++) {
                node1 = path[n];
                node2 = path[n + 1];
                if(residual[node1][node2] < bottleneck) {
                    bottleneck = residual[node1][node2];
                }
            }
            maxf += bottleneck;
            for(let n = 0; n < path.length - 1; n++) {
                node1 = path[n];
                node2 = path[n + 1];
                residual[node1][node2] -= bottleneck;
                flow_graph[node1][node2] += bottleneck;
                if(residual[node1][node2] === 0) {
                    delete residual[node1][node2];
                }
                if(node2 in residual) {
                    if(node1 in residual[node2]) {
                        residual[node2][node1] += bottleneck;
                    }
                    else {
                        residual[node2][node1] = bottleneck;
                    }
                }
                else {
                    residual[node2] = {};
                    residual[node2][node1] = bottleneck;
                }
            }
            console.log("Residual graph is now...");
            console.log(JSON.parse(JSON.stringify(residual)));
            path = grafhelpers.BFS_maxFlow(selectedNodes, data);
        }

        console.log("Final graph is...");
        console.log(data);

        return [flow_graph, maxf]; // return multiple values as an array
    }
}

export default new helperAlgs();
