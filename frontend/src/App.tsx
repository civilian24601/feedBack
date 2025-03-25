import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { UploadPage } from './pages/UploadPage'
import { useAuth } from './hooks/useAuth'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'

function App() {
  const { user, signOut } = useAuth()

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-[#111827]">
                    FeedBack
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/upload"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-[#111827]"
                  >
                    Upload Track
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#6366F1] hover:bg-[#6366F1]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366F1]"
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#6366F1] hover:bg-[#6366F1]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366F1]"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="inline-flex items-center px-4 py-2 border border-[#6366F1] text-sm font-medium rounded-md text-[#6366F1] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366F1]"
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
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
