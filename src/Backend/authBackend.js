import { signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider, facebookProvider, yahooProvider, db } from './firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// 🔐 Create a pending user in Firestore
const createPendingUser = async (user) => {
    const superAdminEmails = ["super@admin.com"]; // ✅ Add more emails if needed
  
    const isSuperAdmin = superAdminEmails.includes(user.email);
    const targetCollection = isSuperAdmin ? "users" : "pendingUsers";
  
    await setDoc(doc(db, targetCollection, user.uid), {
      email: user.email,
      role: isSuperAdmin ? "super-admin" : "user",
      approved: isSuperAdmin, // ✅ Automatically approve super-admins
      createdAt: serverTimestamp(),
    });
  };
  

// ✅ Google Login
export const googleLogin = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  await createPendingUser(result.user);
};

// ✅ Facebook Login
export const facebookLogin = async () => {
  const result = await signInWithPopup(auth, facebookProvider);
  await createPendingUser(result.user);
};

// ✅ Yahoo Login
export const yahooLogin = async () => {
  const result = await signInWithPopup(auth, yahooProvider);
  await createPendingUser(result.user);
};

// ✅ Create Account using Email/Password (SignUp)
export const createAccount = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, 'pendingUsers', user.uid), {
    email: user.email,
    approved: false,
    createdAt: serverTimestamp()
  });

  return { message: "Account created! Please wait for approval." };
};
