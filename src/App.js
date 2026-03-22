import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeLayout from "./pages/HomeLayout";
import AddCategory from "./pages/AddCategory";
import Coupons from "./pages/Coupons";
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
import RestaurantOrders from "./pages/RestaurantOrders";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import OrderDetails from "./pages/OrderDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Quickfilters from "./pages/Quickfilters";
import HeaderEditor from "./pages/HeaderEditor";
import Campaigns from "./pages/Campaigns";
import BrandManager from "./pages/BrandManager";
import AppNotifications from "./pages/Appnotifications"; // ✅ NEW
import { ToastProvider } from "./context/ToastContext";
import DeliveryPanel from "./pages/DeliveryPanel";
import RiderLogin     from "./pages/rider/RiderLogin";
import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderEarnings  from "./pages/rider/RiderEarnings";
import RiderProfile   from "./pages/rider/RiderProfile";
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Login />} />
<Route path="/rider/login"     element={<RiderLogin />} />
<Route path="/rider/dashboard" element={<RiderDashboard />} />
<Route path="/rider/earnings"  element={<RiderEarnings />} />
<Route path="/rider/profile"   element={<RiderProfile />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
          <Route path="/brand-manager" element={<ProtectedRoute><BrandManager /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="/home-layout" element={<ProtectedRoute><HomeLayout /></ProtectedRoute>} />
          <Route path="/admin/restaurants/:restaurantId/menu" element={<RestaurantMenu />} />
          <Route path="/admin/add-category" element={<AddCategory />} />
          <Route path="/quick-filters" element={<ProtectedRoute><Quickfilters /></ProtectedRoute>} />
          <Route path="/header-editor" element={<ProtectedRoute><HeaderEditor /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><AllOrders /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/restaurants" element={<ProtectedRoute><Restaurants /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
          <Route path="/admin/users/:id/orders" element={<ProtectedRoute><UserOrders /></ProtectedRoute>} />
          <Route path="/admin/users/:id/addresses" element={<ProtectedRoute><UserAddresses /></ProtectedRoute>} />
          <Route path="/admin/users/:id/cart" element={<ProtectedRoute><UserCart /></ProtectedRoute>} />
          <Route path="/restaurants/:id/orders" element={<ProtectedRoute><RestaurantOrders /></ProtectedRoute>} />
          <Route path="/restaurants/:id/dashboard" element={<ProtectedRoute><RestaurantDashboard /></ProtectedRoute>} />
          <Route path="/banners" element={<ProtectedRoute><Banners /></ProtectedRoute>} />
<Route path="/delivery" element={<ProtectedRoute><DeliveryPanel /></ProtectedRoute>} />
          {/* ✅ NEW */}
          <Route path="/app-notifications" element={<ProtectedRoute><AppNotifications /></ProtectedRoute>} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}