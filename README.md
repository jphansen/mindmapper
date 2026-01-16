# jphmind - Web-Based Mindmap Application

A modern, feature-rich web-based mindmap application inspired by FreeMind, built with HTML, CSS, and JavaScript using D3.js for visualization.

## Features

### Core Functionality
- **Interactive Mindmap Visualization**: Create, edit, and visualize hierarchical mindmaps
- **Node Manipulation**: Add child nodes, sibling nodes, edit text, change colors, and delete nodes
- **Drag & Drop**: Interactive node positioning
- **Multiple Layouts**: Horizontal, vertical, and radial layouts (visual indicator)

### User Interface
- **Modern Design**: Clean, responsive interface with gradient backgrounds
- **Sidebar Controls**: Easy access to node manipulation tools
- **Context Menu**: Right-click on nodes for quick actions
- **Real-time Status**: Current selection and operation feedback
- **Node Information Panel**: Detailed info about selected nodes

### File Management
- **Save/Load**: Export mindmaps as JSON files and import them back
- **Export as PNG**: Save your mindmap as an image
- **New Mindmap**: Start fresh with a clean canvas
- **Sample Mindmap**: Pre-loaded example to get started quickly

### Advanced Features
- **Undo/Redo**: Full history support with Ctrl+Z/Ctrl+Y shortcuts
- **Zoom Controls**: Zoom in, out, and reset view
- **Keyboard Shortcuts**: Quick access to common operations
- **Color Customization**: Change node colors with color picker
- **Font Size Control**: Adjust text size for better readability

## Getting Started

### Quick Start
1. Open `index.html` in a modern web browser
2. Double-click on the canvas to create your first root node
3. Click on nodes to select them
4. Use the sidebar controls or right-click menu to add child/sibling nodes
5. Save your work using the "Save" button

### Keyboard Shortcuts
- **Ctrl+N**: New mindmap
- **Ctrl+S**: Save mindmap
- **Ctrl+Z**: Undo
- **Ctrl+Y** or **Ctrl+Shift+Z**: Redo
- **Enter**: Apply text changes to selected node

### Basic Usage
1. **Creating Nodes**:
   - Double-click on empty canvas: Create root node
   - Select a node → Enter text → Click "Add Child": Add child node
   - Select a node → Enter text → Click "Add Sibling": Add sibling node

2. **Editing Nodes**:
   - Click on a node to select it
   - Edit text in the "Node Text" field and press Enter
   - Change color using the color picker
   - Right-click for more options (edit, delete, collapse/expand)

3. **Saving & Loading**:
   - Click "Save" to download mindmap as JSON
   - Click "Load" to upload a previously saved mindmap
   - Click "Export PNG" to save as image

## Technical Details

### Architecture
- **Frontend**: Pure HTML/CSS/JavaScript (no frameworks)
- **Visualization**: D3.js for SVG-based tree diagrams
- **Styling**: Modern CSS with Flexbox, gradients, and animations
- **State Management**: In-memory with undo/redo history

### File Structure
```
jphmind/
├── index.html          # Main application HTML
├── style.css           # Styles and layout
├── mindmap.js          # Core application logic
├── README.md           # This documentation
└── (future extensions)
```

### Data Format
Mindmaps are saved as JSON with the following structure:
```json
{
  "name": "Node Name",
  "color": "#hexcolor",
  "fontSize": 14,
  "children": [
    { "name": "Child 1", "color": "#color1" },
    { "name": "Child 2", "color": "#color2" }
  ]
}
```

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements
- FreeMind (.mm) file format import/export
- Collaborative editing
- Cloud storage integration
- Additional layout algorithms
- Node icons and images
- Search functionality
- Print support

## Development

### Running Locally
```bash
# Using Python
python3 -m http.server 8080
# Then open http://localhost:8080

# Using Node.js
npx serve .
```

### Project Structure
The application follows a modular structure:
- `mindmap.js`: Main application logic with D3.js integration
- `style.css`: Complete styling with responsive design
- `index.html`: Application structure and UI components

## License
This project is created as a demonstration of web-based mindmap applications.

## Acknowledgments
- Inspired by FreeMind, a popular desktop mindmapping tool
- Built with D3.js for data visualization
- Uses Inter font and Font Awesome icons
- Modern CSS techniques for responsive design

---

**Enjoy mindmapping with jphmind!** 🧠✨
