import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Data from './components/data/Data';
import { AuthProvider } from './Auth/AuthContext'; // ✅ Correct import

function App() {
  return (
    <AuthProvider> {/* ✅ Wrap your app in AuthProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/data" element={<Data />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
