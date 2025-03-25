import { Upload, Music, MessageSquare, User } from 'lucide-react'

export const HomePage = () => {
  return (
    <main className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Upload Card */}
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center text-center">
            <Upload className="w-12 h-12 text-primary mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold mb-2">Upload Track</h2>
            <p className="text-gray-600 mb-6">Share your music for feedback</p>
            <button className="btn btn-primary w-full">Upload Now</button>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center text-center">
            <MessageSquare className="w-12 h-12 text-primary mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold mb-2">Give Feedback</h2>
            <p className="text-gray-600 mb-6">Help other artists improve</p>
            <button className="btn btn-secondary w-full">Start Reviewing</button>
          </div>
        </div>

        {/* Library Card */}
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center text-center">
            <Music className="w-12 h-12 text-primary mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold mb-2">Your Library</h2>
            <p className="text-gray-600 mb-6">View your tracks and feedback</p>
            <button className="btn btn-primary w-full">View Library</button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center text-center">
            <User className="w-12 h-12 text-primary mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
            <p className="text-gray-600 mb-6">Manage your account</p>
            <button className="btn btn-secondary w-full">View Profile</button>
          </div>
        </div>
      </div>
    </main>
  )
} 