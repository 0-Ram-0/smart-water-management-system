import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const EngineerManagement = () => {
  const [engineers, setEngineers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [engineersRes, tasksRes] = await Promise.all([
        api.get('/engineers'),
        api.get('/tasks?limit=100')
      ]);

      setEngineers(engineersRes.data);
      setTasks(tasksRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const handleAssignTask = async (alertId, engineerId) => {
    try {
      await api.post(`/alerts/${alertId}/assign`, { engineerId });
      fetchData();
      alert('Task assigned successfully');
    } catch (error) {
      console.error('Failed to assign task:', error);
      alert('Failed to assign task');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
        ENGINEER MANAGEMENT
      </h2>

      {/* Engineers Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        {engineers.map(engineer => (
          <div
            key={engineer.id}
            style={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '1rem',
              cursor: 'pointer',
              borderLeft: engineer.isActive ? '4px solid #00a86b' : '4px solid #e74c3c'
            }}
            onClick={() => setSelectedEngineer(selectedEngineer?.id === engineer.id ? null : engineer)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {engineer.fullName}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666', fontFamily: 'monospace' }}>
                  ID: {engineer.employeeId}
                </div>
              </div>
              <div style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: engineer.isActive ? '#00a86b' : '#e74c3c',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {engineer.isActive ? 'AVAILABLE' : 'UNAVAILABLE'}
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #eee'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0066cc' }}>
                  {engineer.stats.totalTasks}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f39c12' }}>
                  {engineer.stats.activeTasks}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>Active</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#00a86b' }}>
                  {engineer.stats.completedTasks}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>Done</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Engineer Details & Task Assignment */}
      {selectedEngineer && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
              {selectedEngineer.fullName} - TASK ASSIGNMENT
            </h3>
            <button
              onClick={() => setSelectedEngineer(null)}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              CLOSE
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Active Tasks */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                ACTIVE TASKS
              </h4>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {tasks
                  .filter(t => t.assignedTo === selectedEngineer.id && ['assigned', 'in_progress'].includes(t.status))
                  .map(task => (
                    <div
                      key={task.id}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {task.taskCode} | {task.priority.toUpperCase()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Available Alerts for Assignment */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                AVAILABLE ALERTS
              </h4>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {tasks
                  .filter(t => t.alertId && !t.assignedTo)
                  .slice(0, 5)
                  .map(task => (
                    <div
                      key={task.id}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          Priority: {task.priority.toUpperCase()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignTask(task.alertId, selectedEngineer.id)}
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
                        ASSIGN
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerManagement;
