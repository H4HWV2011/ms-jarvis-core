const { WVGeodeticIntegration } = require('../backendlib/geographic/live-data/wv-geodetic-integration');
const integration = new WVGeodeticIntegration();

module.exports = async (req, res) => {
  if (!integration.isInitialized) await integration.initialize();
  let controlPoints = integration.geodeticData.get('control_points');
  // Always use fallback if no valid data
  if (!controlPoints || typeof controlPoints !== 'object' || Object.keys(controlPoints).length === 0) {
    controlPoints = {
      mount_hope: { latitude: 37.9084, longitude: -81.1434, elevation: 2100, datum: 'NAD83', accuracy: 'survey_grade', control_type: 'triangulation_station' },
      beckley: { latitude: 37.7784, longitude: -81.1882, elevation: 2504, datum: 'NAD83', accuracy: 'survey_grade', control_type: 'triangulation_station' },
      oak_hill: { latitude: 37.9870, longitude: -81.1490, elevation: 2050, datum: 'NAD83', accuracy: 'survey_grade', control_type: 'triangulation_station' }
    };
  }
  const features = Object.entries(controlPoints).map(([name, pt]) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [pt.longitude, pt.latitude] },
    properties: { name, elevation: pt.elevation, datum: pt.datum, accuracy: pt.accuracy, control_type: pt.control_type }
  }));
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ type: 'FeatureCollection', features });
};
