// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      <Routes>
        {/* <Route path="/app" element={<LoginForm />} />
        <Route path="/dashboard/*" element={<Dashboard />} /> */}

        <Route path="/app">
          {/* /app → Login */}
          <Route index element={<LoginForm />} />

          {/* /app/dashboard → Dashboard */}
          <Route path="dashboard/*" element={<Dashboard />} />

          {/* Redirect anything else to /app */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
