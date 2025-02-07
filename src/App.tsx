import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import React from 'react';
import GolfSimulatorTable from './components/GolfSimulatorTable.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GolfSimulatorTable />} />

      </Routes>

    </Router>

  );
}

export default App;
