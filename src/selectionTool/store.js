// Selection Tool — session store (Zustand, no persist middleware: identity
// lives in localStorage via api.js, everything else lives in Dexie —
// nothing diagnostic-related belongs in a persisted browser store).
import { create } from 'zustand';
import selectionToolAPI from './api';

const useSelectionStore = create((set, get) => ({
  user: selectionToolAPI.user,
  pricingEnabled: false, // the ON/OFF toggle position, not just eligibility
  hasPricingSet: !!selectionToolAPI.user?.pricingSetId,
  online: navigator.onLine,

  init: () => {
    window.addEventListener('online', () => set({ online: true }));
    window.addEventListener('offline', () => set({ online: false }));
  },

  login: async (username, password) => {
    const { token, user } = await selectionToolAPI.login(username, password);
    selectionToolAPI.setSession(token, user);
    set({ user, hasPricingSet: !!user.pricingSetId });
    return user;
  },

  logout: () => {
    selectionToolAPI.clearSession();
    set({ user: null, hasPricingSet: false, pricingEnabled: false });
  },

  setPricingEnabled: (val) => set({ pricingEnabled: val }),
  setHasPricingSet: (val) => set({ hasPricingSet: val }),
}));

export default useSelectionStore;
