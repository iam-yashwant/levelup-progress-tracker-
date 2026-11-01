import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import StudentView from './views/StudentView';
import FacultyView from './views/FacultyView';
import MentorView from './views/MentorView';
import ParentView from './views/ParentView';
import HodView from './views/HodView';
import LeaderboardView from './views/LeaderboardView';
import Toast from './components/Toast';
import MongoSchemaModal from './components/MongoSchemaModal';
import { initialStudentData } from './data/mockData';
import { useAuth } from './context/AuthContext';
import { DEMO_USERS } from './data/demoUsers';

export default function App() {
  const { 
    isAuthenticated, 
    currentUser, 
    role: authRole, 
    login, 
    logout 
  } = useAuth();

  const [currentRole, setCurrentRole] = useState(authRole || 'student');
  const [activeTab, setActiveTab] = useState('overview');
  const [studentData, setStudentData] = useState(initialStudentData);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Synchronize role state if auth role changes
  useEffect(() => {
    if (authRole && authRole !== currentRole) {
      setCurrentRole(authRole);
    }
  }, [authRole]);

  // Set default tab when role changes
  const setDefaultTabForRole = (role) => {
    if (role === 'student') setActiveTab('overview');
    else if (role === 'faculty') setActiveTab('attendance');
    else if (role === 'mentor') setActiveTab('roster');
    else if (role === 'parent') setActiveTab('child-overview');
    else if (role === 'hod') setActiveTab('hod-overview');
  };

  const [notifications, setNotifications] = useState([
    {
      title: 'Midterm Marks Uploaded',
      message: 'Prof. Vikram Sen uploaded CS601 Distributed Systems marks.',
      time: '12m ago'
    },
    {
      title: 'Mentor Session Scheduled',
      message: 'Dr. Arvind Swaminathan set your next review for Nov 2.',
      time: '2h ago'
    },
    {
      title: 'Attendance Standing Update',
      message: 'Overall attendance reached 87.5% - Good Standing.',
      time: 'Yesterday'
    }
  ]);

  const showToast = (toastData) => {
    setToast(toastData);
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToast(prev => (prev === toastData ? null : prev));
    }, 4000);
  };

  const handleLogin = (userProfile) => {
    const loggedUser = login(userProfile);
    const targetRole = loggedUser.role || 'student';
    setCurrentRole(targetRole);
    setDefaultTabForRole(targetRole);

    showToast({
      type: 'success',
      title: `Logged in as ${loggedUser.roleLabel || targetRole.toUpperCase()}`,
      message: `Welcome back, ${loggedUser.name}! Session securely authenticated.`
    });
  };

  const handleLogout = () => {
    logout();
    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'Your session has ended. Select a role credentials pill to log in again.'
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    showToast({
      type: 'info',
      title: 'Notifications Cleared',
      message: 'All unread notifications marked as read.'
    });
  };

  // Auth Guard: If not authenticated, render ONLY LoginView
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
        <LoginView onLogin={handleLogin} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // Active user details
  const activeUser = currentUser || DEMO_USERS[currentRole] || DEMO_USERS.student;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Header Navbar with Logout and Active Role Info (No direct switcher dropdown) */}
      <Navbar 
        currentRole={currentRole} 
        currentUser={activeUser}
        onLogout={handleLogout}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Modern Sidebar Navigation */}
        <Sidebar 
          currentRole={currentRole} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />

        {/* Dynamic Role Views Content Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <div key={`${currentRole}-${activeTab}`} className="animate-fadeIn">
            {activeTab === 'leaderboard' ? (
              <LeaderboardView 
                studentData={studentData}
                currentRole={currentRole}
                onShowToast={showToast}
                onBack={() => setDefaultTabForRole(currentRole)}
              />
            ) : (
              <>
                {currentRole === 'student' && (
                  <StudentView 
                    studentData={studentData} 
                    setStudentData={setStudentData}
                    onShowToast={showToast}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                )}

                {currentRole === 'faculty' && (
                  <FacultyView 
                    studentData={studentData}
                    setStudentData={setStudentData}
                    onShowToast={showToast}
                  />
                )}

                {currentRole === 'mentor' && (
                  <MentorView 
                    onShowToast={showToast}
                  />
                )}

                {currentRole === 'parent' && (
                  <ParentView 
                    studentData={studentData}
                    onShowToast={showToast}
                  />
                )}

                {currentRole === 'hod' && (
                  <HodView 
                    onShowToast={showToast}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Interactive Notification Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* MongoDB Schema Architecture Modal */}
      <MongoSchemaModal 
        isOpen={isSchemaOpen} 
        onClose={() => setIsSchemaOpen(false)} 
      />
    </div>
  );
}
