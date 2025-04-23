import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "../Backend/firebaseConfig";

const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Helper to get or create user document
const getOrCreateUserRole = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create user and prevent login immediately
    await setDoc(userRef, {
      email: user.email,
      firstName: user.displayName?.split(" ")[0] || "First",
      lastName: user.displayName?.split(" ")[1] || "Last",
      approved: false, // New users require manual approval
      role: "user",
      createdAt: serverTimestamp(),
    });

    // ⛔ Force sign out unapproved users
    await auth.signOut();
    throw new Error("Your account was created but is not approved yet.");
  }

  const data = userSnap.data();

  // ⛔ Prevent access if not approved
  if (!data.approved) {
    await auth.signOut(); // ⛔ Force logout again if user not approved
    throw new Error("Your account is not approved yet. Please wait for admin approval.");
  }

  return data.role || "user";
};

// ✅ Google Login
export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const role = await getOrCreateUserRole(result.user);
  return { user: result.user, role };
};

// ✅ Facebook Login
export const facebookLogin = async () => {
  const provider = new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const role = await getOrCreateUserRole(result.user);
  return { user: result.user, role };
};

// ✅ Yahoo Login
export const yahooLogin = async () => {
  const provider = new OAuthProvider("yahoo.com");
  const result = await signInWithPopup(auth, provider);
  const role = await getOrCreateUserRole(result.user);
  return { user: result.user, role };
};
