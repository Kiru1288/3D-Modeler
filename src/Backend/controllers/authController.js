const { admin, db } = require("../firebaseAdmin");

// 🔐 Signup a user – Backend ONLY stores user info in Firestore
exports.signupUser = async (req, res) => {
  const { email, firstName, lastName } = req.body;

  try {
    // ✅ Get UID of the user created in frontend
    const existingUser = await admin.auth().getUserByEmail(email);
    const uid = existingUser.uid;

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email,
        firstName,
        lastName,
        approved: false,
        role: "user",
        createdAt: new Date(),
      });
    }

    res.status(201).send({
      message: "✅ Signup successful. Please verify your email & wait for admin approval.",
    });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).send({ error: err.message });
  }
};

// 🔐 Login a user (manual token generation)
exports.loginUser = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    const userDoc = await db.collection("users").doc(user.uid).get();

    // ✅ If user exists in Auth but not in Firestore
    if (!userDoc.exists) {
      return res.status(404).send({ error: "No account found. Please sign up first." });
    }

    const userData = userDoc.data();

    // ✅ Block if not approved
    if (!userData.approved) {
      return res.status(403).send({ error: "Your account is not approved yet." });
    }

    const token = await admin.auth().createCustomToken(user.uid);
    res.send({ token, role: userData.role });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).send({ error: err.message });
  }
};
