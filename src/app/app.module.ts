import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductsComponent } from './components/products/products.component';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ProductEditComponent } from './components/product-edit/product-edit.component';
import { CreateProductComponent } from './components/create-product/create-product.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthComponent } from './components/auth/auth.component';
import { SignupComponent } from './components/signup/signup.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AllproductsComponent } from './components/allproducts/allproducts.component';
import { ProductDetailsComponent } from './components/productdetails/productdetails.component';
import { HomeComponent } from './components/home/home.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { WishlistDetailsComponent } from './components/wishlist-details/wishlist-details.component';

const appRoutes: Routes = [
  {
    path: 'login', component: AuthComponent
  },
  {
    path: 'home', component: HomeComponent
  },
  {
    path: 'signup', component: SignupComponent
  },
  {
    path: 'profile', component: ProfileComponent
  },
  {
    path: 'all-products/:categoryId', component: AllproductsComponent
  },
  {
    path: 'product/:id', component: ProductDetailsComponent
  },
  {
    path: 'my-products', component: ProductsComponent
  },
  {
    path: 'edit/:id', component: ProductEditComponent
  },
  {
    path: 'create-product', component: CreateProductComponent
  },
  {
    path: 'wishlist/:productId', component: WishlistComponent
  },  
  {
    path: 'wishlist-details', component: WishlistDetailsComponent
  }, 
  {
     path: '', redirectTo: '/home', pathMatch: 'full' 
  },
  { 
    path: '', redirectTo: '/products', pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    AppComponent,
    ProductsComponent,
    NavbarComponent,
    ProductEditComponent,
    CreateProductComponent,
    AuthComponent,
    SignupComponent,
    ProfileComponent,
    AllproductsComponent,
    ProductDetailsComponent,
    HomeComponent, 
    WishlistComponent, WishlistDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
