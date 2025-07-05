import { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Data.css';

function Data() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [tasks, setTasks] = useState([{ task: '', points: 1, count: 1 }]);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());
  const [todayWinner, setTodayWinner] = useState(null);

  // Task points mapping
  const taskPoints = {
    'Vachnamrut': 10,
    'BhaktChintamani': 10,
    'Vandu Sahajanad': 10,
    'janmangal stotra/namavali': 10,
    'Parcha-Prakrn': 10,
    'Bhram-Mohurat-pooja': 50,
    'Mantra japp': 0.1 // 10 japps = 1 point
  };

  // Calculate points for a task
  const calculateTaskPoints = (taskName, count) => {
    if (taskName === 'Mantra japp') {
      return Math.floor(count / 10);
    }
    const basePoints = taskPoints[taskName] || 1;
    return basePoints * count;
  };

  // Handle task changes
  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    
    if (field === 'task' && value !== 'other') {
      updatedTasks[index].points = taskPoints[value] || 1;
    }
    
    setTasks(updatedTasks);
  };

  // Add new task field
  const addNewTask = () => {
    setTasks([...tasks, { task: '', points: 1, count: 1 }]);
  };

  // Remove task field
  const removeTask = (index) => {
    if (tasks.length > 1) {
      const updatedTasks = tasks.filter((_, i) => i !== index);
      setTasks(updatedTasks);
    }
  };

  // Submit tasks to server
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', { 
        name: name || user.name,
        tasks 
      });
      
      // Reset form and refresh data
      setName('');
      setTasks([{ task: '', points: 1, count: 1 }]);
      fetchData();
    } catch (err) {
      console.error('Failed to submit tasks:', err);
    }
  };

  // Fetch data from server
  const fetchData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [tasksRes, leaderboardRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/leaderboard')
      ]);

      const sortedUsers = leaderboardRes.data
        .map(u => ({
          name: u.name,
          points: u.points,
          tasks: u.tasks || []
        }))
        .sort((a, b) => b.points - a.points);

      setUsers(sortedUsers);
      setTodayWinner(sortedUsers[0]);
      setLastResetDate(today.toDateString());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [token, navigate]);

  return (
    <div className="main-container">
      <header>
        <h1>Bhajan Bank</h1>
        <p>Last reset: {lastResetDate}</p>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="content">
        <div className="form-section">
          <h2>Add Today's Tasks</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={name || user?.name || ''}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {tasks.map((taskItem, index) => (
              <div key={index} className="task-group">
                <div className="task-header">
                  <h3>Task {index + 1}</h3>
                  {tasks.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeTask(index)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Task Type</label>
                  <select
                    value={taskItem.task}
                    onChange={(e) => handleTaskChange(index, 'task', e.target.value)}
                    required
                  >
                    <option value="">Select a task</option>
                    {Object.keys(taskPoints).map((taskName) => (
                      <option key={taskName} value={taskName}>{taskName}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{taskItem.task === 'Mantra japp' ? 'Number of Japps' : 'Count'}</label>
                  <input
                    type="number"
                    min="1"
                    value={taskItem.count}
                    onChange={(e) => handleTaskChange(index, 'count', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Points {taskItem.task !== 'other' ? `(auto: ${taskPoints[taskItem.task] || 1})` : ''}</label>
                  <input
                    type="number"
                    min="1"
                    value={taskItem.points}
                    onChange={(e) => handleTaskChange(index, 'points', parseInt(e.target.value) || 1)}
                    disabled={taskItem.task && taskItem.task !== 'other'}
                    required
                  />
                </div>

                <div className="points-display">
                  {taskItem.task === 'Mantra japp' ? (
                    <span>{taskItem.count} japps = {Math.floor(taskItem.count / 10)} points</span>
                  ) : (
                    <span>Total: {taskItem.count} × {taskItem.points} = {taskItem.count * taskItem.points} points</span>
                  )}
                </div>
              </div>
            ))}

            <button 
              type="button" 
              onClick={addNewTask}
              className="add-task-btn"
            >
              + Add Another Task
            </button>

            <button type="submit" className="submit-btn">
              Submit All Tasks
            </button>
          </form>

          {todayWinner && (
            <div className="winner-section">
              <h3>🏆 Today's Leader</h3>
              <div className="winner-info">
                <span>{todayWinner.name}</span>
                <span className="points">{todayWinner.points} points</span>
              </div>
            </div>
          )}
        </div>

        <div className="leaderboard-section">
          <h2>Current Leaderboard</h2>
          {users.length > 0 ? (
            <ul className="leaderboard">
              {users.map((user, index) => (
                <li key={index} className={index === 0 ? 'leader' : ''}>
                  <span className="rank">{index + 1}.</span>
                  <span className="name">{user.name}</span>
                  <span className="points">{user.points} pts</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-entries">No entries yet. Complete tasks to appear on the leaderboard!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Data;