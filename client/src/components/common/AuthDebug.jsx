import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthDebug = () => {
  const auth = useAuth();
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Auth Debug</h4>
      <div><strong>isLoading:</strong> {auth.isLoading ? 'true' : 'false'}</div>
      <div><strong>isAuthenticated:</strong> {auth.isAuthenticated ? 'true' : 'false'}</div>
      <div><strong>user:</strong> {auth.user ? auth.user.nombre : 'null'}</div>
      <div><strong>token:</strong> {auth.token ? auth.token.substring(0, 20) + '...' : 'null'}</div>
      <div><strong>error:</strong> {auth.error || 'null'}</div>
    </div>
  );
};

export default AuthDebug;
