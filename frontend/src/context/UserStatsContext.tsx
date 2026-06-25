import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface UserStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  last_updated: string;
}

interface UserStatsContextType {
  stats: UserStats;
  streak: number;
  logMeal: (foodItem: any) => Promise<void>;
  loadingStats: boolean;
  requestNotificationPermission: () => void;
}

const defaultStats: UserStats = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  last_updated: ''
};

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export function useUserStats() {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
}

export function UserStatsProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [streak, setStreak] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (currentUser) {
      fetchStats();
    } else {
      setStats(defaultStats);
      setStreak(0);
    }
  }, [currentUser]);

  const fetchStats = async () => {
    if (!currentUser) return;
    setLoadingStats(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE}/api/user/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setStreak(data.streak);
      }
    } catch (error) {
      console.error("Failed to fetch user stats", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const logMeal = async (foodItem: any) => {
    if (!currentUser) {
      alert("Please log in to log a meal.");
      return;
    }
    
    // Optimistic UI could be added here
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE}/api/user/log_meal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(foodItem)
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.new_stats);
        alert(`Successfully logged ${foodItem.name}. Estimated macros added!`);
      } else {
        alert("Failed to log meal. Please try again.");
      }
    } catch (error) {
      console.error("Failed to log meal", error);
    }
  };

  const scheduleDailyNotification = () => {
    // Schedule local browser notification if permitted
    // To trigger at 9:00 PM daily
    const now = new Date();
    let targetTime = new Date();
    targetTime.setHours(21, 0, 0, 0); // 9:00 PM

    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeUntil9PM = targetTime.getTime() - now.getTime();

    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification("Z-SeHealth", {
          body: "Don't forget to track your meals today! Keep your streak going."
        });
      }
      // Re-schedule for next day
      setInterval(() => {
        if (Notification.permission === 'granted') {
          new Notification("Z-SeHealth", {
            body: "Don't forget to track your meals today! Keep your streak going."
          });
        }
      }, 24 * 60 * 60 * 1000);
    }, timeUntil9PM);
  };

  const requestNotificationPermission = () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }
    if (Notification.permission === 'granted') {
      scheduleDailyNotification();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          scheduleDailyNotification();
        }
      });
    }
  };

  // Setup notifications
  useEffect(() => {
    if (currentUser) {
      requestNotificationPermission();
    }
  }, [currentUser]);

  const value = {
    stats,
    streak,
    logMeal,
    loadingStats,
    requestNotificationPermission
  };

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  );
}
