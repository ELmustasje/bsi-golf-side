import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import React from 'react';
import GolfSimulatorTable from './components/GolfSimulatorTable.tsx';
import AdminComponent from './components/AdminComponent.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GolfSimulatorTable />} />
        <Route path="/admin" element={<div>
          <AdminComponent /> <GolfSimulatorTable />
        </div>} />

      </Routes>

    </Router>

  );
}

export default App;
