import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GradePredictor from './GradePredictor';
import GradesChart from './GradesChart';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GradePredictor />} />
        <Route path="/chart" element={<GradesChart />} />
      </Routes>
    </Router>
  );
}

export default App;