import './App.css';
import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Data from './components/data/Data';
import { AuthProvider } from '../src/Auth/AuthContext'; // ✅ Correct import
import Login from './components/Login/Login';
import Register from '../src/components/register/register'



function App() {
  return (
    <AuthProvider> {/* ✅ Wrap your app in AuthProvider */}
      <Router basename='/'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/data" element={<Data />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
