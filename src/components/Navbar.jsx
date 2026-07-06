import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ display: "flex", gap: "1rem", justifyContent: "center"}}>
      <Link to="/">Home</Link>
      <Link to="/calendar">Calendar</Link>
      <Link to="/create">Create Task</Link>
      <Link to="/recycling-bin">Recycling Bin</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}

export default Navbar;