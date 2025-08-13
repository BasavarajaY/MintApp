// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      <Routes>
        <Route path="/app" element={<LoginForm />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
