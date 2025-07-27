// Graph data structure
let nodes = []; // Array of { id: 'A', x: 100, y: 100, element: HTMLDivElement }
let edges = []; // Array of { from: 'A', to: 'B', weight: 5, element: HTMLDivElement, weightElement: HTMLDivElement }
let nextNodeId = 0;
let isAddingEdge = false;
let edgeStartNode = null;
const graphContainer = document.getElementById('graphContainer');
const startNodeSelect = document.getElementById('startNodeSelect');

// --- Helper Functions for DOM Manipulation ---
function createNodeElement(id, x, y) {
    const nodeEl = document.createElement('div');
    nodeEl.classList.add('node', 'unvisited');
    nodeEl.id = `node-${id}`;
    nodeEl.style.left = `${x}px`;
    nodeEl.style.top = `${y}px`;
    nodeEl.innerHTML = `<span>${id}</span>`;
    nodeEl.addEventListener('mousedown', startDrag); // For dragging nodes
    nodeEl.addEventListener('click', handleNodeClick); // For adding edges
    graphContainer.appendChild(nodeEl);
    return nodeEl;
}

function createEdgeElement(fromNodeEl, toNodeEl, weight) {
    const edgeEl = document.createElement('div');
    edgeEl.classList.add('edge');
    graphContainer.appendChild(edgeEl);

    const weightEl = document.createElement('div');
    weightEl.classList.add('edge-weight');
    weightEl.textContent = weight;
    graphContainer.appendChild(weightEl);

    updateEdgePosition(edgeEl, weightEl, fromNodeEl, toNodeEl);
    return { edgeEl, weightEl };
}

function updateEdgePosition(edgeEl, weightEl, fromNodeEl, toNodeEl) {
    const rect1 = fromNodeEl.getBoundingClientRect();
    const rect2 = toNodeEl.getBoundingClientRect();
    const containerRect = graphContainer.getBoundingClientRect();

    const x1 = rect1.left - containerRect.left + rect1.width / 2;
    const y1 = rect1.top - containerRect.top + rect1.height / 2;
    const x2 = rect2.left - containerRect.left + rect2.width / 2;
    const y2 = rect2.top - containerRect.top + rect2.height / 2;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    edgeEl.style.width = `${length}px`;
    edgeEl.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;

    // Position the weight roughly in the middle of the edge
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    weightEl.style.left = `${midX - weightEl.offsetWidth / 2}px`;
    weightEl.style.top = `${midY - weightEl.offsetHeight / 2}px`;
}

// --- Dragging Nodes ---
let activeNode = null;
let initialX, initialY, initialNodeX, initialNodeY;

function startDrag(e) {
    activeNode = e.target.closest('.node');
    if (!activeNode) return;

    initialX = e.clientX;
    initialY = e.clientY;
    initialNodeX = parseFloat(activeNode.style.left);
    initialNodeY = parseFloat(activeNode.style.top);

    document.addEventListener('mousemove', dragNode);
    document.addEventListener('mouseup', stopDrag);
    e.preventDefault(); // Prevent default drag behavior
}

function dragNode(e) {
    if (!activeNode) return;

    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;

    activeNode.style.left = `${initialNodeX + dx}px`;
    activeNode.style.top = `${initialNodeY + dy}px`;

    // Update connected edges
    const nodeId = activeNode.id.split('-')[1];
    edges.forEach(edge => {
        if (edge.from === nodeId || edge.to === nodeId) {
            const fromNodeEl = nodes.find(n => n.id === edge.from).element;
            const toNodeEl = nodes.find(n => n.id === edge.to).element;
            updateEdgePosition(edge.element, edge.weightElement, fromNodeEl, toNodeEl);
        }
    });
}

function stopDrag() {
    activeNode = null;
    document.removeEventListener('mousemove', dragNode);
    document.removeEventListener('mouseup', stopDrag);
}

// --- Event Handlers for Controls ---
document.getElementById('addNodeBtn').addEventListener('click', () => {
    const id = String.fromCharCode(65 + nextNodeId++); // A, B, C...
    const x = Math.random() * (graphContainer.offsetWidth - 50);
    const y = Math.random() * (graphContainer.offsetHeight - 50);
    const nodeEl = createNodeElement(id, x, y);
    nodes.push({ id, x, y, element: nodeEl });
    updateStartNodeSelect();
});

document.getElementById('addEdgeBtn').addEventListener('click', () => {
    isAddingEdge = !isAddingEdge;
    document.getElementById('addEdgeBtn').textContent = isAddingEdge ? 'Cancel Edge' : 'Add Edge';
    if (!isAddingEdge) {
        edgeStartNode = null;
    } else {
        alert('Click on the first node, then the second node to create an edge.');
    }
});

function handleNodeClick(e) {
    if (isAddingEdge) {
        const clickedNodeId = e.target.closest('.node').id.split('-')[1];
        if (!edgeStartNode) {
            edgeStartNode = clickedNodeId;
            e.target.closest('.node').style.borderColor = 'blue'; // Highlight start node
        } else if (edgeStartNode === clickedNodeId) {
            alert('Cannot create an edge to the same node.');
            e.target.closest('.node').style.borderColor = ''; // Reset highlight
            edgeStartNode = null;
        } else {
            const weight = parseInt(prompt(`Enter weight for edge from ${edgeStartNode} to ${clickedNodeId}:`), 10);
            if (isNaN(weight) || weight <= 0) {
                alert('Invalid weight. Edge not added.');
            } else {
                const fromNodeEl = nodes.find(n => n.id === edgeStartNode).element;
                const toNodeEl = nodes.find(n => n.id === clickedNodeId).element;
                const { edgeEl, weightEl } = createEdgeElement(fromNodeEl, toNodeEl, weight);
                edges.push({ from: edgeStartNode, to: clickedNodeId, weight, element: edgeEl, weightElement: weightEl });
            }
            // Reset state
            nodes.find(n => n.id === edgeStartNode).element.style.borderColor = ''; // Unhighlight
            isAddingEdge = false;
            edgeStartNode = null;
            document.getElementById('addEdgeBtn').textContent = 'Add Edge';
        }
    }
}

document.getElementById('resetBtn').addEventListener('click', () => {
    nodes = [];
    edges = [];
    nextNodeId = 0;
    isAddingEdge = false;
    edgeStartNode = null;
    graphContainer.innerHTML = ''; // Clear all nodes and edges
    updateStartNodeSelect();
    resetVisualization();
});

function updateStartNodeSelect() {
    startNodeSelect.innerHTML = '';
    nodes.forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = node.id;
        startNodeSelect.appendChild(option);
    });
}

// --- Dijkstra's Algorithm Implementation ---

async function startDijkstraVisualization() {
    resetVisualization();
    if (nodes.length === 0) {
        alert('Please add some nodes first!');
        return;
    }
    const startNodeId = startNodeSelect.value;
    if (!startNodeId) {
        alert('Please select a start node.');
        return;
    }

    const distances = {};
    const previous = {};
    const unvisited = new Set(nodes.map(n => n.id)); // Use a Set for efficient lookups/deletions
    let path = []; // To store the shortest path for visualization later

    nodes.forEach(node => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        node.element.classList.remove('visited', 'current', 'shortest-path');
        node.element.classList.add('unvisited');
    });
    edges.forEach(edge => {
        edge.element.classList.remove('shortest-path-edge');
    });

    distances[startNodeId] = 0;
    nodes.find(n => n.id === startNodeId).element.classList.add('current');
    await sleep(500); // Initial highlight

    while (unvisited.size > 0) {
        // Find the unvisited node with the smallest distance
        let minDistance = Infinity;
        let currentNodeId = null;
        for (const nodeId of unvisited) {
            if (distances[nodeId] < minDistance) {
                minDistance = distances[nodeId];
                currentNodeId = nodeId;
            }
        }

        if (currentNodeId === null) {
            break; // No reachable unvisited nodes
        }

        const currentNodeEl = nodes.find(n => n.id === currentNodeId).element;
        currentNodeEl.classList.remove('unvisited');
        currentNodeEl.classList.add('current');
        await sleep(700); // Highlight current node

        unvisited.delete(currentNodeId);
        currentNodeEl.classList.remove('current');
        currentNodeEl.classList.add('visited'); // Mark as visited

        // Explore neighbors
        const neighbors = edges.filter(edge => edge.from === currentNodeId || edge.to === currentNodeId);

        for (const edge of neighbors) {
            const neighborId = (edge.from === currentNodeId) ? edge.to : edge.from;

            if (unvisited.has(neighborId)) { // Only consider unvisited neighbors
                const altDistance = distances[currentNodeId] + edge.weight;
                if (altDistance < distances[neighborId]) {
                    distances[neighborId] = altDistance;
                    previous[neighborId] = currentNodeId;

                    // Optional: Visually indicate distance update (e.g., flash node)
                    const neighborEl = nodes.find(n => n.id === neighborId).element;
                    neighborEl.classList.add('current'); // Temporarily highlight
                    await sleep(300);
                    neighborEl.classList.remove('current');
                    neighborEl.classList.add('unvisited'); // Or keep its current state if not 'current'
                }
            }
        }
        await sleep(500); // Pause after processing current node
    }

    // After Dijkstra's: visualize the shortest path to all nodes (or a target node)
    alert('Dijkstra finished! Visualizing shortest paths...');
    visualizeShortestPaths(startNodeId, previous, distances);
}

function visualizeShortestPaths(startNodeId, previous, distances) {
    // For simplicity, let's visualize the path from start to ALL other nodes
    // or you could add a dropdown to select a target node.

    nodes.forEach(targetNode => {
        if (targetNode.id === startNodeId) return;

        let currentNode = targetNode.id;
        const pathNodes = [];
        const pathEdges = [];

        while (previous[currentNode] !== null) {
            const prevNode = previous[currentNode];
            pathNodes.unshift(currentNode); // Add to the beginning to get correct order
            pathNodes.unshift(prevNode);

            const edge = edges.find(e =>
                (e.from === prevNode && e.to === currentNode) ||
                (e.to === prevNode && e.from === currentNode)
            );
            if (edge) {
                pathEdges.unshift(edge);
            }
            currentNode = prevNode;
        }

        // Highlight the path (nodes and edges)
        pathNodes.forEach(nodeId => {
            const nodeEl = nodes.find(n => n.id === nodeId).element;
            nodeEl.classList.add('shortest-path');
            nodeEl.classList.remove('visited', 'unvisited'); // Ensure shortest-path class takes precedence
        });
        pathEdges.forEach(edge => {
            edge.element.classList.add('shortest-path-edge');
        });

        console.log(`Path from ${startNodeId} to ${targetNode.id}: `, pathNodes.join(' -> '), `Distance: ${distances[targetNode.id]}`);
    });
}


function resetVisualization() {
    nodes.forEach(node => {
        node.element.classList.remove('visited', 'current', 'shortest-path');
        node.element.classList.add('unvisited');
    });
    edges.forEach(edge => {
        edge.element.classList.remove('shortest-path-edge');
    });
}


// Utility for animation delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.getElementById('startBtn').addEventListener('click', startDijkstraVisualization);

// Initial setup
updateStartNodeSelect();