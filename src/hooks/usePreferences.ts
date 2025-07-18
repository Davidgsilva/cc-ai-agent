import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cc-ai-preferences';

const defaultPreferences = {
  creditScore: '',
  annualIncome: '',
  spendingCategories: {
    dining: 0,
    groceries: 0,
    gas: 0,
    travel: 0,
    online: 0,
    other: 0
  },
  currentCards: [],
  goals: [],
  maxAnnualFee: '',
  preferredBenefits: []
};

export function usePreferences() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updatePreferences = useCallback((updates) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      } catch (error) {
        console.warn('Failed to save preferences to localStorage:', error);
      }
      return newPreferences;
    });
  }, []);

  const updateSpendingCategory = useCallback((category, amount) => {
    updatePreferences({
      spendingCategories: {
        ...preferences.spendingCategories,
        [category]: Number(amount) || 0
      }
    });
  }, [preferences.spendingCategories, updatePreferences]);

  const addCurrentCard = useCallback((card) => {
    updatePreferences({
      currentCards: [...preferences.currentCards, card]
    });
  }, [preferences.currentCards, updatePreferences]);

  const removeCurrentCard = useCallback((cardIndex) => {
    updatePreferences({
      currentCards: preferences.currentCards.filter((_, index) => index !== cardIndex)
    });
  }, [preferences.currentCards, updatePreferences]);

  const addGoal = useCallback((goal) => {
    updatePreferences({
      goals: [...preferences.goals, goal]
    });
  }, [preferences.goals, updatePreferences]);

  const removeGoal = useCallback((goalIndex) => {
    updatePreferences({
      goals: preferences.goals.filter((_, index) => index !== goalIndex)
    });
  }, [preferences.goals, updatePreferences]);

  const clearPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear preferences from localStorage:', error);
    }
  }, []);

  const getPreferencesForAPI = useCallback(() => {
    return {
      creditScore: preferences.creditScore,
      annualIncome: preferences.annualIncome,
      monthlySpending: Object.entries(preferences.spendingCategories)
        .filter(([_, amount]) => amount > 0)
        .reduce((acc, [category, amount]) => ({ ...acc, [category]: amount }), {}),
      currentCards: preferences.currentCards,
      goals: preferences.goals,
      maxAnnualFee: preferences.maxAnnualFee,
      preferredBenefits: preferences.preferredBenefits
    };
  }, [preferences]);

  return {
    preferences,
    isLoaded,
    updatePreferences,
    updateSpendingCategory,
    addCurrentCard,
    removeCurrentCard,
    addGoal,
    removeGoal,
    clearPreferences,
    getPreferencesForAPI
  };
}