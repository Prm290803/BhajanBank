// src/components/Home.jsx
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  return (
    <div className="h-screen flex  flex-col justify-center  items-center bg-white ">
      <h1 className="Hed text-5xl text-green-500 font-bold mb-4">Hello, Welcome to Bhajan Bank </h1>
      <Link to="/data">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Data Page
        </button>
      </Link>
    </div>
  );
}

export default Home;