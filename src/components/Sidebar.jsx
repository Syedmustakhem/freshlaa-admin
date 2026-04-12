import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Store, Package, Layers,
  ShoppingCart, Users, Image, Home, Sparkles,
  Filter, Megaphone, Ticket, Search, Bell,
} from "lucide-react";
import { Star } from "lucide-react";

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
        <NavItem to="/coupons" icon={<Ticket size={18} />} label="Coupons" />
        <NavItem to="/orders" icon={<ShoppingCart size={18} />} label="Orders" />
        <NavItem to="/users" icon={<Users size={18} />} label="Users" />
        <NavItem to="/banners" icon={<Image size={18} />} label="Banners" />
        <NavItem to="/home-layout" icon={<Home size={18} />} label="Home Layout" />
        <NavItem to="/brand-manager" icon={<Sparkles size={18} />} label="Brand Manager" />
        <NavItem to="/quick-filters" icon={<Filter size={18} />} label="Quick Filters" />
        <NavItem to="/header-editor" icon={<Search size={18} />} label="Header" />
        <NavItem to="/campaigns" icon={<Megaphone size={18} />} label="Campaigns" />
        <NavItem to="/reviews" icon={<Star size={18} />} label="Reviews" />

        {/* ✅ NEW */}
        <NavItem to="/app-notifications" icon={<Bell size={18} />} label="App Notifications" />
        <NavItem to="/delivery" icon={<span>🛵</span>} label="Delivery Panel" />
      </nav>
    </aside>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
    >
      <span className="icon">{icon}</span>
      <span className="label">{label}</span>
    </NavLink>
  );
}