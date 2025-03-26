import { Upload, MessageSquare, Music, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const HomePage = () => {
  const { user } = useAuth()

  const cards = [
    {
      icon: Upload,
      title: 'Upload Track',
      description: 'Share your music for feedback',
      link: '/upload',
      buttonText: 'Upload Now',
      buttonColor: 'bg-[#6366F1]'
    },
    {
      icon: MessageSquare,
      title: 'Give Feedback',
      description: 'Help other artists improve',
      link: '/dashboard',
      buttonText: 'Start Reviewing',
      buttonColor: 'bg-orange-500'
    },
    {
      icon: Music,
      title: 'Your Library',
      description: 'View your tracks and feedback',
      link: '/dashboard',
      buttonText: 'View Library',
      buttonColor: 'bg-[#6366F1]'
    },
    {
      icon: User,
      title: 'Your Profile',
      description: 'Manage your account',
      link: '/profile',
      buttonText: 'View Profile',
      buttonColor: 'bg-orange-500'
    }
  ]

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get Feedback on Your Music
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your tracks and help other artists improve. Join our community of musicians giving and receiving valuable feedback.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link
            to="/signup"
            className="px-6 py-3 bg-[#6366F1] text-white rounded-md hover:bg-[#6366F1]/90 font-medium"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-[#6366F1] text-[#6366F1] rounded-md hover:bg-gray-50 font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-gray-600">What would you like to do today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <div className="p-6 flex flex-col items-center text-center h-full">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${card.buttonColor} bg-opacity-10 mb-4 group-hover:bg-opacity-20 transition-colors duration-200`}>
                <card.icon className={`w-8 h-8 ${card.buttonColor.replace('bg-', 'text-')}`} />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                {card.title}
              </h2>
              <p className="text-gray-600 mb-6 flex-grow">
                {card.description}
              </p>
              <span className={`${card.buttonColor} text-white px-6 py-2 rounded-md inline-block w-full group-hover:opacity-90 transition-opacity duration-200`}>
                {card.buttonText}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 