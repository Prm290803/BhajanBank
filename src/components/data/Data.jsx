import { useState, useEffect } from 'react';
import { useAuth } from '../../Auth/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  // const calculateTaskPoints = (taskName, count) => {
  //   if (taskName === 'Mantra japp') {
  //     return Math.floor(count / 10);
  //   }
  //   const basePoints = taskPoints[taskName] || 1;
  //   return basePoints * count;
  // };

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
   await axios.post('http://localhost:5000/api/tasks', {
      name: name || user.name,  
      date: new Date(),       
      tasks                     
    });

    // Reset form and refresh
    setName('');
    setTasks([{ task: '', points: 1, count: 1 }]);
    fetchData();

  } catch (err) {
    console.error('Failed to submit tasks:', err);
  }
};
const [temp,setTemp] = useState()
  // Fetch data from server
const fetchData = async () => {
  try {
    const [tasksRes, leaderboardRes] = await Promise.all([
      // fetch('http://localhost:5000/api/leaderboard', { method:'GET', headers: { 'Authorization': `Bearer ${token}` }, credentials:'include' }),
      fetch('http://localhost:5000/api/tasks', {method:'GET', headers: { 'Authorization': `Bearer ${token}` },credentials:'include'  }).then(response => {return response.json()})
    ]);



//   method: 'GET',
//   headers: {
//     'Authorization': `Bearer ${token}`,
//   },
//   credentials: 'include' // This ensures cookies (or session tokens) are included
// })
// .then(response => response.json())
// .then(data => console.log(data))
// .catch(error => console.error('Error:', error));

    console.log(tasksRes,'This is the leaderboard Res',token)

    const leaderboardData = Array.isArray(tasksRes) 
      ? tasksRes 
      : [''];
    console.log(leaderboardData,'Thisi the something expecxted');
    
  const sortedUsers = leaderboardData.map(u => ({
  name: u.user?.name || 'Anonymous',  // Optional chaining for safety
  points: u.summary?.grandTotalPoints || 0,
  count: u.tasks?.length || 0,
  // Add if you want to show tasks count too:
  tasksCount: u.summary?.totalCount || 0,
})).sort((a, b) => b.points - a.points);

    
    let tempData = leaderboardData.reduce((acc,curr) => {
      const user = curr.user.name
      if(!acc[user]) {
        acc[user] = {name:user, total: 0, count:0}
      }

      curr.tasks.forEach(task=> {
        acc[user].total +=task.points
      })
      curr.tasks.forEach(task =>{
        acc[user].count = task.count
      })

      return acc
    }, {})

    console.log(tempData, 'This are the sorted users ')
    setUsers(sortedUsers);
    setTodayWinner(sortedUsers[0] || null);
    
  } catch (err) {
    console.error('Fetch error:', err);
    setUsers([]);   
    setTodayWinner(null);
  }
};
// const fetchData = async () => {
//   try {
//     console.log('Fetching leaderboard data...');
//     const leaderboardRes = await axios.get('/api/leaderboard', {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     console.log('Raw leaderboard response:', leaderboardRes);

//     const leaderboardData = Array.isArray(leaderboardRes?.data) 
//       ? leaderboardRes.data 
//       : [];

//     console.log('Processed leaderboard data:', leaderboardData);

//     const sortedUsers = leaderboardData.map(u => ({
//       name: u.name || 'Anonymous',
//       points: u.points || 0,
//       count: u.count || 0
//     })).sort((a, b) => b.points - a.points);

//     setUsers(sortedUsers);
//     setTodayWinner(sortedUsers[0] || null);
    
//   } catch (err) {
//     console.error('Fetch error:', err.response?.data || err.message);
//     setUsers([]);
//     setTodayWinner(null);
//   }
// };

  // Redirect to login if not logined
  //     fetch('http://localhost:5000/api/tasks', {
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [token, navigate]);
 

  // Load data from localStorage
  const loadData = () => {
    const storedUsers = localStorage.getItem('bhajanBankUsers');
    const storedResetDate = localStorage.getItem('bhajanBankLastReset');
    
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      setUsers(parsedUsers);
      setTodayWinner(parsedUsers[0]);
    }
    
    if (storedResetDate) {
      setLastResetDate(storedResetDate);
    }
  };

  // Reset leaderboard
  const resetLeaderboard = () => {
    setUsers([]);
    setTodayWinner(null);
    setLastResetDate(new Date().toDateString());
    localStorage.removeItem('bhajanBankUsers');
    localStorage.setItem('bhajanBankLastReset', new Date().toDateString());
  };

 

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">Bhajan Bank</h1>
            <p className="text-gray-600">A place to track your bhajan progress</p>
            <p className="text-gray-600">Last reset: {lastResetDate}</p>
            <div className="bg-red-50 p-4 my-4">
                  <h3 className="font-bold">Debug Info</h3>
                  <pre>Users: {JSON.stringify(users, null, 2)}</pre>
                  <pre>Today's Winner: {JSON.stringify(todayWinner, null, 2)}</pre>
                </div>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
          
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Add Today's Tasks</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="block text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  value={name || user?.name || ''}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              {tasks?.map((taskItem, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">Task {index + 1}</h3>
                    {tasks?.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeTask(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        × Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Task Type</label>
                    <select
                      value={taskItem.task}
                      onChange={(e) => handleTaskChange(index, 'task', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a task</option>
                      {Object.keys(taskPoints).map((taskName) => (
                        <option key={taskName} value={taskName}>{taskName}</option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      {taskItem.task === 'Mantra japp' ? 'Number of Japps' : 'Count'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={taskItem.count}
                      onChange={(e) => handleTaskChange(index, 'count', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Points {taskItem.task !== 'other' ? `(auto: ${taskPoints[taskItem.task] || 1})` : ''}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={ taskItem.count * taskItem.points}
                      onChange={(e) => handleTaskChange(index, 'points', parseInt(e.target.value) || 1)}
                      disabled={taskItem.task && taskItem.task !== 'other'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg text-blue-700">
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Another Task
              </button>

              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Submit All Tasks
              </button>
            </form>

            {todayWinner && (
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800">🏆 Today's Leader</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">{todayWinner.name}</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                    {todayWinner.points} points
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Current Leaderboard</h2>
            {users.length > 0 ? (
              <ul className="space-y-3">
                {users.map((user, index) => (
                  <li 
                    key={index} 
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      index === 0 ? 'bg-blue-50 border border-blue-200' : 'border-b border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {index === 0 && (
                        <span className="text-yellow-500">👑</span>
                      )}
                      <div>
                        <span className={`font-medium ${
                          index === 0 ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {user.name}
                        </span>
                        <div className="text-sm text-gray-500">
                          {user?.count} tasks today
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-semibold">
                      {user?.points} pts
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-4">No entries yet. Complete tasks to appear on the leaderboard!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Data;