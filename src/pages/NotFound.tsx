import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-arch-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
      <Link 
        to="/" 
        className="bg-arch-green/20 hover:bg-arch-green/30 text-arch-green px-6 py-3 rounded-full transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
