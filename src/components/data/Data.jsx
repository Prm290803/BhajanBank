import { useState, useEffect } from 'react';
import { useAuth } from '../../Auth/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const taskVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120
    }
  },
  exit: { x: 20, opacity: 0 }
};

const winnerVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

function Data() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([{ task: '', points: 1, count: 1 }]);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());
  const [todayWinner, setTodayWinner] = useState(null);
  const name = user?.name;
  
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
        date: new Date(),       
        tasks                     
      });
      setTasks([{ task: '', points: 1, count: 1 }]);
      fetchData();
    } catch (err) {
      console.error('Failed to submit tasks:', err);
    }
  };

  // Fetch data from server
  const fetchData = async () => {
    try {
      const tasksRes = await fetch('http://localhost:5000/api/tasks', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      }).then(res => res.json());

      const userMap = {};
      tasksRes.forEach(entry => {
        const userName = entry.user?.name || 'Anonymous';
        if (!userMap[userName]) {
          userMap[userName] = {
            name: userName,
            points: 0,
            count: 0,
          };
        }
        const pointsFromSummary = entry.summary?.grandTotalPoints || 0;
        const countFromSummary = entry.summary?.totalCount || 0;
        userMap[userName].points += pointsFromSummary;
        userMap[userName].count += countFromSummary;
        if (Array.isArray(entry.tasks)) {
          entry.tasks.forEach(task => {
            userMap[userName].points += task.points || 0;
            userMap[userName].count = task.count || 1;
          });
        }
      });

      const sortedUsers = Object.values(userMap).sort((a, b) => b.points - a.points);
      setUsers(sortedUsers);
      setTodayWinner(sortedUsers[0] || null);
    } catch (err) {
      console.error('Fetch error:', err);
      setUsers([]);
      setTodayWinner(null);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [token, navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <motion.h1 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-indigo-700"
            >
              Bhajan Bank
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600"
            >
              A place to track your bhajan progress
            </motion.p>
            <p className="text-gray-600">Last reset: {lastResetDate}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </motion.button>
        </motion.header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Form Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <motion.h2 
              whileHover={{ scale: 1.02 }}
              className="text-2xl font-semibold mb-4 text-gray-800"
            >
              Add Today's Tasks
            </motion.h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {user?.name && (
                <motion.h2 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="text-2xl font-semibold text-center text-indigo-700 mb-6"
                >
                  Welcome back, {user.name}! 🎉
                </motion.h2>
              )}

              <AnimatePresence>
                {tasks.map((taskItem, index) => (
                  <motion.div
                    key={index}
                    variants={taskVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="border-b border-gray-200 pb-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-700">Task {index + 1}</h3>
                      {tasks.length > 1 && (
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button" 
                          onClick={() => removeTask(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          × Remove
                        </motion.button>
                      )}
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }}>
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
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.01 }}>
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
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.01 }}>
                      <label className="block text-gray-700 mb-2">
                        Points {taskItem.task !== 'other' ? `(auto: ${taskPoints[taskItem.task] || 1})` : ''}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={taskItem.count * taskItem.points}
                        onChange={(e) => handleTaskChange(index, 'points', parseInt(e.target.value) || 1)}
                        disabled={taskItem.task && taskItem.task !== 'other'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                        required
                      />
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-blue-50 p-3 rounded-lg text-blue-700"
                    >
                      {taskItem.task === 'Mantra japp' ? (
                        <span>{taskItem.count} japps = {Math.floor(taskItem.count / 10)} points</span>
                      ) : (
                        <span>Total: {taskItem.count} × {taskItem.points} = {taskItem.count * taskItem.points} points</span>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" 
                onClick={addNewTask}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Another Task
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Submit All Tasks
              </motion.button>
            </form>

            {todayWinner && (
              <motion.div 
                variants={winnerVariants}
                className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-yellow-800">🏆 Today's Leader</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">{todayWinner.name}</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                    {todayWinner.points} points
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Leaderboard Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <motion.h2 
              whileHover={{ scale: 1.02 }}
              className="text-2xl font-semibold mb-4 text-gray-800"
            >
              Current Leaderboard
            </motion.h2>
            {users.length > 0 ? (
              <motion.ul 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {users.map((user, index) => (
                  <motion.li 
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      index === 0 ? 'bg-blue-50 border border-blue-200' : 'border-b border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {index === 0 && (
                        <motion.span 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="text-yellow-500"
                        >
                          👑
                        </motion.span>
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
                    <motion.span 
                      whileHover={{ scale: 1.1 }}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-semibold"
                    >
                      {user?.points} pts
                    </motion.span>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 py-4"
              >
                No entries yet. Complete tasks to appear on the leaderboard!
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Data;