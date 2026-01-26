import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Image,
  Home,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h4>FreshLaa</h4>
        <span>Admin Panel</span>
      </div>

      <nav className="sidebar-nav">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavItem to="/restaurants" icon={<Store size={18} />} label="Restaurants" />
        <NavItem to="/products" icon={<Package size={18} />} label="Products" />
        <NavItem to="/categories" icon={<Layers size={18} />} label="Categories" />
        <NavItem to="/orders" icon={<ShoppingCart size={18} />} label="Orders" />
        <NavItem to="/users" icon={<Users size={18} />} label="Users" />
        <NavItem to="/banners" icon={<Image size={18} />} label="Banners" />
        <NavItem
  to="/home-layout"
  icon={<Home size={18} />}
  label="Home Layout"
/>

      </nav>
    </aside>
  );
}

/* ===== Sidebar Item ===== */
function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`
      }
    >
      <span className="icon">{icon}</span>
      <span className="label">{label}</span>
    </NavLink>
  );
}
