import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { UploadPage } from './pages/UploadPage'
import { useAuth } from './hooks/useAuth'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { TrackDetailsPage } from './pages/TrackDetailsPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { ProfilePage } from './pages/ProfilePage'
import { GiveFeedbackPage } from './pages/GiveFeedbackPage'
import { LibraryPage } from './pages/LibraryPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  const { user, signOut } = useAuth()

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-[#111827]">
                  FeedBack
                </Link>
                
                {user && (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-[#111827]"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/give-feedback"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-[#111827]"
                    >
                      Give Feedback
                    </Link>
                    <Link
                      to="/library"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-[#111827]"
                    >
                      Library
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="inline-flex items-center px-4 py-2 border border-[#6366F1] text-sm font-medium rounded-md text-[#6366F1] bg-white hover:bg-gray-50"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#6366F1] hover:bg-[#6366F1]/90"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#6366F1] hover:bg-[#6366F1]/90"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="inline-flex items-center px-4 py-2 border border-[#6366F1] text-sm font-medium rounded-md text-[#6366F1] bg-white hover:bg-gray-50"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/give-feedback" element={<GiveFeedbackPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/feedback/:matchId" element={<FeedbackPage />} />
            <Route path="/tracks/:trackId" element={<TrackDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
