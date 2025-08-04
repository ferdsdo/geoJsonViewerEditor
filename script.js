// Global variables
let map;
let geojsonLayer;
let currentGeoJSON = null;
let selectedFeatureIndex = -1;
let isDrawing = false;
let drawingLayer;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
    updateUI();
});

// Initialize Leaflet map
function initializeMap() {
    map = L.map('map').setView([0, 0], 2);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Initialize drawing layer
    drawingLayer = L.layerGroup().addTo(map);
}

// Setup event listeners
function setupEventListeners() {
    // File upload
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    
    // URL load
    document.getElementById('loadUrlBtn').addEventListener('click', handleUrlLoad);
    document.getElementById('urlInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUrlLoad();
        }
    });
    
    // Data controls
    document.getElementById('addFeatureBtn').addEventListener('click', showAddFeatureModal);
    document.getElementById('exportBtn').addEventListener('click', exportGeoJSON);
    document.getElementById('clearBtn').addEventListener('click', clearData);
    
    // Map controls
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    document.getElementById('centerBtn').addEventListener('click', centerMap);
    
    // Modal events
    document.getElementById('saveFeatureBtn').addEventListener('click', saveFeature);
    document.getElementById('cancelFeatureBtn').addEventListener('click', closeModal);
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const geojson = JSON.parse(e.target.result);
            loadGeoJSON(geojson);
            showMessage('File loaded successfully!', 'success');
        } catch (error) {
            showMessage('Invalid GeoJSON file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// Handle URL load
async function handleUrlLoad() {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        showMessage('Please enter a valid URL', 'error');
        return;
    }
    
    try {
        showMessage('Loading data...', 'success');
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const geojson = await response.json();
        loadGeoJSON(geojson);
        showMessage('Data loaded successfully!', 'success');
    } catch (error) {
        showMessage('Failed to load data: ' + error.message, 'error');
    }
}

// Load GeoJSON data
function loadGeoJSON(geojson) {
    // Validate GeoJSON structure
    if (!geojson.type || !['FeatureCollection', 'Feature', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(geojson.type)) {
        showMessage('Invalid GeoJSON structure', 'error');
        return;
    }
    
    // Normalize to FeatureCollection
    if (geojson.type === 'Feature') {
        geojson = {
            type: 'FeatureCollection',
            features: [geojson]
        };
    } else if (['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(geojson.type)) {
        geojson = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: geojson,
                properties: {}
            }]
        };
    }
    
    currentGeoJSON = geojson;
    displayGeoJSON();
    updateUI();
    
    // Fit map to data bounds
    if (geojson.features.length > 0) {
        const bounds = L.geoJSON(geojson).getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }
}

// Display GeoJSON on map
function displayGeoJSON() {
    // Clear existing layer
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }
    
    if (!currentGeoJSON || !currentGeoJSON.features) return;
    
    // Create new layer with custom styling
    geojsonLayer = L.geoJSON(currentGeoJSON, {
        style: function(feature) {
            return getFeatureStyle(feature);
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 8,
                fillColor: getFeatureColor(feature),
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            // Add popup
            const popupContent = createPopupContent(feature);
            layer.bindPopup(popupContent);
            
            // Add click handler
            layer.on('click', function() {
                const featureIndex = currentGeoJSON.features.indexOf(feature);
                selectFeature(featureIndex);
            });
        }
    }).addTo(map);
    
    updateFeatureList();
}

// Get feature style based on type
function getFeatureStyle(feature) {
    const color = getFeatureColor(feature);
    return {
        color: color,
        weight: 3,
        opacity: 1,
        fillColor: color,
        fillOpacity: 0.3
    };
}

// Get feature color based on type
function getFeatureColor(feature) {
    const type = feature.geometry.type;
    const colors = {
        'Point': '#e74c3c',
        'LineString': '#3498db',
        'Polygon': '#2ecc71',
        'MultiPoint': '#e67e22',
        'MultiLineString': '#9b59b6',
        'MultiPolygon': '#1abc9c'
    };
    return colors[type] || '#95a5a6';
}

// Create popup content
function createPopupContent(feature) {
    let content = `<strong>Type:</strong> ${feature.geometry.type}<br>`;
    
    if (feature.properties) {
        Object.keys(feature.properties).forEach(key => {
            content += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
        });
    }
    
    return content;
}

// Update feature list in sidebar
function updateFeatureList() {
    const featureList = document.getElementById('featureList');
    const featureCount = document.getElementById('featureCount');
    
    if (!currentGeoJSON || !currentGeoJSON.features) {
        featureList.innerHTML = '<p class="no-data">No features loaded</p>';
        featureCount.textContent = '0';
        return;
    }
    
    featureCount.textContent = currentGeoJSON.features.length;
    
    if (currentGeoJSON.features.length === 0) {
        featureList.innerHTML = '<p class="no-data">No features in data</p>';
        return;
    }
    
    featureList.innerHTML = '';
    currentGeoJSON.features.forEach((feature, index) => {
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';
        if (index === selectedFeatureIndex) {
            featureItem.classList.add('selected');
        }
        
        const type = feature.geometry.type;
        const name = feature.properties?.name || feature.properties?.title || `Feature ${index + 1}`;
        
        featureItem.innerHTML = `
            <div>
                <strong>${name}</strong><br>
                <small>${type}</small>
            </div>
            <div class="feature-actions">
                <button onclick="editFeature(${index})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteFeature(${index})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        featureItem.addEventListener('click', function(e) {
            if (!e.target.closest('.feature-actions')) {
                selectFeature(index);
            }
        });
        
        featureList.appendChild(featureItem);
    });
}

// Select feature
function selectFeature(index) {
    selectedFeatureIndex = index;
    updateFeatureList();
    
    if (index >= 0 && currentGeoJSON.features[index]) {
        const feature = currentGeoJSON.features[index];
        const layer = geojsonLayer.getLayers().find(l => l.feature === feature);
        if (layer) {
            map.setView(layer.getBounds().getCenter(), Math.max(map.getZoom(), 12));
        }
    }
}

// Edit feature
function editFeature(index) {
    if (index < 0 || !currentGeoJSON.features[index]) return;
    
    const feature = currentGeoJSON.features[index];
    document.getElementById('featureType').value = feature.geometry.type;
    document.getElementById('featureProperties').value = JSON.stringify(feature.properties || {}, null, 2);
    document.getElementById('featureCoordinates').value = JSON.stringify(feature.geometry.coordinates, null, 2);
    
    // Store the index being edited
    document.getElementById('editModal').dataset.editIndex = index;
    
    openModal();
}

// Show add feature modal
function showAddFeatureModal() {
    document.getElementById('featureType').value = 'Point';
    document.getElementById('featureProperties').value = '{\n  "name": "New Feature",\n  "description": ""\n}';
    document.getElementById('featureCoordinates').value = '[0, 0]';
    
    // Remove edit index
    delete document.getElementById('editModal').dataset.editIndex;
    
    openModal();
}

// Open modal
function openModal() {
    document.getElementById('editModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Save feature
function saveFeature() {
    try {
        const type = document.getElementById('featureType').value;
        const properties = JSON.parse(document.getElementById('featureProperties').value);
        const coordinates = JSON.parse(document.getElementById('featureCoordinates').value);
        
        const feature = {
            type: 'Feature',
            geometry: {
                type: type,
                coordinates: coordinates
            },
            properties: properties
        };
        
        const editIndex = document.getElementById('editModal').dataset.editIndex;
        
        if (editIndex !== undefined) {
            // Editing existing feature
            currentGeoJSON.features[parseInt(editIndex)] = feature;
        } else {
            // Adding new feature
            currentGeoJSON.features.push(feature);
        }
        
        displayGeoJSON();
        updateUI();
        closeModal();
        showMessage('Feature saved successfully!', 'success');
        
    } catch (error) {
        showMessage('Invalid JSON format: ' + error.message, 'error');
    }
}

// Delete feature
function deleteFeature(index) {
    if (index < 0 || !currentGeoJSON.features[index]) return;
    
    if (confirm('Are you sure you want to delete this feature?')) {
        currentGeoJSON.features.splice(index, 1);
        displayGeoJSON();
        updateUI();
        selectedFeatureIndex = -1;
        showMessage('Feature deleted successfully!', 'success');
    }
}

// Export GeoJSON
function exportGeoJSON() {
    if (!currentGeoJSON) return;
    
    const dataStr = JSON.stringify(currentGeoJSON, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'geojson-data.json';
    link.click();
    
    showMessage('GeoJSON exported successfully!', 'success');
}

// Clear data
function clearData() {
    if (confirm('Are you sure you want to clear all data?')) {
        currentGeoJSON = null;
        selectedFeatureIndex = -1;
        
        if (geojsonLayer) {
            map.removeLayer(geojsonLayer);
            geojsonLayer = null;
        }
        
        updateUI();
        updateFeatureList();
        showMessage('Data cleared successfully!', 'success');
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    const mapContainer = document.querySelector('.map-container');
    if (!document.fullscreenElement) {
        mapContainer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Center map
function centerMap() {
    if (currentGeoJSON && currentGeoJSON.features.length > 0) {
        const bounds = L.geoJSON(currentGeoJSON).getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    } else {
        map.setView([0, 0], 2);
    }
}

// Update UI state
function updateUI() {
    const hasData = currentGeoJSON && currentGeoJSON.features && currentGeoJSON.features.length > 0;
    
    document.getElementById('addFeatureBtn').disabled = !hasData;
    document.getElementById('exportBtn').disabled = !hasData;
    document.getElementById('clearBtn').disabled = !hasData;
}

// Show message
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at top of sidebar
    const sidebar = document.querySelector('.sidebar');
    sidebar.insertBefore(messageDiv, sidebar.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Load sample data
function loadSampleData(type) {
    let sampleData;
    
    switch (type) {
        case 'points':
            sampleData = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [-74.006, 40.7128]
                        },
                        properties: {
                            name: 'New York City',
                            description: 'The Big Apple',
                            population: '8.4M'
                        }
                    },
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [-118.2437, 34.0522]
                        },
                        properties: {
                            name: 'Los Angeles',
                            description: 'City of Angels',
                            population: '4M'
                        }
                    },
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [-87.6298, 41.8781]
                        },
                        properties: {
                            name: 'Chicago',
                            description: 'Windy City',
                            population: '2.7M'
                        }
                    }
                ]
            };
            break;
            
        case 'polygons':
            sampleData = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                [-74.1, 40.7],
                                [-73.9, 40.7],
                                [-73.9, 40.9],
                                [-74.1, 40.9],
                                [-74.1, 40.7]
                            ]]
                        },
                        properties: {
                            name: 'Manhattan Area',
                            description: 'Central business district',
                            area: '22.8 sq mi'
                        }
                    },
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                [-118.3, 34.0],
                                [-118.1, 34.0],
                                [-118.1, 34.2],
                                [-118.3, 34.2],
                                [-118.3, 34.0]
                            ]]
                        },
                        properties: {
                            name: 'Downtown LA',
                            description: 'Central Los Angeles',
                            area: '15.8 sq mi'
                        }
                    }
                ]
            };
            break;
            
        case 'lines':
            sampleData = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [-74.006, 40.7128],
                                [-87.6298, 41.8781],
                                [-118.2437, 34.0522]
                            ]
                        },
                        properties: {
                            name: 'Coast to Coast Route',
                            description: 'Major cities connection',
                            distance: '2,789 miles'
                        }
                    },
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [-74.006, 40.7128],
                                [-80.1918, 25.7617]
                            ]
                        },
                        properties: {
                            name: 'NYC to Miami',
                            description: 'East Coast corridor',
                            distance: '1,280 miles'
                        }
                    }
                ]
            };
            break;
    }
    
    if (sampleData) {
        loadGeoJSON(sampleData);
        showMessage(`Sample ${type} data loaded!`, 'success');
    }
}

// Handle fullscreen changes
document.addEventListener('fullscreenchange', function() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const icon = fullscreenBtn.querySelector('i');
    
    if (document.fullscreenElement) {
        icon.className = 'fas fa-compress';
        fullscreenBtn.title = 'Exit Fullscreen';
    } else {
        icon.className = 'fas fa-expand';
        fullscreenBtn.title = 'Toggle Fullscreen';
    }
    
    // Trigger map resize
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}); 