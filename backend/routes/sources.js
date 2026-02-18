const express = require('express');
const router = express.Router();
const { authenticate } = require('../config/auth');
const { sequelize } = require('../models');

// GET /api/sources
// Returns: id, name, capacity, type, capacityMld, geom (GeoJSON)
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT
        id,
        name,
        capacity,
        type,
        capacity_mld,
        ST_AsGeoJSON(geom) AS geom_geojson
      FROM sources
      ORDER BY id
    `);

    const sources = rows.map(row => ({
      id: row.id,
      name: row.name,
      capacity: row.capacity != null ? Number(row.capacity) : null,
      type: row.type || null,
      capacityMld: row.capacity_mld != null ? Number(row.capacity_mld) : null,
      geom: row.geom_geojson ? JSON.parse(row.geom_geojson) : null
    }));

    res.json(sources);
  } catch (error) {
    console.error('Get sources error:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

module.exports = router;

