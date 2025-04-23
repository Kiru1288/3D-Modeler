const { db } = require("../firebaseAdmin");

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();

    if (snapshot.empty) {
      return res.status(200).json([]); // No users found
    }

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ✅ Approve a user
exports.approveUser = async (req, res) => {
  const uid = req.params.uid;

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.update({ approved: true });
    res.status(200).json({ message: "User approved" });
  } catch (err) {
    console.error("❌ Error approving user:", err.message);
    res.status(500).json({ error: "Failed to approve user" });
  }
};

// ✅ Delete a user
exports.deleteUser = async (req, res) => {
  const uid = req.params.uid;

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.delete();
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("❌ Error deleting user:", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// ✅ Promote user to admin
exports.promoteToAdmin = async (req, res) => {
  const uid = req.params.uid;

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.update({ role: "admin" });
    console.log(`✅ User ${uid} promoted to admin`);
    res.status(200).json({ message: "User promoted to admin" });
  } catch (err) {
    console.error("❌ Error promoting user:", err.message);
    res.status(500).json({ error: "Failed to promote user" });
  }
};

// ✅ Demote admin to user
exports.demoteToUser = async (req, res) => {
  const uid = req.params.uid;

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.update({ role: "user" });
    console.log(`✅ Admin ${uid} demoted to user`);
    res.status(200).json({ message: "Admin demoted to user" });
  } catch (err) {
    console.error("❌ Error demoting admin:", err.message);
    res.status(500).json({ error: "Failed to demote admin" });
  }
};
