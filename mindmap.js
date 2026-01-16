// jphmind - Web-Based Mindmap Application
// Main JavaScript file

// Global variables
let mindmapData = {
    name: "Central Idea",
    children: []
};
let selectedNode = null;
let history = [];
let historyIndex = -1;
let zoom = d3.zoom();
let svg, g, root, treeLayout;
let nodeIdCounter = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMindmap();
    setupEventListeners();
    updateUI();
    
    // Create a sample mindmap for demonstration
    createSampleMindmap();
});

// Initialize the D3 mindmap visualization
function initializeMindmap() {
    const width = document.getElementById('mindmap').clientWidth;
    const height = document.getElementById('mindmap').clientHeight;
    
    // Create SVG container
    svg = d3.select('#mindmap')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .call(zoom.on('zoom', (event) => {
            g.attr('transform', event.transform);
        }))
        .append('g');
    
    g = svg.append('g');
    
    // Initialize tree layout
    treeLayout = d3.tree()
        .size([height - 100, width - 200])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
    
    // Create initial root
    root = d3.hierarchy(mindmapData);
    root.x0 = height / 2;
    root.y0 = width / 2;
    
    update(root);
    
    // Center the view
    zoom.scaleTo(svg.transition().duration(500), 0.8);
    zoom.translateTo(svg.transition().duration(500), width / 2, height / 2);
}

// Update the mindmap visualization
function update(source) {
    // Assign unique IDs to nodes
    root.eachBefore((node) => {
        if (!node.data.id) {
            node.data.id = `node_${nodeIdCounter++}`;
        }
    });
    
    const treeData = treeLayout(root);
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);
    
    // Normalize for fixed-depth
    nodes.forEach((d) => {
        d.y = d.depth * 180;
    });
    
    // Update nodes
    const node = g.selectAll('g.node')
        .data(nodes, (d) => d.data.id);
    
    // Enter new nodes
    const nodeEnter = node.enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', () => `translate(${source.y0},${source.x0})`)
        .on('click', (event, d) => selectNode(d))
        .on('contextmenu', (event, d) => {
            event.preventDefault();
            showContextMenu(event, d);
        });
    
    nodeEnter.append('circle')
        .attr('r', 8)
        .attr('fill', (d) => d.data.color || '#4a90e2');
    
    nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', (d) => d.children || d._children ? -12 : 12)
        .attr('text-anchor', (d) => d.children || d._children ? 'end' : 'start')
        .text((d) => d.data.name)
        .style('font-size', (d) => `${d.data.fontSize || 14}px`);
    
    // Update node text
    node.select('text')
        .text((d) => d.data.name)
        .style('font-size', (d) => `${d.data.fontSize || 14}px`);
    
    // Update node color
    node.select('circle')
        .attr('fill', (d) => d.data.color || '#4a90e2');
    
    // Transition nodes to their new position
    const nodeUpdate = node.merge(nodeEnter)
        .transition()
        .duration(300)
        .attr('transform', (d) => `translate(${d.y},${d.x})`);
    
    // Remove exiting nodes
    const nodeExit = node.exit()
        .transition()
        .duration(300)
        .attr('transform', () => `translate(${source.y},${source.x})`)
        .remove();
    
    // Update links
    const link = g.selectAll('path.link')
        .data(links, (d) => d.data.id);
    
    // Enter new links
    const linkEnter = link.enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('d', () => {
            const o = { x: source.x0, y: source.y0 };
            return diagonal(o, o);
        });
    
    // Transition links to their new position
    link.merge(linkEnter)
        .transition()
        .duration(300)
        .attr('d', (d) => diagonal(d, d.parent));
    
    // Remove exiting links
    link.exit()
        .transition()
        .duration(300)
        .attr('d', () => {
            const o = { x: source.x, y: source.y };
            return diagonal(o, o);
        })
        .remove();
    
    // Store old positions for transition
    nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
    });
    
    // Update UI counters
    updateNodeCount();
}

// Create a diagonal path for links
function diagonal(s, d) {
    return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
}

// Select a node
function selectNode(node) {
    // Deselect previous node
    d3.selectAll('.node.selected').classed('selected', false);
    
    // Select new node
    d3.select(event.currentTarget).classed('selected', true);
    selectedNode = node;
    
    // Update UI
    updateUI();
    
    // Update status
    document.getElementById('status').textContent = `Selected: "${node.data.name}"`;
}

// Update UI based on selected node
function updateUI() {
    const nodeInfo = document.getElementById('node-info');
    const selectedNodeText = document.getElementById('selected-node');
    const nodeTextInput = document.getElementById('node-text');
    const nodeColorInput = document.getElementById('node-color');
    
    if (selectedNode) {
        nodeInfo.innerHTML = `
            <strong>${selectedNode.data.name}</strong><br>
            <small>ID: ${selectedNode.data.id}</small><br>
            <small>Depth: ${selectedNode.depth}</small><br>
            <small>Children: ${selectedNode.children ? selectedNode.children.length : 0}</small>
        `;
        selectedNodeText.textContent = selectedNode.data.name;
        nodeTextInput.value = selectedNode.data.name;
        nodeColorInput.value = selectedNode.data.color || '#4a90e2';
    } else {
        nodeInfo.innerHTML = '<p>No node selected</p>';
        selectedNodeText.textContent = 'None';
        nodeTextInput.value = '';
    }
}

// Update node count in footer
function updateNodeCount() {
    const count = root.descendants().length;
    document.getElementById('node-count').textContent = count;
}

// Helper function to find a node in the mindmapData structure by ID
function findNodeInData(data, targetId) {
    if (data.id === targetId) {
        return data;
    }
    
    if (data.children) {
        for (const child of data.children) {
            const found = findNodeInData(child, targetId);
            if (found) return found;
        }
    }
    
    return null;
}

// Add a child node
function addChildNode() {
    if (!selectedNode) {
        alert('Please select a node first');
        return;
    }
    
    saveToHistory();
    
    const text = document.getElementById('node-text').value.trim() || 'New Child';
    const color = document.getElementById('node-color').value;
    const fontSize = parseInt(document.getElementById('font-size').value);
    
    const newNode = {
        name: text,
        color: color,
        fontSize: fontSize,
        id: `node_${nodeIdCounter++}`
    };
    
    // Find the corresponding node in mindmapData
    const targetNode = findNodeInData(mindmapData, selectedNode.data.id);
    
    if (!targetNode) {
        // If not found by ID, try to find by path
        if (!selectedNode.data.children) {
            selectedNode.data.children = [];
        }
        selectedNode.data.children.push(newNode);
    } else {
        if (!targetNode.children) {
            targetNode.children = [];
        }
        targetNode.children.push(newNode);
    }
    
    // Recreate hierarchy and update visualization
    root = d3.hierarchy(mindmapData);
    update(root);
    
    // Select the new node
    const newHierarchyNode = root.descendants().find(d => 
        d.data.id === newNode.id
    );
    if (newHierarchyNode) {
        selectNode(newHierarchyNode);
    }
}

// Add a sibling node
function addSiblingNode() {
    if (!selectedNode || !selectedNode.parent) {
        alert('Cannot add sibling to root node');
        return;
    }
    
    saveToHistory();
    
    const text = document.getElementById('node-text').value.trim() || 'New Sibling';
    const color = document.getElementById('node-color').value;
    
    const newNode = {
        name: text,
        color: color,
        fontSize: parseInt(document.getElementById('font-size').value),
        id: `node_${nodeIdCounter++}`
    };
    
    // Find the parent node in mindmapData
    const parentNode = findNodeInData(mindmapData, selectedNode.parent.data.id);
    if (!parentNode) {
        console.warn('Could not find parent node in data structure');
        if (!selectedNode.parent.data.children) {
            selectedNode.parent.data.children = [];
        }
        selectedNode.parent.data.children.push(newNode);
    } else {
        if (!parentNode.children) {
            parentNode.children = [];
        }
        parentNode.children.push(newNode);
    }
    
    // Recreate hierarchy and update visualization
    root = d3.hierarchy(mindmapData);
    update(root);
}

// Delete selected node
function deleteNode() {
    if (!selectedNode || !selectedNode.parent) {
        alert('Cannot delete root node');
        return;
    }
    
    saveToHistory();
    
    // Find the parent node in mindmapData
    const parentNode = findNodeInData(mindmapData, selectedNode.parent.data.id);
    if (!parentNode) {
        console.warn('Could not find parent node in data structure');
        // Fallback to D3 hierarchy manipulation
        const index = selectedNode.parent.children.indexOf(selectedNode);
        if (index > -1) {
            selectedNode.parent.children.splice(index, 1);
        }
    } else {
        // Find and remove the child from parentNode.children
        const childIndex = parentNode.children.findIndex(child => 
            child.id === selectedNode.data.id
        );
        if (childIndex > -1) {
            parentNode.children.splice(childIndex, 1);
        }
    }
    
    // Recreate hierarchy and update visualization
    root = d3.hierarchy(mindmapData);
    update(root);
    selectedNode = null;
    updateUI();
}

// Edit selected node
function editNode() {
    if (!selectedNode) return;
    
    saveToHistory();
    
    const newText = prompt('Edit node text:', selectedNode.data.name);
    if (newText !== null) {
        const updatedText = newText.trim() || selectedNode.data.name;
        
        // Update in mindmapData structure
        const targetNode = findNodeInData(mindmapData, selectedNode.data.id);
        if (targetNode) {
            targetNode.name = updatedText;
        }
        
        // Update in D3 hierarchy
        selectedNode.data.name = updatedText;
        update(selectedNode);
        updateUI();
    }
}

// Change node color
function changeNodeColor() {
    if (!selectedNode) return;
    
    saveToHistory();
    
    const color = document.getElementById('node-color').value;
    
    // Update in mindmapData structure
    const targetNode = findNodeInData(mindmapData, selectedNode.data.id);
    if (targetNode) {
        targetNode.color = color;
    }
    
    // Update in D3 hierarchy
    selectedNode.data.color = color;
    update(selectedNode);
}

// Create a new mindmap
function newMindmap() {
    if (confirm('Create new mindmap? Current unsaved changes will be lost.')) {
        saveToHistory();
        mindmapData = {
            name: "Central Idea",
            children: []
        };
        root = d3.hierarchy(mindmapData);
        selectedNode = null;
        update(root);
        updateUI();
    }
}

// Save mindmap to JSON
function saveMindmap() {
    const dataStr = JSON.stringify(mindmapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    document.getElementById('status').textContent = 'Mindmap saved successfully';
}

// Load mindmap from JSON file
function loadMindmap(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            saveToHistory();
            mindmapData = data;
            root = d3.hierarchy(mindmapData);
            selectedNode = null;
            update(root);
            updateUI();
            document.getElementById('status').textContent = 'Mindmap loaded successfully';
        } catch (error) {
            alert('Error loading file: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Export mindmap as PNG
function exportPNG() {
    const svgElement = document.querySelector('#mindmap svg');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `mindmap_${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
}

// Show context menu
function showContextMenu(event, node) {
    selectNode(node);
    
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    
    // Close menu when clicking elsewhere
    const closeMenu = () => {
        menu.style.display = 'none';
        document.removeEventListener('click', closeMenu);
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 100);
}

// Handle context menu actions
function handleContextMenuAction(action) {
    switch (action) {
        case 'edit':
            editNode();
            break;
        case 'add-child':
            addChildNode();
            break;
        case 'add-sibling':
            addSiblingNode();
            break;
        case 'delete':
            deleteNode();
            break;
        case 'change-color':
            changeNodeColor();
            break;
        case 'collapse':
            // Toggle collapse/expand
            if (selectedNode.children) {
                selectedNode._children = selectedNode.children;
                selectedNode.children = null;
            } else if (selectedNode._children) {
                selectedNode.children = selectedNode._children;
                selectedNode._children = null;
            }
            update(selectedNode);
            break;
    }
}

// History management
function saveToHistory() {
    // Remove future history if we're not at the end
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    
    // Save current state
    history.push(JSON.parse(JSON.stringify(mindmapData)));
    historyIndex++;
    
    // Limit history size
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        mindmapData = JSON.parse(JSON.stringify(history[historyIndex]));
        root = d3.hierarchy(mindmapData);
        selectedNode = null;
        update(root);
        updateUI();
        document.getElementById('status').textContent = 'Undo performed';
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        mindmapData = JSON.parse(JSON.stringify(history[historyIndex]));
        root = d3.hierarchy(mindmapData);
        selectedNode = null;
        update(root);
        updateUI();
        document.getElementById('status').textContent = 'Redo performed';
    }
}

// Helper function to recursively add IDs to nodes
function addIdsToNodes(node) {
    if (!node.id) {
        node.id = `node_${nodeIdCounter++}`;
    }
    if (node.children) {
        node.children.forEach(child => addIdsToNodes(child));
    }
}

// Create a sample mindmap for demonstration
function createSampleMindmap() {
    mindmapData = {
        name: "Web Development",
        color: "#3498db",
        children: [
            {
                name: "Frontend",
                color: "#e74c3c",
                children: [
                    { name: "HTML", color: "#f39c12" },
                    { name: "CSS", color: "#9b59b6" },
                    { name: "JavaScript", color: "#1abc9c" }
                ]
            },
            {
                name: "Backend",
                color: "#2ecc71",
                children: [
                    { name: "Node.js", color: "#27ae60" },
                    { name: "Python", color: "#16a085" },
                    { name: "Databases", color: "#8e44ad" }
                ]
            },
            {
                name: "Tools",
                color: "#d35400",
                children: [
                    { name: "Git", color: "#c0392b" },
                    { name: "VS Code", color: "#2980b9" },
                    { name: "Docker", color: "#7f8c8d" }
                ]
            }
        ]
    };
    
    // Add IDs to all nodes in the sample mindmap
    addIdsToNodes(mindmapData);
    
    root = d3.hierarchy(mindmapData);
    update(root);
    updateNodeCount();
    saveToHistory();
}

// Setup event listeners
function setupEventListeners() {
    // Button events
    document.getElementById('new-map').addEventListener('click', newMindmap);
    document.getElementById('save-map').addEventListener('click', saveMindmap);
    document.getElementById('load-map').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
    document.getElementById('export-png').addEventListener('click', exportPNG);
    
    // File input
    document.getElementById('file-input').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadMindmap(e.target.files[0]);
        }
    });
    
    // Node manipulation
    document.getElementById('add-child').addEventListener('click', addChildNode);
    document.getElementById('add-sibling').addEventListener('click', addSiblingNode);
    document.getElementById('delete-node').addEventListener('click', deleteNode);
    
    // Node text input
    document.getElementById('node-text').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && selectedNode) {
            saveToHistory();
            selectedNode.data.name = e.target.value.trim() || selectedNode.data.name;
            update(selectedNode);
            updateUI();
        }
    });
    
    // Color picker
    document.getElementById('node-color').addEventListener('change', changeNodeColor);
    
    // Font size slider
    document.getElementById('font-size').addEventListener('input', (e) => {
        document.getElementById('font-size-value').textContent = `${e.target.value}px`;
        if (selectedNode) {
            saveToHistory();
            selectedNode.data.fontSize = parseInt(e.target.value);
            update(selectedNode);
        }
    });
    
    // Layout direction
    document.getElementById('layout-direction').addEventListener('change', (e) => {
        const direction = e.target.value;
        // In a more advanced implementation, this would change the tree layout
        document.getElementById('status').textContent = `Layout changed to ${direction}`;
    });
    
    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
        zoom.scaleBy(svg.transition().duration(300), 1.2);
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
        zoom.scaleBy(svg.transition().duration(300), 0.8);
    });
    
    document.getElementById('zoom-reset').addEventListener('click', () => {
        zoom.scaleTo(svg.transition().duration(500), 0.8);
        zoom.translateTo(svg.transition().duration(500), 
            document.getElementById('mindmap').clientWidth / 2, 
            document.getElementById('mindmap').clientHeight / 2);
    });
    
    // Undo/Redo
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    
    // Context menu actions
    document.querySelectorAll('#context-menu li[data-action]').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.target.closest('li').getAttribute('data-action');
            handleContextMenuAction(action);
            document.getElementById('context-menu').style.display = 'none';
        });
    });
    
    // Double-click on canvas to create root node
    document.getElementById('mindmap').addEventListener('dblclick', (e) => {
        if (e.target.id === 'mindmap' || e.target.tagName === 'svg' || e.target.tagName === 'g') {
            const text = prompt('Enter text for root node:', 'Central Idea');
            if (text) {
                saveToHistory();
                mindmapData = {
                    name: text.trim(),
                    children: []
                };
                root = d3.hierarchy(mindmapData);
                selectedNode = null;
                update(root);
                updateUI();
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                    e.preventDefault();
                    break;
                case 'y':
                    redo();
                    e.preventDefault();
                    break;
                case 's':
                    saveMindmap();
                    e.preventDefault();
                    break;
                case 'n':
                    newMindmap();
                    e.preventDefault();
                    break;
            }
        }
    });
}
