import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import RiderLogin from "./pages/rider/RiderLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";

// Lazy Loaded Pages
const HomeLayout = lazy(() => import("./pages/HomeLayout"));
const AddCategory = lazy(() => import("./pages/AddCategory"));
const Coupons = lazy(() => import("./pages/Coupons"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Restaurants = lazy(() => import("./pages/Restaurants"));
const Products = lazy(() => import("./pages/Products"));
const Users = lazy(() => import("./pages/Users"));
const Banners = lazy(() => import("./pages/Banners"));
const AllOrders = lazy(() => import("./pages/AllOrders"));
const Categories = lazy(() => import("./pages/Categories"));
const AdminProfile = lazy(() => import("./pages/AdminProfile"));
const RestaurantMenu = lazy(() => import("./pages/RestaurantMenu"));
const UserDetails = lazy(() => import("./pages/UserDetails"));
const UserOrders = lazy(() => import("./pages/UserOrders"));
const UserAddresses = lazy(() => import("./pages/UserAddresses"));
const UserCart = lazy(() => import("./pages/UserCart"));
const RestaurantOrders = lazy(() => import("./pages/RestaurantOrders"));
const RestaurantDashboard = lazy(() => import("./pages/RestaurantDashboard"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Quickfilters = lazy(() => import("./pages/Quickfilters"));
const HeaderEditor = lazy(() => import("./pages/HeaderEditor"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const BrandManager = lazy(() => import("./pages/BrandManager"));
const AppNotifications = lazy(() => import("./pages/Appnotifications"));
const DeliveryPanel = lazy(() => import("./pages/DeliveryPanel"));
const RiderDashboard = lazy(() => import("./pages/rider/RiderDashboard"));
const RiderEarnings = lazy(() => import("./pages/rider/RiderEarnings"));
const RiderProfile = lazy(() => import("./pages/rider/RiderProfile"));
const EventsEditor = lazy(() => import("./pages/EventsEditor"));
const SupportTickets = lazy(() => import("./pages/SupportTickets"));
const SupportTicketDetails = lazy(() => import("./pages/SupportTicketDetails"));
const ServiceableAreas = lazy(() => import("./pages/ServiceableAreas"));
const AppConfig = lazy(() => import("./pages/AppConfig"));
const PopupModalManager = lazy(() => import("./pages/PopupModalManager"));

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Loading...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/rider/login" element={<RiderLogin />} />

            <Route path="/rider/dashboard" element={<RiderDashboard />} />
            <Route path="/rider/earnings" element={<RiderEarnings />} />
            <Route path="/rider/profile" element={<RiderProfile />} />

            <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
            <Route path="/brand-manager" element={<ProtectedRoute><BrandManager /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
            <Route path="/admin/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/home-layout" element={<ProtectedRoute><HomeLayout /></ProtectedRoute>} />
            <Route path="/admin/restaurants/:restaurantId/menu" element={<ProtectedRoute><RestaurantMenu /></ProtectedRoute>} />
            <Route path="/admin/add-category" element={<ProtectedRoute><AddCategory /></ProtectedRoute>} />
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
            <Route path="/events-editor" element={<ProtectedRoute><EventsEditor /></ProtectedRoute>} />
            <Route path="/app-notifications" element={<ProtectedRoute><AppNotifications /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
            <Route path="/support/ticket/:id" element={<ProtectedRoute><SupportTicketDetails /></ProtectedRoute>} />
            <Route path="/serviceable-areas" element={<ProtectedRoute><ServiceableAreas /></ProtectedRoute>} />
            <Route path="/app-config" element={<ProtectedRoute><AppConfig /></ProtectedRoute>} />
            <Route path="/popup-modal" element={<ProtectedRoute><PopupModalManager /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}