import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './layouts/DashboardLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Verify from './pages/Verify';

function App() {
  return (
    <BrowserRouter>
      {/* Background shapes for animation/depth */}
      <div className="fixed inset-0 min-h-screen z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]"></div>
      </div>

      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow pt-20 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />

            {/* Dashboard routes wrapped in DashboardLayout */}
            <Route path="/admin" element={
              <DashboardLayout role="admin">
                <AdminDashboard />
              </DashboardLayout>
            } />
            <Route path="/student" element={
              <DashboardLayout role="student">
                <StudentDashboard />
              </DashboardLayout>
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
