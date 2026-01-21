import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Restaurants from "./pages/Restaurants";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Banners from "./pages/Banners";
import AllOrders from "./pages/AllOrders";
import Categories from "./pages/Categories";

import UserDetails from "./pages/UserDetails";
import UserOrders from "./pages/UserOrders";
import UserAddresses from "./pages/UserAddresses";
import UserCart from "./pages/UserCart";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
<Route
  path="/orders"
  element={
    <ProtectedRoute>
      <AllOrders />
    </ProtectedRoute>
  }
/>
<Route
  path="/categories"
  element={
    <ProtectedRoute>
      <Categories />
    </ProtectedRoute>
  }
/>

        {/* CORE MODULES */}
        <Route
          path="/restaurants"
          element={
            <ProtectedRoute>
              <Restaurants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* 🔥 USER MANAGEMENT (NEW) */}
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users/:id/orders"
          element={
            <ProtectedRoute>
              <UserOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users/:id/addresses"
          element={
            <ProtectedRoute>
              <UserAddresses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users/:id/cart"
          element={
            <ProtectedRoute>
              <UserCart />
            </ProtectedRoute>
          }
        />

        {/* BANNERS */}
        <Route
          path="/banners"
          element={
            <ProtectedRoute>
              <Banners />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
