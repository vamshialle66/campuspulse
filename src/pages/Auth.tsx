import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useStore } from "@/store/campus";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";
  const API_URL = import.meta.env.VITE_API_URL;


  const handleSubmit = async () => {
    
    if(!isLogin && !email.endsWith("@atharvacoe.ac.in")){
      alert("Use your college email (xyz@atharvacoe.ac.in)")
      return
}

    const url = isLogin
      ? `${API_URL}/auth/login`
      : `${API_URL}/auth/register`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // 🔥 SAME LOGIC (unchanged)
    if (!res.ok) {
      alert(data.msg);
      return;
    }

    if (isLogin) {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", email);
        localStorage.setItem("role", data.role);

        useStore.getState().setRole(data.role);

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">

      {/* 🔝 HERO TEXT */}
      <div className="text-center mb-8 max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight whitespace-nowrap">
          Streamline your campus, effortlessly.
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage schedules, notices, and rooms — all in one place.
        </p>
      </div>

      {/* 🔥 CARD */}
      <div className="cp-card w-full max-w-md p-6 shadow-lg">

        {/* LOGO + TITLE */}
        <div className="text-center mb-6">
          <img src="/logo.png" className="h-10 mx-auto mb-2" />
          <h2 className="text-lg font-extrabold">
            {isLogin ? "CampusPulse" : "Create your account"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Welcome!" : "Register to continue"}
          </p>
        </div>

        {/* EMAIL */}
        <div className="relative mb-3">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Email"
            className="w-full pl-9 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="relative mb-4">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-9 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* MAIN BUTTON */}
        <button
          onClick={handleSubmit}
          className="w-full border border-primary text-primary p-2 rounded-lg hover:bg-primary/10 transition font-semibold"
        >
          {isLogin ? "Login" : "Create Account"}
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-2 my-5">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* SWITCH BUTTON */}
        <button
          onClick={() => setMode(isLogin ? "register" : "login")}
          className="w-full border border-primary text-primary p-2 rounded-lg hover:bg-primary/10 transition font-medium"
        >
          {isLogin ? "Create Account" : "Back to Login"}
        </button>
      </div>

      {/* FOOT */}
      <p className="text-xs text-muted-foreground mt-6 text-center">
        
      </p>
    </div>
  );
}
