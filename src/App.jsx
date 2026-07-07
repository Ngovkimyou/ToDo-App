import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import CreateTask from "./pages/CreateTask";
import RecyclingBin from "./pages/RecyclingBin";
import About from "./pages/About";

function App() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-panel">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/create" element={<CreateTask />} />
          <Route path="/recycling-bin" element={<RecyclingBin />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
