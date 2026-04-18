import { useState } from "react";
import { useStore } from "@/store/campus";
export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = async () => {
    const url = isLogin
      ? "http://localhost:5000/auth/login"
      : "http://localhost:5000/auth/register";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    // 🔥 IMPORTANT FIX
if (!res.ok) {
  alert(data.msg); // shows "User already exists"
  return;
}

setMode("login");

    if (isLogin) {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", email);
        localStorage.setItem("role", data.role);
        useStore.getState().setRole(data.role);
     // 🔥 important
        
        document.body.className = `role-${data.role}`;
        window.location.href = "/";
        
      } else {
        alert(data.msg);
      }
    } else {
      alert("Account created");
      setMode("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-80">

        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2">
          CampusPulse
        </h2>

        <p className="text-center text-sm text-gray-500 mb-6">
          {isLogin ? "Welcome back 👋" : "Create your account"}
        </p>

        <input
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
        >
          {isLogin ? "Login" : "Create Account"}
        </button>

        <p
          onClick={() => setMode(isLogin ? "register" : "login")}
          className="text-sm text-blue-600 text-center mt-4 cursor-pointer hover:underline"
        >
          {isLogin
            ? "Don't have an account? Create one"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}