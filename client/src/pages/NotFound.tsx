import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white font-sans">
      <div className="text-center p-8 bg-white bg-opacity-10 rounded-lg shadow-lg">
        <h1 className="text-8xl m-0 bg-gradient-to-r from-red-400 to-teal-400 bg-clip-text text-transparent">404</h1>
        <h2 className="text-2xl my-4 text-gray-100">Page Not Found</h2>
        <p className="text-lg mb-8 text-gray-400">Sorry, we couldn't find the page you're looking for.</p>
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-teal-500 text-white no-underline rounded text-base transition-colors duration-300 hover:bg-teal-600"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound