import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="flex justify-center gap-8 mb-6">
            <button className="hover:text-green-400 transition-colors">Privacy</button>
            <button className="hover:text-green-400 transition-colors">Terms</button>
            <button className="hover:text-green-400 transition-colors">Support</button>
            <button className="hover:text-green-400 transition-colors">About</button>
          </div>
          <p className="text-sm text-gray-400">
            © 2025 AgriChain. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
