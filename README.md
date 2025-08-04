# GeoJSON Viewer & Editor

A modern, interactive web application for viewing and editing GeoJSON files. Built with vanilla JavaScript and Leaflet.js, this application provides a user-friendly interface for working with geographic data.
Pages link:
https://ferdsdo.github.io/geoJsonViewerEditor/

## Features

### 🗺️ Interactive Map Display
- **Leaflet.js Integration**: High-performance map rendering with OpenStreetMap tiles
- **Multiple Geometry Types**: Support for Points, LineStrings, Polygons, and their Multi variants
- **Color-coded Features**: Different geometry types are displayed with distinct colors
- **Interactive Popups**: Click on features to view their properties
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 📁 Data Loading
- **File Upload**: Drag and drop or click to upload GeoJSON files
- **URL Loading**: Load GeoJSON data directly from web URLs
- **Sample Data**: Built-in sample datasets for testing (Points, Polygons, Lines)
- **Format Validation**: Automatic validation of GeoJSON structure

### ✏️ Editing Capabilities
- **Add Features**: Create new points, lines, or polygons
- **Edit Existing Features**: Modify geometry and properties of existing features
- **Delete Features**: Remove unwanted features from the dataset
- **Property Management**: Edit feature properties with JSON editor
- **Coordinate Editing**: Direct coordinate input for precise positioning

### 💾 Data Management
- **Export Functionality**: Download modified GeoJSON data
- **Clear Data**: Reset the application to start fresh
- **Feature Selection**: Click to select and highlight features
- **Feature List**: Sidebar showing all features with quick actions

### 🎨 User Interface
- **Modern Design**: Clean, intuitive interface with gradient backgrounds
- **Fullscreen Mode**: Toggle fullscreen for immersive map viewing
- **Map Controls**: Center map and toggle fullscreen buttons
- **Responsive Layout**: Adapts to different screen sizes
- **Loading States**: Visual feedback during data operations

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation

1. **Clone or Download** the repository:
   ```bash
   git clone https://github.com/yourusername/geoJsonViewer.git
   cd geoJsonViewer
   ```

2. **Open the Application**:
   - Simply open `index.html` in your web browser
   - Or serve the files using a local web server

### Local Development Server

For the best experience during development, use a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Usage

### Loading Data

1. **Upload a File**:
   - Click "Choose File" and select a `.geojson` or `.json` file
   - The map will automatically display your data

2. **Load from URL**:
   - Enter a URL pointing to a GeoJSON file
   - Click "Load" to fetch and display the data

3. **Use Sample Data**:
   - Click any of the sample data buttons to load example datasets
   - Great for testing the application features

### Editing Features

1. **Add a New Feature**:
   - Click "Add Feature" button
   - Select the geometry type (Point, LineString, Polygon)
   - Enter coordinates in JSON format
   - Add properties as JSON
   - Click "Save"

2. **Edit Existing Features**:
   - Click the edit icon (✏️) next to any feature in the sidebar
   - Modify the geometry type, coordinates, or properties
   - Click "Save" to apply changes

3. **Delete Features**:
   - Click the delete icon (🗑️) next to any feature
   - Confirm the deletion

### Exporting Data

- Click "Export" to download the current GeoJSON data
- The file will be saved as `geojson-data.json`

## Deployment

### GitHub Pages

This application is designed to work perfectly with GitHub Pages:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll down to "GitHub Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Access Your App**:
   - Your app will be available at `https://yourusername.github.io/your-repo-name`

### Other Static Hosting

The application can be deployed to any static hosting service:

- **Netlify**: Drag and drop the folder to Netlify
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload files to an S3 bucket with static website hosting
- **Firebase Hosting**: Use Firebase CLI to deploy

## File Structure

```
geoJsonViewer/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## GeoJSON Format Support

The application supports the following GeoJSON geometry types:

- **Point**: Single location coordinates
- **LineString**: Series of connected points
- **Polygon**: Closed area with optional holes
- **MultiPoint**: Multiple points
- **MultiLineString**: Multiple line strings
- **MultiPolygon**: Multiple polygons

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Leaflet.js**: Open-source JavaScript library for interactive maps
- **OpenStreetMap**: Free world map data
- **Font Awesome**: Icons used throughout the interface

## Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Ensure your GeoJSON file is valid
3. Try loading one of the sample datasets
4. Open an issue on GitHub with details about the problem

---

**Happy mapping! 🗺️** 
