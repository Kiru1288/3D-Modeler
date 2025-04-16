// This is a stub file that provides mock Firebase functionality
// All Firebase dependencies have been removed

// Mock auth object
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    callback(null);
    return () => {}; // Return a dummy unsubscribe function
  },
  signOut: () => Promise.resolve(),
  signInWithEmailAndPassword: () => Promise.resolve({ user: { uid: 'mock-user-id' } }),
  createUserWithEmailAndPassword: () => Promise.resolve({ user: { uid: 'mock-user-id' } })
};

// Mock app object
const app = {
  name: '[DEFAULT]',
  options: {}
};

export default app; 