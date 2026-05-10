import useAuthStore from '../store/authStore';

export default function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const clearError = useAuthStore((s) => s.clearError);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    restoreSession,
    clearError,
  };
}
