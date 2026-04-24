import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleAuth = (tab) => {
    navigate(`/auth?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                🌱
              </div>
              <span className="text-xl font-bold text-gray-900">GramOS</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleAuth("login")}
                className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => handleAuth("signup")}
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-emerald-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            India's Rural
            <span className="text-green-600"> Economic OS</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Empowering farmers, retailers, consumers, and workers through a unified
            digital ecosystem. Connect, trade, and grow with GramOS.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleAuth("signup")}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => handleAuth("login")}
              className="px-8 py-3 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What is GramOS?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              GramOS is a comprehensive platform designed to revolutionize rural
              India's economy by connecting all stakeholders in the agricultural
              supply chain through technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 mb-6">
                To bridge the digital divide in rural India by providing a
                unified platform that enables seamless transactions, real-time
                communication, and access to market intelligence for all
                stakeholders in the agricultural ecosystem.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">
                    Direct farmer-to-consumer connections
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">
                    Real-time price tracking and prediction
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">
                    Multilingual support for rural accessibility
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">
                    QR-based product traceability
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🌾</div>
              <p className="text-gray-700 font-medium">
                "Transforming rural commerce through technology"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to succeed in the rural economy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                📦
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Product Traceability
              </h3>
              <p className="text-gray-600">
                Track products from farm to consumer with QR-based scanning and
                complete supply chain transparency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                💬
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-time Chat
              </h3>
              <p className="text-gray-600">
                Connect instantly with farmers, retailers, and consumers through
                integrated messaging system.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                📊
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Market Intelligence
              </h3>
              <p className="text-gray-600">
                Access AI-powered price predictions and market trends to make
                informed decisions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                💳
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Integrated Razorpay payment gateway for secure and seamless
                transactions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                🤖
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Chatbot
              </h3>
              <p className="text-gray-600">
                Multilingual AI assistant powered by Dialogflow and Gemini for
                instant support.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                💼
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Workforce Marketplace
              </h3>
              <p className="text-gray-600">
                Find jobs, offer services, and build skills through our
                integrated workforce platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Everyone
            </h2>
            <p className="text-lg text-gray-600">
              Tailored dashboards for each role in the ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl mb-3">🌾</div>
              <h3 className="font-semibold text-gray-900 mb-2">Farmers</h3>
              <p className="text-sm text-gray-600">
                Manage produce, track inventory, access markets
              </p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl mb-3">🏪</div>
              <h3 className="font-semibold text-gray-900 mb-2">Retailers</h3>
              <p className="text-sm text-gray-600">
                Browse products, manage inventory, track orders
              </p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl mb-3">🛒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Consumers</h3>
              <p className="text-sm text-gray-600">
                Scan products, trace origins, shop fresh
              </p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <div className="text-4xl mb-3">👷</div>
              <h3 className="font-semibold text-gray-900 mb-2">Workers</h3>
              <p className="text-sm text-gray-600">
                Find jobs, build skills, earn livelihoods
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Rural Business?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of users already using GramOS to grow their business.
          </p>
          <button
            onClick={() => handleAuth("signup")}
            className="px-8 py-3 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
              🌱
            </div>
            <span className="text-lg font-bold text-white">GramOS</span>
          </div>
          <p className="text-sm">
            India's Rural Economic OS - Connecting the unconnected
          </p>
        </div>
      </footer>
    </div>
  );
}
