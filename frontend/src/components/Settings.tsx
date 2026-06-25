import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Moon, Sun, Smartphone, Globe, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../context/UserProfileContext';

interface SettingsProps {
  onBack?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { settings, updateSettings } = useUserProfile();
  
  const handleToggleNotifications = async () => {
    await updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  };

  const handleSetDarkMode = async (isDark: boolean) => {
    await updateSettings({ darkMode: isDark });
  };
  
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Please Log In</h2>
        <p className="text-gray-400">You need to be logged in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {onBack && (
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
      )}
      <h2 className="text-3xl font-outfit font-bold text-white mb-8 flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-emerald-500" />
        Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Settings Navigation */}
        <div className="col-span-1 flex flex-col gap-2">
          <button className="text-left px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center gap-3 border border-emerald-500/20">
            <User className="w-5 h-5" /> Account
          </button>
          <button className="text-left px-4 py-3 rounded-xl hover:bg-slate-800 text-gray-300 font-medium flex items-center gap-3 transition-colors">
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button className="text-left px-4 py-3 rounded-xl hover:bg-slate-800 text-gray-300 font-medium flex items-center gap-3 transition-colors">
            <Shield className="w-5 h-5" /> Privacy
          </button>
          <button className="text-left px-4 py-3 rounded-xl hover:bg-slate-800 text-gray-300 font-medium flex items-center gap-3 transition-colors">
            <Smartphone className="w-5 h-5" /> Devices
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          
          {/* Account Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <div className="flex gap-3">
                  <input 
                    type="email" 
                    value={currentUser.email || ''} 
                    disabled 
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white disabled:opacity-50" 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Your email address is managed through your authentication provider.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    defaultValue={currentUser.displayName || ''} 
                    placeholder="Enter your name"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
                    Save
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" />
                Password & Authentication
              </h4>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors border border-slate-700">
                Change Password
              </button>
            </div>
          </div>

          {/* App Preferences */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">App Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Push Notifications</h4>
                  <p className="text-sm text-gray-400">Receive alerts for streaks and meal reminders.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.notificationsEnabled} onChange={handleToggleNotifications} />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    Theme
                  </h4>
                  <p className="text-sm text-gray-400">Toggle dark/light mode for the interface.</p>
                </div>
                <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                  <button 
                    onClick={() => handleSetDarkMode(false)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${!settings.darkMode ? 'bg-slate-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Sun className="w-4 h-4" /> Light
                  </button>
                  <button 
                    onClick={() => handleSetDarkMode(true)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${settings.darkMode ? 'bg-slate-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Moon className="w-4 h-4" /> Dark
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Language</h4>
                  <p className="text-sm text-gray-400">Select your preferred language.</p>
                </div>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors border border-slate-700 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> English
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-950/20 border border-red-900/30 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 rounded-xl text-sm font-bold transition-colors">
              Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
