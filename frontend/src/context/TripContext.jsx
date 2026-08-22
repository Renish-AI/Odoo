import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tripService } from '../services/tripService';
import { itineraryService } from '../services/itineraryService';
import { activityService } from '../services/activityService';
import { budgetService } from '../services/budgetService';
import { profileService } from '../services/profileService';

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tripService.getTrips();
      setTrips(data);
      if (data.length > 0 && !activeTrip) {
        setActiveTrip(data[0]);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTrip]);

  const fetchSavedDestinations = useCallback(async () => {
    try {
      const saved = await profileService.getSavedDestinations();
      setSavedDestinations(saved);
    } catch (err) {
      console.error('Error loading saved destinations:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    fetchSavedDestinations();
  }, [fetchTrips, fetchSavedDestinations]);

  const selectTrip = (tripId) => {
    const found = trips.find((t) => t.id === tripId || t.shareSlug === tripId);
    if (found) setActiveTrip(found);
    return found;
  };

  const createTrip = async (tripData) => {
    const newTrip = await tripService.createTrip(tripData);
    setTrips((prev) => [newTrip, ...prev]);
    setActiveTrip(newTrip);
    return newTrip;
  };

  const updateTrip = async (tripId, updates) => {
    const updated = await tripService.updateTrip(tripId, updates);
    if (updated) {
      setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
      if (activeTrip?.id === tripId) {
        setActiveTrip(updated);
      }
    }
    return updated;
  };

  const deleteTrip = async (tripId) => {
    await tripService.deleteTrip(tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    if (activeTrip?.id === tripId) {
      const remaining = trips.filter((t) => t.id !== tripId);
      setActiveTrip(remaining.length > 0 ? remaining[0] : null);
    }
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
    if (activeTrip?.id === tripId) {
      setActiveTrip((prev) => ({
        ...prev,
        stops: [...(prev.stops || []), newStop]
      }));
    }
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
    if (activeTrip?.id === tripId) {
      setActiveTrip((prev) => updateTripState(prev));
    }
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
    if (activeTrip?.id === tripId) {
      setActiveTrip((prev) => filterTripState(prev));
    }
  };

  const reorderStops = async (tripId, newStops) => {
    const updated = await itineraryService.reorderStops(tripId, newStops);
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, stops: updated } : t))
    );
    if (activeTrip?.id === tripId) {
      setActiveTrip((prev) => ({ ...prev, stops: updated }));
    }
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
    if (activeTrip?.id === tripId) {
      setActiveTrip((prev) => updateTripState(prev));
    }
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
    if (activeTrip?.id === tripId) {
      setActiveTrip((prev) => updateTripState(prev));
    }
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
    if (activeTrip?.id === tripId) {
      setActiveTrip((prev) => filterTripState(prev));
    }
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
    if (activeTrip?.id === tripId) {
      setActiveTrip((prev) => updateTripState(prev));
    }
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
    if (activeTrip?.id === tripId) {
      setActiveTrip((prev) => filterTripState(prev));
    }
  };

  // Saved destinations
  const toggleSaveDestination = async (dest) => {
    const exists = savedDestinations.some(
      (d) => d.cityName.toLowerCase() === dest.city.toLowerCase()
    );
    if (exists) {
      await profileService.removeSavedDestination(dest.city);
      setSavedDestinations((prev) =>
        prev.filter((d) => d.cityName.toLowerCase() !== dest.city.toLowerCase())
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
