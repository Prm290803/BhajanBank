import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  // Set axios defaults and fetch user data when token changes
  // Beow useEffect used to automatically login the user after registeration 
  
 useEffect(() => {
  if (token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Fetch user details
    axios.get('http://localhost:5000/api/user')
      .then(res => {
        setUser(res.data);
      })
      .catch(err => {
        console.error('Failed to fetch user:', err);
        logout(); // Remove invalid token
      })
      .finally(() => setLoading(false));
  } else {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setLoading(false);
  }
}, [token]);


const login = async (email, password) => {
console.log(email, password);  
try {
  console.log('Here asre ......')
    const res = await axios.post('http://localhost:5000/api/login', { email, password });
    console.log(email, password,res); 
    // Store token and user
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    
    return { success: true, user: res.data.user };
  } catch (err) {
    return {
      
      success: false,
      message: err.response?.data?.message || 'Login failed'
    };
  }
};

  const register = async (name, email, password) => {
  try {
    const res = await axios.post('http://localhost:5000/api/register', {
      name,
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(res, 'This is the middleware')
    setToken(res.data.token);
    setUser(res.data.user);
    return { success: true };
  } catch (err) {
    const errorMessage = err?.response?.data?.error || "Registration failed. Please try again.";
    console.error("API Error:", err?.response?.data);
    return { success: false, message: errorMessage };
  }
};

  const logout = () => {
    setToken(null);
    setUser(null);
    // navigate('/login'); // Redirect to login page after logout
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}  