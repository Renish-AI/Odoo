import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tripService } from '../services/tripService';
import { itineraryService } from '../services/itineraryService';
import { activityService } from '../services/activityService';
import { budgetService } from '../services/budgetService';
import { profileService } from '../services/profileService';
import { getLocalTrips, getLocalSavedDestinations } from '../services/localStore';

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  // Synchronously initialize with local storage data so state is never blank
  const [trips, setTrips] = useState(() => getLocalTrips());
  const [activeTrip, setActiveTrip] = useState(() => {
    const initial = getLocalTrips();
    return initial.length > 0 ? initial[0] : null;
  });
  const [savedDestinations, setSavedDestinations] = useState(() => getLocalSavedDestinations());
  const [loading, setLoading] = useState(false);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tripService.getTrips();
      if (data && data.length > 0) {
        setTrips(data);
        setActiveTrip((currentActive) => {
          if (!currentActive) return data[0];
          const matched = data.find((t) => t.id === currentActive.id);
          return matched || currentActive;
        });
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedDestinations = useCallback(async () => {
    try {
      const saved = await profileService.getSavedDestinations();
      if (saved && saved.length > 0) {
        setSavedDestinations(saved);
      }
    } catch (err) {
      console.error('Error loading saved destinations:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    fetchSavedDestinations();
  }, [fetchTrips, fetchSavedDestinations]);

  const selectTrip = useCallback((tripId) => {
    if (!tripId) return null;
    const found = trips.find((t) => t.id === tripId || t.shareSlug === tripId);
    if (found) {
      setActiveTrip(found);
      return found;
    }
    // Fallback: check local store directly
    const storedTrips = getLocalTrips();
    const storedFound = storedTrips.find((t) => t.id === tripId || t.shareSlug === tripId);
    if (storedFound) {
      setActiveTrip(storedFound);
      return storedFound;
    }
    return null;
  }, [trips]);

  const createTrip = async (tripData) => {
    const newTrip = await tripService.createTrip(tripData);
    setTrips((prev) => [newTrip, ...prev.filter((t) => t.id !== newTrip.id)]);
    setActiveTrip(newTrip);
    return newTrip;
  };

  const updateTrip = async (tripId, updates) => {
    const updated = await tripService.updateTrip(tripId, updates);
    if (updated) {
      setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
      setActiveTrip((prev) => (prev?.id === tripId ? updated : prev));
    }
    return updated;
  };

  const deleteTrip = async (tripId) => {
    await tripService.deleteTrip(tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    setActiveTrip((prev) => {
      if (prev?.id === tripId) {
        const remaining = trips.filter((t) => t.id !== tripId);
        return remaining.length > 0 ? remaining[0] : null;
      }
      return prev;
    });
  };

  const duplicateTrip = async (tripId) => {
    const cloned = await tripService.duplicateTrip(tripId);
    if (cloned) {
      setTrips((prev) => [cloned, ...prev]);
      setActiveTrip(cloned);
    }
    return cloned;
  };

  // Stops & Activities
  const addStop = async (tripId, stopData) => {
    const newStop = await itineraryService.addStop(tripId, stopData);
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const stops = [...(t.stops || []), newStop];
          return { ...t, stops };
        }
        return t;
      })
    );
    setActiveTrip((prev) => {
      if (prev?.id === tripId) {
        return {
          ...prev,
          stops: [...(prev.stops || []), newStop]
        };
      }
      return prev;
    });
    return newStop;
  };

  const updateStop = async (tripId, stopId, updates) => {
    const updated = await itineraryService.updateStop(tripId, stopId, updates);
    const updateTripState = (t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        stops: (t.stops || []).map((s) => (s.id === stopId ? { ...s, ...updates } : s))
      };
    };
    setTrips((prev) => prev.map(updateTripState));
    setActiveTrip((prev) => (prev?.id === tripId ? updateTripState(prev) : prev));
    return updated;
  };

  const deleteStop = async (tripId, stopId) => {
    await itineraryService.deleteStop(tripId, stopId);
    const filterTripState = (t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        stops: (t.stops || []).filter((s) => s.id !== stopId),
        activities: (t.activities || []).filter((a) => a.tripStopId !== stopId)
      };
    };
    setTrips((prev) => prev.map(filterTripState));
    setActiveTrip((prev) => (prev?.id === tripId ? filterTripState(prev) : prev));
  };

  const reorderStops = async (tripId, newStops) => {
    const updated = await itineraryService.reorderStops(tripId, newStops);
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, stops: updated } : t))
    );
    setActiveTrip((prev) => (prev?.id === tripId ? { ...prev, stops: updated } : prev));
  };

  const addActivity = async (tripId, stopId, actData) => {
    const newAct = await activityService.addActivity(tripId, stopId, actData);
    const updateTripState = (t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        activities: [...(t.activities || []), newAct]
      };
    };
    setTrips((prev) => prev.map(updateTripState));
    setActiveTrip((prev) => (prev?.id === tripId ? updateTripState(prev) : prev));
    return newAct;
  };

  const updateActivity = async (tripId, actId, updates) => {
    const updated = await activityService.updateActivity(tripId, actId, updates);
    const updateTripState = (t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        activities: (t.activities || []).map((a) => (a.id === actId ? { ...a, ...updates } : a))
      };
    };
    setTrips((prev) => prev.map(updateTripState));
    setActiveTrip((prev) => (prev?.id === tripId ? updateTripState(prev) : prev));
    return updated;
  };

  const deleteActivity = async (tripId, actId) => {
    await activityService.deleteActivity(tripId, actId);
    const filterTripState = (t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        activities: (t.activities || []).filter((a) => a.id !== actId)
      };
    };
    setTrips((prev) => prev.map(filterTripState));
    setActiveTrip((prev) => (prev?.id === tripId ? filterTripState(prev) : prev));
  };

  // Expenses
  const addExpense = async (tripId, expData) => {
    const newExp = await budgetService.addExpense(tripId, expData);
    const updateTripState = (t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        expenses: [newExp, ...(t.expenses || [])]
      };
    };
    setTrips((prev) => prev.map(updateTripState));
    setActiveTrip((prev) => (prev?.id === tripId ? updateTripState(prev) : prev));
    return newExp;
  };

  const deleteExpense = async (tripId, expId) => {
    await budgetService.deleteExpense(tripId, expId);
    const filterTripState = (t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        expenses: (t.expenses || []).filter((e) => e.id !== expId)
      };
    };
    setTrips((prev) => prev.map(filterTripState));
    setActiveTrip((prev) => (prev?.id === tripId ? filterTripState(prev) : prev));
  };

  // Saved destinations
  const toggleSaveDestination = async (dest) => {
    const exists = savedDestinations.some(
      (d) => d.cityName?.toLowerCase() === dest.city.toLowerCase()
    );
    if (exists) {
      await profileService.removeSavedDestination(dest.city);
      setSavedDestinations((prev) =>
        prev.filter((d) => d.cityName?.toLowerCase() !== dest.city.toLowerCase())
      );
    } else {
      const item = await profileService.saveDestination(dest);
      if (item) setSavedDestinations((prev) => [item, ...prev]);
    }
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        setActiveTrip,
        loading,
        fetchTrips,
        selectTrip,
        createTrip,
        updateTrip,
        deleteTrip,
        duplicateTrip,
        addStop,
        updateStop,
        deleteStop,
        reorderStops,
        addActivity,
        updateActivity,
        deleteActivity,
        addExpense,
        deleteExpense,
        savedDestinations,
        toggleSaveDestination
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => useContext(TripContext);