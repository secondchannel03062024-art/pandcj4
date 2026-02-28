import { createBrowserRouter } from "react-router";
import RootLayout from "./RootLayout";
import Layout from "./Layout";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminCategories from "./pages/admin/AdminCategories";
import BannersPage from "./pages/admin/BannersPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: HomePage },
          { path: "shop", Component: ShopPage },
          { path: "shop/:category", Component: ShopPage },
          { path: "shop/:category/:subCategory", Component: ShopPage },
          { path: "product/:id", Component: ProductDetailPage },
          { path: "wishlist", Component: WishlistPage },
          { path: "cart", Component: CartPage },
          { path: "checkout", Component: CheckoutPage },
          { path: "order-confirmation/:orderId", Component: OrderConfirmationPage },
          { path: "orders", Component: MyOrdersPage },
          { path: "order/:orderId", Component: OrderDetailPage },
          { path: "profile", Component: ProfilePage },
          { path: "sign-in", Component: SignInPage },
          { path: "sign-up", Component: SignUpPage },
          {
            path: "admin",
            Component: AdminDashboard,
            children: [
              { index: true, Component: AdminOrders },
              { path: "orders", Component: AdminOrders },
              { path: "products", Component: AdminProducts },
              { path: "categories", Component: AdminCategories },
              { path: "coupons", Component: AdminCoupons },
              { path: "banners", Component: BannersPage }
            ]
          },
          { path: "*", Component: NotFoundPage }
        ]
      }
    ]
  }
]);