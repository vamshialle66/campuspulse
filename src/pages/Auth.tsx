import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useStore } from "@/store/campus";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isVerify = mode === "verify";

  const handleSubmit = async () => {
    try {
      // 🔒 Email validation (only for register)
      if (isRegister && !email.endsWith("@atharvacoe.ac.in")) {
        alert("Use your college email (xyz@atharvacoe.ac.in)");
        return;
      }

      // 🟢 REGISTER → SEND OTP
      if (isRegister) {
        const res = await fetch(`${API_URL}/auth/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.msg);
          return;
        }

        setMode("verify");
        return;
      }

      // 🔵 LOGIN
      if (isLogin) {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.msg);
          return;
        }

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
      }
    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg);
        return;
      }

      alert("Account created!");
      setMode("login");
    } catch (err) {
      alert("Verification failed.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">

      {/* HERO */}
      <div className="text-center mb-8 max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight whitespace-nowrap">
          Streamline your campus, effortlessly.
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage schedules, notices, and rooms — all in one place.
        </p>
      </div>

      {/* CARD */}
      <div className="cp-card w-full max-w-md p-6 shadow-lg">

        {/* TITLE */}
        <div className="text-center mb-6">
          <img src="/logo.png" className="h-10 mx-auto mb-2" />
          <h2 className="text-lg font-extrabold">
            {isLogin
              ? "CampusPulse"
              : isVerify
              ? "Verify OTP"
              : "Create your account"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? "Welcome!"
              : isVerify
              ? "Enter the OTP sent to your email"
              : "Register to continue"}
          </p>
        </div>

        {/* EMAIL */}
        <div className="relative mb-3">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Email"
            className="w-full pl-9 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        {/* PASSWORD */}
        {!isVerify && (
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-9 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
        )}

        {/* OTP */}
        {isVerify && (
          <div className="mb-4">
            <input
              placeholder="Enter OTP"
              className="w-full p-2 border rounded-lg"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
            />
          </div>
        )}

        {/* MAIN BUTTON */}
        <button
          onClick={isVerify ? handleVerify : handleSubmit}
          className="w-full border border-primary text-primary p-2 rounded-lg hover:bg-primary/10 transition font-semibold"
        >
          {isVerify
            ? "Verify OTP"
            : isLogin
            ? "Login"
            : "Create Account"}
        </button>

        {/* DIVIDER */}
        {!isVerify && (
          <>
            <div className="flex items-center gap-2 my-5">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* SWITCH */}
            <button
              onClick={() => setMode(isLogin ? "register" : "login")}
              className="w-full border border-primary text-primary p-2 rounded-lg hover:bg-primary/10 transition font-medium"
            >
              {isLogin ? "Create Account" : "Back to Login"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
