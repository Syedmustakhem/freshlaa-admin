import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeLayout from "./pages/HomeLayout";
import AddCategory from "./pages/AddCategory";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Restaurants from "./pages/Restaurants";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Banners from "./pages/Banners";
import AllOrders from "./pages/AllOrders";
import Categories from "./pages/Categories";
import AdminProfile from "./pages/AdminProfile";
import RestaurantMenu from "./pages/RestaurantMenu";
import UserDetails from "./pages/UserDetails";
import UserOrders from "./pages/UserOrders";
import UserAddresses from "./pages/UserAddresses";
import UserCart from "./pages/UserCart";
import RestaurantOrders from "./pages/RestaurantOrders"
import RestaurantDashboard from "./pages/RestaurantDashboard"
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
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

          {/* ADMIN PROFILE */}
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          <Route
  path="/home-layout"
  element={
    <ProtectedRoute>
      <HomeLayout />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/restaurants/:restaurantId/menu"
  element={<RestaurantMenu />}
/>

<Route path="/admin/add-category" element={<AddCategory />} />

          {/* GLOBAL ORDERS */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AllOrders />
              </ProtectedRoute>
            }
          />

          {/* CATEGORIES */}
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
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* USER MANAGEMENT */}
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
<Route
  path="/restaurants/:id/orders"
  element={
    <ProtectedRoute>
      <RestaurantOrders />
    </ProtectedRoute>
  }
/>



<Route
  path="/restaurants/:id/dashboard"
  element={
    <ProtectedRoute>
      <RestaurantDashboard />
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
      </ToastProvider>
    </BrowserRouter>
  );
}
