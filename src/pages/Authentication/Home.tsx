import React from 'react';
import { ArrowRight, Gavel, Timer, Shield, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 animate-fade-in">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-100">
              Discover Unique Treasures at BidHub
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-primary-100">
              Your premier destination for online auctions. Bid, win, and collect amazing items from trusted sellers worldwide.
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button variant="secondary" size="lg" icon={<Gavel size={20} />}>
                    Start Bidding
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="primary" size="lg" className="border-white text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/profile">
                <Button variant="secondary" size="lg" icon={<TrendingUp size={20} />}>
                  View Active Bids
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BidHub?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience the thrill of bidding in a secure and user-friendly environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-md p-8 transition-all hover:shadow-lg hover:scale-105">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-3 rounded-full w-fit mb-6">
              <Timer className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Real-Time Bidding</h3>
            <p className="text-gray-600 mb-4">
              Experience the excitement of live auctions with real-time updates and instant notifications.
            </p>
            <a href="#" className="text-primary-600 font-medium flex items-center hover:text-primary-700 transition-colors">
              How it works <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-md p-8 transition-all hover:shadow-lg hover:scale-105">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-3 rounded-full w-fit mb-6">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure Transactions</h3>
            <p className="text-gray-600 mb-4">
              Bid with confidence knowing your transactions are protected by our secure payment system.
            </p>
            <a href="#" className="text-primary-600 font-medium flex items-center hover:text-primary-700 transition-colors">
              Our security <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-md p-8 transition-all hover:shadow-lg hover:scale-105">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-3 rounded-full w-fit mb-6">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Smart Bidding</h3>
            <p className="text-gray-600 mb-4">
              Set your maximum bid and let our system automatically bid for you to ensure you never miss out.
            </p>
            <a href="#" className="text-primary-600 font-medium flex items-center hover:text-primary-700 transition-colors">
              Learn more <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-gradient-radial from-primary-50 to-accent-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Ready to start bidding?</h2>
                <p className="mt-3 max-w-3xl text-primary-100">
                  Join thousands of collectors and enthusiasts who have found their perfect items through our platform.
                </p>
              </div>
              <div className="mt-8 md:mt-0">
                {!isAuthenticated ? (
                  <Link to="/register">
                    <Button variant="secondary" size="lg" icon={<Gavel size={20} />}>
                      Start Bidding Now
                    </Button>
                  </Link>
                ) : (
                  <Link to="/profile">
                    <Button variant="secondary" size="lg" icon={<TrendingUp size={20} />}>
                      View Auctions
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;