import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './features/auth/login/login.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HomeComponent } from './features/user/home/home.component';
import { AboutComponent } from './features/user/about/about.component';
import { CategoryComponent } from './features/user/category/category.component';
import { ProductDetailComponent } from './features/user/product-detail/product-detail.component';
import { CartComponent } from './features/user/cart/cart.component';
import { CheckoutComponent } from './features/user/checkout/checkout.component';
import { ContactComponent } from './features/user/contact/contact.component';
import { AccountComponent } from './features/user/account/account.component';
import { NotFoundComponent } from './features/user/not-found/not-found.component';
import { OrderConfirmationComponent } from './features/user/order-confirmation/order-confirmation.component';
import { RegisterComponent } from './features/user/register/register.component';
import { SearchResultComponent } from './features/user/search-result/search-result.component';
import { DashboardComponent } from './features/admin/features/dashboard/dashboard.component';
import { LayoutComponent } from './features/admin/shared/layout/layout.component';
import { UserListComponent } from './features/admin/features/user-list/user-list.component';
import { CreateUserComponent } from './features/admin/features/create-user/create-user.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ProductListComponent } from './features/admin/features/product-list/product-list.component';
import { CreateProductComponent } from './features/admin/features/create-product/create-product.component';
import { OrderListComponent } from './features/admin/features/order-list/order-list.component';
import { ReportsComponent } from './features/admin/features/reports/reports.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import { RegisterUserComponent } from './features/user/register-user/register-user.component';
import { ToastComponent } from './features/user/toast/toast.component';
import { CategoryListComponent } from './features/admin/features/category-list/category-list.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { MyProfileComponent } from './features/user/account/child-account/my-profile/my-profile.component';
import { MyOrdersComponent } from './features/user/account/child-account/my-orders/my-orders.component';
import { MyWishlistComponent } from './features/user/account/child-account/my-wishlist/my-wishlist.component';
import { SettingsComponent } from './features/user/account/child-account/settings/settings.component';
import { MyReviewsComponent } from './features/user/account/child-account/my-reviews/my-reviews.component';
import { MyAddressComponent } from './features/user/account/child-account/my-address/my-address.component';
import { PaymentMethodsComponent } from './features/user/account/child-account/payment-methods/payment-methods.component';
import {ValidateOtpComponent} from "./features/user/validate-otp/validate-otp.component";
import { OrderDetailComponent } from './features/admin/features/order-detail/order-detail.component';
import { TrackingOrderComponent } from './features/admin/features/tracking-order/tracking-order.component';
import { PaymentResultComponent } from './features/user/payment-result/payment-result.component';
import { ValidateOtpRegisterUserComponent } from './features/auth/validate-otp-register-user/validate-otp-register-user.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    AboutComponent,
    CategoryComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    ContactComponent,
    AccountComponent,
    NotFoundComponent,
    OrderConfirmationComponent,
    RegisterComponent,
    SearchResultComponent,
    DashboardComponent,
    LayoutComponent,
    UserListComponent,
    CreateUserComponent,
    ProductListComponent,
    CreateProductComponent,
    OrderListComponent,
    ReportsComponent,
    RegisterUserComponent,
    ToastComponent,
    CategoryListComponent,
    MyProfileComponent,
    MyOrdersComponent,
    MyWishlistComponent,
    SettingsComponent,
    MyReviewsComponent,
    MyAddressComponent,
    PaymentMethodsComponent,
    ValidateOtpComponent,
    OrderDetailComponent,
    TrackingOrderComponent,
    PaymentResultComponent,
    ValidateOtpRegisterUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
