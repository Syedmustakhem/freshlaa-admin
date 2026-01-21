import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="bg-dark text-white vh-100 p-3" style={{ width: "240px" }}>
      <h5 className="mb-4">FreshLaa Admin</h5>

      <NavLink className="nav-link text-white" to="/dashboard">
        Dashboard
      </NavLink>
      <NavLink className="nav-link text-white" to="/restaurants">
        Restaurants
      </NavLink>
      <NavLink className="nav-link text-white" to="/products">
        Products
      </NavLink>
      <NavLink className="nav-link text-white" to="/categories">
        Categories
      </NavLink>
      <NavLink className="nav-link text-white" to="/orders">
        Orders
      </NavLink>
      <NavLink className="nav-link text-white" to="/users">
        Users
      </NavLink>
      <NavLink className="nav-link text-white" to="/banners">
        Banners
      </NavLink>
    </div>
  );
}
