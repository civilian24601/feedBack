import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { MatchmakingMonitor } from '../components/MatchmakingMonitor'

// List of admin user IDs
const ADMIN_IDS = [
  '0d342573-7da1-40ec-87fa-df1c736d0878',  // alex.richard.hayes@gmail.com
  'ed6a86a9-5e4f-4ff1-836b-8d9504bb0cbd'   // civilian24601@protonmail.ch
]

export const AdminPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect non-admin users
    if (!user || !ADMIN_IDS.includes(user.id)) {
      navigate('/')
    }
  }, [user, navigate])

  if (!user || !ADMIN_IDS.includes(user.id)) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Matchmaking System</h2>
          <MatchmakingMonitor />
        </section>

        {/* Add more admin sections here */}
      </div>
    </div>
  )
} 