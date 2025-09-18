import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { useAppContext } from '../context/AppContext';

const GeminiApiPage: React.FC = () => {
  const { apiKey, setApiKey } = useAppContext();
  const [inputKey, setInputKey] = useState('');

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      setApiKey(inputKey.trim());
      setInputKey('');
    }
  };

  const handleClearKey = () => {
    setApiKey(null);
  };

  return (
    <div className="p-4 md:p-8 text-gray-300 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Manage Gemini API Key</h1>

      <div className="space-y-8">
        <div className="bg-black border border-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-500 mb-3">Enter Your API Key</h2>
          <p className="mb-4">
            To use the AI features of this application, you need to provide your own Google Gemini API key.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Enter your Gemini API Key"
              className="flex-grow bg-gray-900 text-white p-2 rounded-md border border-gray-700 focus:ring-red-500 focus:border-red-500 font-mono"
            />
            <button
              onClick={handleSaveKey}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              <Icon name="gemini" className="w-5 h-5" />
              <span>Save Key</span>
            </button>
          </div>

          {apiKey ? (
            <div className="text-green-400 flex items-center gap-2">
              <span>API Key is set.</span>
              <button
                onClick={handleClearKey}
                className="text-sm text-red-500 hover:underline"
              >
                Clear Key
              </button>
            </div>
          ) : (
            <p className="text-yellow-400">API Key is not set.</p>
          )}
        </div>

        <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-200 mb-3">Security Warning</h2>
          <p>
            Your API key will be stored in your browser's local storage. This is not a secure method for storing sensitive information. Please be aware of the following:
          </p>
          <ul className="list-disc list-inside mt-2 pl-2">
            <li>Do not use this application on a shared or public computer.</li>
            <li>Anyone with access to your browser's developer tools may be able to view your key.</li>
            <li>Consider creating a new, restricted API key specifically for this application and deleting it when you are finished.</li>
          </ul>
        </div>
        
        <div className="bg-black border border-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-500 mb-3">Get Your Own API Key</h2>
          <p className="mb-4">
            You can get your own free Gemini API key from Google AI Studio. Click the button below to get started.
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            <Icon name="key" className="w-5 h-5" />
            <span>Get a Gemini API Key</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default GeminiApiPage;