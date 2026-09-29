import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./features/auth/login/login.component";
import {HomeComponent} from "./features/user/home/home.component";
import {AboutComponent} from "./features/user/about/about.component";
import {CategoryComponent} from "./features/user/category/category.component";
import {CartComponent} from "./features/user/cart/cart.component";
import {CheckoutComponent} from "./features/user/checkout/checkout.component";
import {ProductDetailComponent} from "./features/user/product-detail/product-detail.component";
import {AccountComponent} from "./features/user/account/account.component";
import {ContactComponent} from "./features/user/contact/contact.component";
import {NotFoundComponent} from "./features/user/not-found/not-found.component";
import {OrderConfirmationComponent} from "./features/user/order-confirmation/order-confirmation.component";
import {RegisterComponent} from "./features/user/register/register.component";
import {SearchResultComponent} from "./features/user/search-result/search-result.component";
import {DashboardComponent} from "./features/admin/features/dashboard/dashboard.component";
import {LayoutComponent} from "./features/admin/shared/layout/layout.component";
import {UserListComponent} from "./features/admin/features/user-list/user-list.component";
import {CreateUserComponent} from "./features/admin/features/create-user/create-user.component";
import {ProductListComponent} from "./features/admin/features/product-list/product-list.component";
import {CreateProductComponent} from "./features/admin/features/create-product/create-product.component";
import {OrderListComponent} from "./features/admin/features/order-list/order-list.component";
import {ReportsComponent} from "./features/admin/features/reports/reports.component";
import {AuthGuard} from "./core/guards/auth.guard";
import {AdminGuard} from "./core/guards/admin.guard";
import {RoleGuard} from "./core/guards/role.guard";
import {RegisterUserComponent} from "./features/user/register-user/register-user.component";
import {ToastComponent} from "./features/user/toast/toast.component";
import {CategoryListComponent} from "./features/admin/features/category-list/category-list.component";
import {MyOrdersComponent} from "./features/user/account/child-account/my-orders/my-orders.component";
import {MyWishlistComponent} from "./features/user/account/child-account/my-wishlist/my-wishlist.component";
import {MyProfileComponent} from "./features/user/account/child-account/my-profile/my-profile.component";
import {SettingsComponent} from "./features/user/account/child-account/settings/settings.component";
import {MyAddressComponent} from "./features/user/account/child-account/my-address/my-address.component";
import {PaymentMethodsComponent} from "./features/user/account/child-account/payment-methods/payment-methods.component";
import {MyReviewsComponent} from "./features/user/account/child-account/my-reviews/my-reviews.component";
import {ValidateOtpComponent} from "./features/user/validate-otp/validate-otp.component";
import {OrderDetailComponent} from "./features/admin/features/order-detail/order-detail.component";
import {TrackingOrderComponent} from "./features/admin/features/tracking-order/tracking-order.component";
import {PaymentResultComponent} from "./features/user/payment-result/payment-result.component";
import {
  ValidateOtpRegisterUserComponent
} from "./features/auth/validate-otp-register-user/validate-otp-register-user.component";


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {path:'toast',component:ToastComponent},
  {path:'login' , component: LoginComponent},
  {path:'register-user' , component: RegisterUserComponent},
  {path:'register' , component: RegisterComponent},
  {path:'validate-otp-register-user' , component: ValidateOtpRegisterUserComponent},
  // ===== PUBLIC ROUTES - AI CŨNG XEM ĐƯỢC (Không cần login) =====
  {
    path:'home',
    component: HomeComponent
    // Không có guard - ai cũng vào được
  },
  {
    path:'about',
    component: AboutComponent
  },
  {
    path:'category',
    component: CategoryComponent
  },
  {
    path:'product-detail/:slug',
    component: ProductDetailComponent
  },
  {
    path:'contact',
    component:ContactComponent
  },
  {
    path:'search-result',
    component:SearchResultComponent
  },

  // ===== PROTECTED ROUTES - BẮT BUỘC LOGIN (Customer only) =====
  {
    path:'cart',
    component: CartComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['customer'] }
  },
  {
    path:'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['customer'] }
  },
  {
    path:'validate-otp',
    component: ValidateOtpComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['customer'] }
  },

  {
    path:'account',
    component:AccountComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['customer'] },
    children: [
      { path: '', redirectTo: 'orders', pathMatch: 'full' }, // Default redirect to orders
      {
        path: 'orders',
        component: MyOrdersComponent // Import component này nhé
      },
      {
        path: 'wishlist',
        component: MyWishlistComponent
      },
      {
        path: 'payment-methods',
        component: PaymentMethodsComponent
      },
      {
        path: 'reviews',
        component: MyReviewsComponent
      },
      {
        path: 'addresses',
        component: MyAddressComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      }
    ]
  },
  {
    path:'order-confirm',
    component:OrderConfirmationComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['customer'] }
  },
  {
    path:'payment-result',
    component:PaymentResultComponent,
    // canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['customer'] }
  },


  // ===== ADMIN ROUTES - CHỈ ADMIN MỚI VÀO ĐƯỢC =====
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate:[AdminGuard]
      },
      {
        path: 'users-list',
        component:UserListComponent,
        canActivate:[AdminGuard]
      },
      {
        path: 'update-user/:uuid',
        component: CreateUserComponent,
        canActivate:[AdminGuard]
      },
      {
        path: 'product-list',
        component: ProductListComponent,
        canActivate:[AdminGuard]
      },
      {
        path: 'create-product',
        component: CreateProductComponent,
        canActivate:[AdminGuard]
      },
      {
        path: 'orders-list',
        component: OrderListComponent,
        canActivate:[AdminGuard]
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate:[AdminGuard]
      },
      {
        path:'category-list',
        component:CategoryListComponent,
        canActivate:[AdminGuard]
      },
      {
        path:'order-detail/:id',
        component:OrderDetailComponent,
        canActivate:[AdminGuard]
      },
      {
        path:'tracking-order/:id',
        component:TrackingOrderComponent,
        canActivate:[AdminGuard]
      }
    ]
  },

  // Backward compatibility (redirect old routes)
  { path: 'dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'layout', redirectTo: 'admin', pathMatch: 'full' },

  // 404 page
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
