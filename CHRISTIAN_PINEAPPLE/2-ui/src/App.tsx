import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import { setNavigate } from "./router";
import { AuthenticatedRoute, UnAuthenticatedRoute } from "./Guards/Guards";
import { Login } from "./auth/login/Login";
import { Register } from "./auth/register/Register";
import { VerifyEmail } from "./auth/verify-email/VerifyEmail";
import { Home } from "./Home/Home";

export const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <UnAuthenticatedRoute>
              <Login />
            </UnAuthenticatedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <UnAuthenticatedRoute>
              <Register />
            </UnAuthenticatedRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <UnAuthenticatedRoute>
              <VerifyEmail />
            </UnAuthenticatedRoute>
          }
        />
        <Route
          path="/"
          element={
            <AuthenticatedRoute>
              <Home />
            </AuthenticatedRoute>
          }
        />

        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </>
  );
};
