// security.js - Role-Based Access Control (RBAC) & Security Checks
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";


/**
 * ✅ Verify if a user has the required role
 * @param {string} userId - Firebase Auth user ID
 * @param {string} requiredRole - The required role (e.g., "admin", "super-admin")
 * @returns {Promise<boolean>} - Returns true if authorized, false otherwise
 */
export const checkUserRole = async (userId, requiredRole) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn(`⚠️ User ${userId} not found in Firestore.`);
      return false;
    }

    const userData = userSnap.data();
    
    // ✅ Allow super-admins to access all admin pages
    if (userData.role === "super-admin") return true;

    // ✅ Allow access if role matches required role
    return userData.role === requiredRole;
  } catch (error) {
    console.error(`⚠️ Error verifying user role: ${error.message}`);
    return false;
  }
};

/**
 * ✅ Restrict user deletion (Only super-admins can delete admins)
 * @param {string} adminRole - Role of the person trying to delete
 * @param {string} targetRole - Role of the person being deleted
 * @returns {boolean} - Returns true if deletion is allowed, false otherwise
 */
export const canDeleteUser = (adminRole, targetRole) => {
  if (targetRole === "super-admin") {
    console.warn(`⚠️ Unauthorized deletion attempt: Super-admins cannot be deleted.`);
    return false;
  }

  if (targetRole === "admin" && adminRole !== "super-admin") {
    console.warn(`⚠️ Unauthorized deletion attempt: Only super-admins can remove admins.`);
    return false;
  }

  return true;
};
