import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Import components
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import TokenList from './components/TokenList';
import TokenDetails from './components/TokenDetails';
import CreateToken from './components/CreateToken';
import MyTokens from './components/MyTokens';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tokens" element={<TokenList />} />
            <Route path="/tokens/:id" element={<TokenDetails />} />
            <Route path="/create" element={<CreateToken />} />
            <Route path="/my-tokens" element={<MyTokens />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;