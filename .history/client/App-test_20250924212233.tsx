import "./global.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Simple test component to make sure React works
const TestComponent = () => (
  <div style={{ padding: '20px', fontSize: '24px', color: 'red' }}>
    <h1>🎉 REACT IS WORKING! 🎉</h1>
    <p>If you see this, React is loading properly.</p>
    <p>The server is running on localhost:8080</p>
  </div>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TestComponent />} />
      <Route path="*" element={<TestComponent />} />
    </Routes>
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(<App />);