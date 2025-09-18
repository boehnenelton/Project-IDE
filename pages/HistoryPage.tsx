import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Editor from '../components/Editor';
import type { Interaction } from '../types';

const HistoryPage: React.FC = () => {
  const { interactions } = useAppContext();
  const [selectedProfile, setSelectedProfile] = useState<string>('All Profiles');
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);

  const profileNames = useMemo(() => {
    const names = new Set(interactions.map(i => i.profileName));
    return ['All Profiles', ...Array.from(names)];
  }, [interactions]);

  const filteredInteractions = useMemo(() => {
    if (selectedProfile === 'All Profiles') {
      return interactions;
    }
    return interactions.filter(i => i.profileName === selectedProfile);
  }, [interactions, selectedProfile]);

  const selectedInteraction = useMemo(() => {
    return interactions.find(i => i.id === selectedInteractionId);
  }, [interactions, selectedInteractionId]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProfile(e.target.value);
    setSelectedInteractionId(null); // Reset selection when profile changes
  };
  
  const handleInteractionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedInteractionId(e.target.value);
  };

  if (interactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No interaction history yet. Use the Staging page to chat with Gemini.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col h-full">
      <h1 className="text-3xl font-bold text-white mb-6">Interaction History</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="profile-filter" className="block text-sm font-medium text-gray-300 mb-1">
            Filter by AI Profile
          </label>
          <select
            id="profile-filter"
            value={selectedProfile}
            onChange={handleProfileChange}
            className="w-full bg-gray-900 border border-gray-800 rounded-md p-2 text-white focus:ring-red-500 focus:border-red-500"
          >
            {profileNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="interaction-select" className="block text-sm font-medium text-gray-300 mb-1">
            Select Interaction
          </label>
          <select
            id="interaction-select"
            value={selectedInteractionId || ''}
            onChange={handleInteractionChange}
            disabled={filteredInteractions.length === 0}
            className="w-full bg-gray-900 border border-gray-800 rounded-md p-2 text-white focus:ring-red-500 focus:border-red-500 disabled:bg-gray-900/50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>-- Select a prompt --</option>
            {filteredInteractions.map(interaction => (
              <option key={interaction.id} value={interaction.id}>
                {`${new Date(interaction.timestamp).toLocaleString()} - ${interaction.prompt.substring(0, 50)}...`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
        {selectedInteraction ? (
          <>
            <div className="flex flex-col bg-black rounded-lg border border-gray-800 overflow-hidden">
              <div className="p-3 bg-gray-900 text-red-500 font-semibold text-sm flex justify-between items-center">
                <h2>Prompt</h2>
                <div className="text-xs text-gray-400 font-mono">
                  {new Date(selectedInteraction.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="p-2 text-xs text-gray-300 border-b border-gray-800">
                <strong>Profile:</strong> {selectedInteraction.profileName}
                 {selectedInteraction.attachedImageName && (
                  <span className="ml-4"><strong>Attachment:</strong> {selectedInteraction.attachedImageName}</span>
                )}
              </div>
              <div className="flex-1">
                {/* Fix: Added a no-op onChange handler as it's a required prop, even for a read-only editor. */}
                <Editor language="markdown" value={selectedInteraction.prompt} readOnly onChange={() => {}} />
              </div>
            </div>
            <div className="flex flex-col bg-black rounded-lg border border-gray-800 overflow-hidden">
              <h2 className="p-3 bg-gray-900 text-red-500 font-semibold text-sm">Response</h2>
              <div className="flex-1">
                {/* Fix: Added a no-op onChange handler as it's a required prop, even for a read-only editor. */}
                <Editor language="markdown" value={selectedInteraction.response} readOnly onChange={() => {}} />
              </div>
            </div>
          </>
        ) : (
          <div className="md:col-span-2 flex items-center justify-center h-full text-gray-500 bg-black rounded-lg border border-dashed border-gray-800">
            <p>Select an interaction from the dropdowns above to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;