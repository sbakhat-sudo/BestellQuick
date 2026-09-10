import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { Spinner } from '@/components/ui/Spinner'
import Landing from '@/pages/Landing'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'

const Overview = lazy(() => import('@/pages/dashboard/Overview'))
const Menu = lazy(() => import('@/pages/dashboard/Menu'))
const Orders = lazy(() => import('@/pages/dashboard/Orders'))
const Offers = lazy(() => import('@/pages/dashboard/Offers'))
const Marketing = lazy(() => import('@/pages/dashboard/Marketing'))
const Analytics = lazy(() => import('@/pages/dashboard/Analytics'))
const Settings = lazy(() => import('@/pages/dashboard/Settings'))
const RestaurantMenu = lazy(() => import('@/pages/public/RestaurantMenu'))
const OrderTracking = lazy(() => import('@/pages/public/OrderTracking'))

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/r/:slug" element={<RestaurantMenu />} />
        <Route path="/r/:slug/order/:orderId" element={<OrderTracking />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="menu" element={<Menu />} />
            <Route path="orders" element={<Orders />} />
            <Route path="offers" element={<Offers />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
