import { db } from "./firebaseConfig";

import { collection, getDocs, setDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export const fetchDashboardStats = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const pendingUsersSnapshot = await getDocs(collection(db, "pendingUsers"));
    const adminsCount = usersSnapshot.docs.filter(user => user.data().role === "admin").length;

    return {
      totalUsers: usersSnapshot.size,
      totalAdmins: adminsCount,
      totalPendingUsers: pendingUsersSnapshot.size
    };
  } catch (error) {
    console.error("⚠️ Error fetching dashboard stats:", error);
    return { totalUsers: 0, totalAdmins: 0, totalPendingUsers: 0 };
  }
};

export const fetchUsers = async () => getCollectionData("users");
export const fetchPendingUsers = async () => getCollectionData("pendingUsers");
export const fetchAdmins = async () => {
  const users = await getCollectionData("users");
  return users.filter(user => user.role === "admin" || user.role === "super-admin"); // ✅ Include super-admin
};

// ✅ Generic function to get data from a collection
const getCollectionData = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`⚠️ Error fetching ${collectionName}:`, error);
    return [];
  }
};

export const approveUser = async (userId, email, role = "user", adminEmail) => {
  if (!adminEmail) {
    console.warn("⚠️ Admin email is missing. Cannot log action.");
    return false;
  }

  try {
    console.log(`⏳ Approving user ${userId}...`);

    await moveUserBetweenCollections("pendingUsers", "users", userId, {
        email,
        role,
        approved: true, // ✅ THIS IS REQUIRED
        createdAt: serverTimestamp(),
        designImageURL: "",
        savedDesign: "",
      });
      

    await logActivity(`Approved user as ${role}`, userId, email, adminEmail);

    console.log(`✅ User ${userId} approved successfully.`);
    return true;
  } catch (error) {
    console.error("⚠️ Error approving user:", error);
    return false;
  }
};

// ❌ Reject User (Delete from `pendingUsers`)
export const rejectUser = async (userId, email, adminEmail) => {
  if (!adminEmail) {
    console.warn("⚠️ Admin email is missing. Cannot log action.");
    return false;
  }

  try {
    await deleteUser("pendingUsers", userId);
    await logActivity("Rejected user", userId, email, adminEmail);
    return true;
  } catch (error) {
    console.error("⚠️ Error rejecting user:", error);
    return false;
  }
};

export const removeUser = async (userId, email, role, adminRole, adminEmail) => {
  if (!adminEmail) {
    console.warn("⚠️ Admin email is missing. Cannot log action.");
    return false;
  }

  if (role === "admin" && adminRole !== "super-admin") {
    console.error("⚠️ Only super admins can remove an admin!");
    return false;
  }

  try {
    await deleteUser("users", userId);
    await logActivity(`Removed ${role}`, userId, email, adminEmail);
    return true;
  } catch (error) {
    console.error("⚠️ Error removing user:", error);
    return false;
  }
};

export const addAdmin = async (email, adminRole, adminEmail) => {
  if (!adminEmail) {
    console.warn("⚠️ Admin email is missing. Cannot log action.");
    return false;
  }

  if (adminRole !== "super-admin") {
    console.error("⚠️ Only super admins can add an admin!");
    return false;
  }

  try {
    await setUser("users", email, "admin");
    await logActivity("Added new admin", email, email, adminEmail);
    return true;
  } catch (error) {
    console.error("⚠️ Error adding admin:", error);
    return false;
  }
};

export const removeAdmin = async (adminId, adminRole, adminEmail) => {
  if (!adminEmail) {
    console.warn("⚠️ Admin email is missing. Cannot log action.");
    return false;
  }

  if (adminRole !== "super-admin") {
    console.error("⚠️ Only super admins can remove an admin!");
    return false;
  }

  try {
    await deleteUser("users", adminId);
    await logActivity("Removed admin", adminId, adminId, adminEmail);
    return true;
  } catch (error) {
    console.error("⚠️ Error removing admin:", error);
    return false;
  }
};

export const addSuperAdmin = async (email, uid) => {
  try {
    await setDoc(doc(db, "users", uid), {
      email,
      role: "super-admin",
      createdAt: serverTimestamp()
    });

    console.log("✅ Super Admin Added:", email);
  } catch (error) {
    console.error("⚠️ Error Adding Super Admin:", error);
  }
};

export const fetchActivityLogs = async () => getCollectionData("activityLogs");

// ✅ Log Admin Actions
export const logActivity = async (action, userId, email, performedBy) => {
  if (!performedBy) {
    console.warn("⚠️ Missing `performedBy` field. Using 'Unknown Admin'.");
    performedBy = "Unknown Admin";
  }

  try {
    await setDoc(doc(db, "activityLogs", `${Date.now()}_${userId}`), {
      action,
      userId,
      email,
      performedBy,
      timestamp: serverTimestamp()
    });
    console.log(`✅ Logged activity: ${action} by ${performedBy}`);
  } catch (error) {
    console.error("⚠️ Error logging activity:", error);
  }
};

/* 
==========================================
 HELPER FUNCTIONS (Reuse Code)
==========================================
*/
// ✅ Move user from one collection to another
const moveUserBetweenCollections = async (from, to, userId, data) => {
  try {
    await setDoc(doc(db, to, userId), data);
    await deleteDoc(doc(db, from, userId));
    console.log(`✅ Moved user ${userId} from ${from} to ${to}`);
  } catch (error) {
    console.error(`⚠️ Error moving user:`, error);
  }
};

// ✅ Set user (Add user/admin)
const setUser = async (collectionName, email, role) => {
  try {
    await setDoc(doc(db, collectionName, email.replace(/[@.]/g, "_")), {
      email,
      role,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ User ${email} added as ${role}`);
  } catch (error) {
    console.error("⚠️ Error adding user:", error);
  }
};

// ❌ Delete a user from a collection
const deleteUser = async (collectionName, userId) => {
  try {
    await deleteDoc(doc(db, collectionName, userId));
    console.log(`❌ Removed user ${userId} from ${collectionName}`);
  } catch (error) {
    console.error("⚠️ Error removing user:", error);
  }
};
