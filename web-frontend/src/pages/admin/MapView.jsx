import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../config/api';

// Solapur center coordinates
const SOLAPUR_CENTER = [17.6599, 75.9064];

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapView = () => {
  const [pipelineNetworkGeoJson, setPipelineNetworkGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tanks, setTanks] = useState([]);
  const [sources, setSources] = useState([]);
  const [pointsError, setPointsError] = useState(null);

  useEffect(() => {
    loadExternalPipelineNetwork();
  }, []);

  // Load tanks and sources from backend
  useEffect(() => {
    const loadTanksAndSources = async () => {
      try {
        const [tanksRes, sourcesRes] = await Promise.all([
          api.get('/tanks'),
          api.get('/sources')
        ]);
        setTanks(tanksRes.data || []);
        setSources(sourcesRes.data || []);
        setPointsError(null);
      } catch (err) {
        console.error('Failed to load tanks/sources:', err);
        setPointsError('Failed to load tanks and sources');
      }
    };

    loadTanksAndSources();
  }, []);

  // Load Solapur pipeline network GeoJSON from SMC GIS export (qgis2web)
  const loadExternalPipelineNetwork = () => {
    try {
      setLoading(true);
      const script = document.createElement('script');
      script.src = 'https://smcgis.solapurcorporation.org/Web_Pages/PM_GATI_SHAKTI/Water_Supply_Network/layers/Pipeline_Network_6.js';
      script.async = true;
      script.onload = () => {
        if (window.json_Pipeline_Network_6) {
          setPipelineNetworkGeoJson(window.json_Pipeline_Network_6);
        }
        setLoading(false);
      };
      script.onerror = () => {
        console.error('Failed to load external pipeline network layer.');
        setLoading(false);
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error('Error initializing external pipeline network:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading map data...
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
          GIS MAP VIEW - SOLAPUR PIPELINE NETWORK
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#666', fontFamily: 'monospace' }}>
            PIPELINES: {pipelineNetworkGeoJson?.features?.length || 0}
          </div>
          {pointsError && (
            <div style={{ fontSize: '0.75rem', color: '#e74c3c' }}>
              {pointsError}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={SOLAPUR_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Real Solapur pipeline network from SMC GIS export */}
          {pipelineNetworkGeoJson && (
            <GeoJSON
              data={pipelineNetworkGeoJson}
              style={() => ({
                color: '#00a86b',
                weight: 2,
                opacity: 0.9
              })}
            />
          )}

          {/* Tanks (blue circle markers) */}
          {tanks
            .filter(t => t.geom && t.geom.type === 'Point' && Array.isArray(t.geom.coordinates))
            .map(tank => {
              const [lng, lat] = tank.geom.coordinates;
              return (
                <CircleMarker
                  key={`tank-${tank.id}`}
                  center={[lat, lng]}
                  radius={6}
                  pathOptions={{ color: '#0066cc', fillColor: '#0066cc', fillOpacity: 0.9 }}
                >
                  <Popup>
                    <div>
                      <strong>Tank</strong>
                      <br />
                      Name: {tank.name || 'N/A'}
                      <br />
                      Capacity: {tank.capacity != null ? `${tank.capacity}` : 'N/A'}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

          {/* Sources (red circle markers) */}
          {sources
            .filter(s => s.geom && s.geom.type === 'Point' && Array.isArray(s.geom.coordinates))
            .map(source => {
              const [lng, lat] = source.geom.coordinates;
              return (
                <CircleMarker
                  key={`source-${source.id}`}
                  center={[lat, lng]}
                  radius={6}
                  pathOptions={{ color: '#e74c3c', fillColor: '#e74c3c', fillOpacity: 0.9 }}
                >
                  <Popup>
                    <div>
                      <strong>Source</strong>
                      <br />
                      Name: {source.name || 'N/A'}
                      <br />
                      Type: {source.type || 'N/A'}
                      <br />
                      Capacity MLD:{' '}
                      {source.capacityMld != null
                        ? `${source.capacityMld}`
                        : source.capacity != null
                        ? `${source.capacity}`
                        : 'N/A'}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderTop: '1px solid #ddd',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div>
          <strong style={{ fontSize: '0.875rem' }}>PIPELINE NETWORK:</strong>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '3px', backgroundColor: '#00a86b' }}></div>
            <span style={{ fontSize: '0.75rem' }}>Solapur Water Supply Network</span>
          </div>
        </div>
        <div>
          <strong style={{ fontSize: '0.875rem' }}>TANKS & SOURCES:</strong>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#0066cc'
              }}></span>
              <span style={{ fontSize: '0.75rem' }}>Tank</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#e74c3c'
              }}></span>
              <span style={{ fontSize: '0.75rem' }}>Source</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
