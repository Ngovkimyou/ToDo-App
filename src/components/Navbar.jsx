import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import aboutIcon from "../assets/About-icon.avif";
import calendarIcon from "../assets/Calendar-icon.avif";
import checklistIcon from "../assets/CheckList-icon.avif";
import createTaskIcon from "../assets/CreateTask-icon.avif";
import recyclingBinIcon from "../assets/RecyclingBin-icon.avif";
import blackAboutIcon from "../assets/black-About-icon.avif";
import blackCalendarIcon from "../assets/black-Calendar-icon.avif";
import blackChecklistIcon from "../assets/black-CheckList-icon.avif";
import blackCreateTaskIcon from "../assets/black-CreateTask-icon.avif";
import blackRecyclingBinIcon from "../assets/black-RecyclingBin-icon.avif";

const navItems = [
  { to: "/", label: "Checklist", icon: checklistIcon, hoverIcon: blackChecklistIcon },
  { to: "/calendar", label: "Calendar", icon: calendarIcon, hoverIcon: blackCalendarIcon },
  { to: "/create", label: "Create Task", icon: createTaskIcon, hoverIcon: blackCreateTaskIcon },
  {
    to: "/recycling-bin",
    label: "Recycling Bin",
    icon: recyclingBinIcon,
    hoverIcon: blackRecyclingBinIcon,
  },
  { to: "/about", label: "About", icon: aboutIcon, hoverIcon: blackAboutIcon },
];

function Navbar() {
  const location = useLocation();
  const navRef = useRef(null);
  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState(null);

  const updateIndicator = useCallback(() => {
    const nav = navRef.current;
    const activeLink = linkRefs.current[location.pathname];

    if (!nav || !activeLink) {
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    setIndicator({
      x: linkRect.left - navRect.left - 5,
      y: linkRect.top - navRect.top - 8,
      width: linkRect.width + 39,
      height: linkRect.height + 16,
    });
  }, [location.pathname]);

  useLayoutEffect(() => {
    updateIndicator();

    window.addEventListener("resize", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  return (
    <nav ref={navRef} className="sidebar-nav" aria-label="Main navigation">
      {indicator && (
        <span
          className="nav-active-indicator"
          style={{
            width: `${indicator.width}px`,
            height: `${indicator.height}px`,
            transform: `translate(${indicator.x}px, ${indicator.y}px)`,
          }}
          aria-hidden="true"
        />
      )}

      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          ref={(element) => {
            linkRefs.current[item.to] = element;
          }}
          className={({ isActive }) =>
            isActive ? "nav-pill nav-pill-active" : "nav-pill"
          }
        >
          <span className="nav-pill-inner">
            <span className="nav-icon-wrap" aria-hidden="true">
              <img className="nav-icon nav-icon-default" src={item.icon} alt="" />
              <img className="nav-icon nav-icon-hover" src={item.hoverIcon} alt="" />
            </span>
            <span>{item.label}</span>
          </span>
        </NavLink>
      ))}
    </nav>
  );
}

export default Navbar;
