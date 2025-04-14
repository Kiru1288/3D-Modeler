import { db } from "../config/firebaseConfig";
import { doc, setDoc, deleteDoc, serverTimestamp, getDoc } from "firebase/firestore";

/**
 * ✅ Assign Admin Role (Only Super Admin Can Do This)
 * @param {string} superAdminId - The Firebase Auth user ID of the requester
 * @param {string} targetUserId - The Firebase Auth user ID of the user being promoted
 * @param {string} email - The email of the user being made admin
 */
export const assignAdminRole = async (superAdminId, targetUserId, email) => {
  try {
    // ✅ Ensure the requester is a super-admin
    const requesterRef = doc(db, "users", superAdminId);
    const requesterSnap = await getDoc(requesterRef);

    if (!requesterSnap.exists() || requesterSnap.data().role !== "super-admin") {
      console.warn("⚠️ Unauthorized: Only super-admins can assign admin roles.");
      return false;
    }

    // ✅ Assign admin role in the users collection
    await setDoc(doc(db, "users", targetUserId), {
      email,
      role: "admin",
      addedAt: serverTimestamp(),
    }, { merge: true });

    console.log(`✅ Admin role assigned to ${email}`);
    return true;
  } catch (error) {
    console.error("⚠️ Error assigning admin role:", error.message);
    return false;
  }
};

/**
 * ❌ Remove Admin Role (Only Super Admin Can Do This)
 * @param {string} superAdminId - The Firebase Auth user ID of the requester
 * @param {string} targetAdminId - The Firebase Auth user ID of the admin being demoted
 */
export const removeAdminRole = async (superAdminId, targetAdminId) => {
  try {
    // ✅ Ensure the requester is a super-admin
    const requesterRef = doc(db, "users", superAdminId);
    const requesterSnap = await getDoc(requesterRef);

    if (!requesterSnap.exists() || requesterSnap.data().role !== "super-admin") {
      console.warn("⚠️ Unauthorized: Only super-admins can remove admin roles.");
      return false;
    }

    // ✅ Remove admin role but keep user in system
    await setDoc(doc(db, "users", targetAdminId), { role: "user" }, { merge: true });

    console.log("❌ Admin role removed.");
    return true;
  } catch (error) {
    console.error("⚠️ Error removing admin:", error.message);
    return false;
  }
};
