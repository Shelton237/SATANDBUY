// /context/AdminContext.js
import React, { createContext, useReducer, useEffect } from 'react';
import AuthService from '@/services/AuthService';

export const AdminContext = createContext();

const initialState = {
  authData: AuthService.getAuthData() || null
};

function reducer(state, action) {
  switch (action.type) {
    case 'USER_LOGIN':
      return { ...state, authData: action.payload };
    case 'USER_LOGOUT':
      return { ...state, authData: null };
    default:
      return state;
  }
};

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'UPDATE_AUTH':
        return { ...state, authData: action.payload };
      case 'CLEAR_AUTH':
        return { ...state, authData: null };
      default:
        return state;
    }
  }, { authData: AuthService.getAuthData() });

  // Plus besoin de customDispatch, tout passe par AuthService
  useEffect(() => {
    const syncAuth = () => {
      const authData = AuthService.getAuthData();
      dispatch({ 
        type: authData ? 'UPDATE_AUTH' : 'CLEAR_AUTH',
        payload: authData
      });
    };

    // Synchronisation initiale
    syncAuth();
    
    // Écoute les changements de localStorage
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  return (
    <AdminContext.Provider value={{ 
      authData: state.authData,
      login: AuthService.login,
      logout: AuthService.logout
    }}>
      {children}
    </AdminContext.Provider>
  );
};
