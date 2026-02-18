import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const DashboardCharts = ({ trends, dmaStats, loading, error, onRetry }) => {
  const pressureData = (trends?.pressure || []).map(row => ({
    time: row.ts,
    pressure: Number(row.avg_value || row.avg_value)
  }));

  const flowData = (trends?.flow || []).map(row => ({
    time: row.ts,
    flow: Number(row.avg_value || row.avg_value)
  }));

  const levelData = (trends?.level || []).map(row => ({
    time: row.ts,
    level: Number(row.avg_value || row.avg_value)
  }));

  const dmaPressureData = (dmaStats?.pressureByDma || []).map(row => ({
    dmaName: row.dma_name || row.dmaName || `DMA ${row.dma_id || row.dmaId}`,
    pressure: Number(row.avg_pressure || row.avgPressure)
  }));

  const dmaFlowData = (dmaStats?.flowByDma || []).map(row => ({
    dmaName: row.dma_name || row.dmaName || `DMA ${row.dma_id || row.dmaId}`,
    flow: Number(row.avg_flow || row.avgFlow)
  }));

  if (loading && !trends) {
    return <div style={{ padding: '1rem', textAlign: 'center' }}>Loading graphs...</div>;
  }

  if (error && !trends) {
    return (
      <div style={{ padding: '1rem', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Failed to load graph data</span>
        <button
          onClick={onRetry}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '1rem'
    }}>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '1rem',
        fontFamily: 'Arial, sans-serif'
      }}>
        SYSTEM GRAPHS
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {/* Pressure vs Time */}
        <div>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#333' }}>Pressure vs Time</h4>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={pressureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="time" tickFormatter={formatTime} minTickGap={20} />
                <YAxis />
                <Tooltip labelFormatter={formatTime} />
                <Legend />
                <Line type="monotone" dataKey="pressure" stroke="#0066cc" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flow vs Time */}
        <div>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#333' }}>Flow vs Time</h4>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={flowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="time" tickFormatter={formatTime} minTickGap={20} />
                <YAxis />
                <Tooltip labelFormatter={formatTime} />
                <Legend />
                <Line type="monotone" dataKey="flow" stroke="#00a86b" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level vs Time */}
        <div>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#333' }}>Tank Level vs Time</h4>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="time" tickFormatter={formatTime} minTickGap={20} />
                <YAxis />
                <Tooltip labelFormatter={formatTime} />
                <Legend />
                <Line type="monotone" dataKey="level" stroke="#f39c12" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {/* DMA-wise Pressure */}
        <div>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#333' }}>DMA-wise Average Pressure</h4>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={dmaPressureData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="dmaName" angle={-35} textAnchor="end" interval={0} height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pressure" fill="#0066cc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DMA-wise Flow */}
        <div>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#333' }}>DMA-wise Average Flow</h4>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={dmaFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="dmaName" angle={-35} textAnchor="end" interval={0} height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="flow" fill="#00a86b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;

