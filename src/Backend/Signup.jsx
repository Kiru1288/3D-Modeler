import React, { useState } from "react";
import { createAccount } from "./authBackend";



export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const result = await createAccount(email, password);
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Create Account</h1>
      <form className="space-y-4" onSubmit={handleSignup}>
        <input className="p-2 bg-gray-800" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="p-2 bg-gray-800" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="p-2 bg-gray-800" placeholder="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button className="bg-yellow-500 text-black px-4 py-2 rounded" type="submit">Sign Up</button>
      </form>
      {message && <p className="text-green-400 mt-4">{message}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
