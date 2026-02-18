const express = require('express');
const router = express.Router();
const { authenticate } = require('../config/auth');
const { sequelize } = require('../models');

// GET /api/tanks
// Returns: id, name, capacity, geom (GeoJSON)
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT
        id,
        name,
        capacity,
        ST_AsGeoJSON(geom) AS geom_geojson
      FROM tanks
      ORDER BY id
    `);

    const tanks = rows.map(row => ({
      id: row.id,
      name: row.name,
      capacity: row.capacity != null ? Number(row.capacity) : null,
      geom: row.geom_geojson ? JSON.parse(row.geom_geojson) : null
    }));

    res.json(tanks);
  } catch (error) {
    console.error('Get tanks error:', error);
    res.status(500).json({ error: 'Failed to fetch tanks' });
  }
});

module.exports = router;

