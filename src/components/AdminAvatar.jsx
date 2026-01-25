import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAvatar() {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <div className="avatar-wrapper" ref={ref}>
      <button
        className="avatar-btn"
        onClick={() => setOpen(!open)}
      >
        <span className="avatar-circle">A</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="avatar-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="avatar-user">
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>

            {/* ✅ PROFILE NAVIGATION */}
            <button
              onClick={() => {
                setOpen(false);
                navigate("/admin/profile");
              }}
            >
              Profile
            </button>

            <button className="danger" onClick={logout}>
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
