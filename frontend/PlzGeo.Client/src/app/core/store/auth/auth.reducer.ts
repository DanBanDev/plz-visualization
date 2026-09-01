import { createReducer, on } from '@ngrx/store';
import { AuthState } from './auth-state';
import {
  login,
  loginSuccess,
  loginFailure,
  register,
  registerSuccess,
  registerFailure,
  logoutSuccess,
  loadCurrentUser,
  loadCurrentUserSuccess,
  loadCurrentUserFailure
} from './auth.actions';

export const initialAuthState: AuthState = {
  user: null,
  loading: false,
  initialized: false,
  error: null
};

export const authReducer = createReducer(
  initialAuthState,
  on(login, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(loginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    initialized: true,
    error: null
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    loading: false,
    error
  })),
  on(register, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(registerSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    initialized: true,
    error: null
  })),
  on(registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(logoutSuccess, () => ({
    ...initialAuthState,
    initialized: true
  })),
  on(loadCurrentUser, state => ({
    ...state,
    loading: true
  })),
  on(loadCurrentUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    initialized: true,
    error: null
  })),
  on(loadCurrentUserFailure, state => ({
    ...state,
    user: null,
    loading: false,
    initialized: true
  }))
);
