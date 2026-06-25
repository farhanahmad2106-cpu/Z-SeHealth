import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../context/UserProfileContext';
import { User, Mail, Calendar, Activity, Shield, Edit2 } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const { healthProfile, preferences, updateHealthProfile, updatePreferences } = useUserProfile();
  
  const [isEditingHealth, setIsEditingHealth] = React.useState(false);
  const [localHealth, setLocalHealth] = React.useState(healthProfile);
  
  const handleSaveHealth = async () => {
    await updateHealthProfile(localHealth);
    setIsEditingHealth(false);
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Please Log In</h2>
        <p className="text-gray-400">You need to be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-outfit font-bold text-white mb-8 flex items-center gap-3">
        <User className="w-8 h-8 text-emerald-500" />
        Personal Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center overflow-hidden mb-4 relative">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
            <button className="absolute bottom-0 inset-x-0 bg-black/60 hover:bg-black/80 text-white text-xs py-1 transition-colors flex items-center justify-center gap-1">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-1">
            {currentUser.displayName || 'No Name Set'}
          </h3>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mb-4">
            <Mail className="w-4 h-4" /> {currentUser.email}
          </p>
          
          <div className="w-full pt-4 border-t border-slate-800 flex justify-between text-sm">
            <div className="text-center w-full">
              <p className="text-gray-400 mb-1">Status</p>
              <p className="font-bold text-emerald-400 flex items-center justify-center gap-1">
                <Shield className="w-4 h-4" /> Active
              </p>
            </div>
            <div className="w-px bg-slate-800"></div>
            <div className="text-center w-full">
              <p className="text-gray-400 mb-1">Joined</p>
              <p className="font-bold text-white flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4" /> {new Date(currentUser.metadata.creationTime || Date.now()).getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Health Information Placeholder */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Health Profile Overview
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-sm text-gray-400 mb-1">Age</p>
                {isEditingHealth ? (
                  <input type="number" value={localHealth.age} onChange={e => setLocalHealth({...localHealth, age: e.target.value})} className="w-full bg-slate-700 rounded px-2 py-1 text-white" />
                ) : (
                  <p className="text-lg font-bold text-white">{healthProfile.age || '--'}</p>
                )}
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-sm text-gray-400 mb-1">Gender</p>
                {isEditingHealth ? (
                  <select value={localHealth.gender} onChange={e => setLocalHealth({...localHealth, gender: e.target.value})} className="w-full bg-slate-700 rounded px-2 py-1 text-white">
                    <option value="">--</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-lg font-bold text-white">{healthProfile.gender || '--'}</p>
                )}
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-sm text-gray-400 mb-1">Height (cm)</p>
                {isEditingHealth ? (
                  <input type="number" value={localHealth.height} onChange={e => setLocalHealth({...localHealth, height: e.target.value})} className="w-full bg-slate-700 rounded px-2 py-1 text-white" />
                ) : (
                  <p className="text-lg font-bold text-white">{healthProfile.height ? `${healthProfile.height} cm` : '--'}</p>
                )}
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-sm text-gray-400 mb-1">Weight (kg)</p>
                {isEditingHealth ? (
                  <input type="number" value={localHealth.weight} onChange={e => setLocalHealth({...localHealth, weight: e.target.value})} className="w-full bg-slate-700 rounded px-2 py-1 text-white" />
                ) : (
                  <p className="text-lg font-bold text-white">{healthProfile.weight ? `${healthProfile.weight} kg` : '--'}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              {isEditingHealth ? (
                <div className="flex gap-2">
                  <button onClick={handleSaveHealth} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                    Save Changes
                  </button>
                  <button onClick={() => { setIsEditingHealth(false); setLocalHealth(healthProfile); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => { setLocalHealth(healthProfile); setIsEditingHealth(true); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors border border-slate-700 w-full flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" /> Edit Health Profile
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Dietary Preferences</h3>
              <p className="text-sm text-gray-400">Set your allergies and preferred diet.</p>
            </div>
            <button className="px-4 py-2 text-emerald-400 hover:bg-emerald-500/10 rounded-xl text-sm font-semibold transition-colors">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
