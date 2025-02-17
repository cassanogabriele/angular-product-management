import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-wishlist-details',
  templateUrl: './wishlist-details.component.html',
  styleUrls: ['./wishlist-details.component.css']
})
export class WishlistDetailsComponent implements OnInit {
  alertMessage = ''; 
  alertVisible = false; 
  userInfo: any;
  wishlists: any[] = [];  
  selectedWishlist: any = null;  

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    const successMessage = sessionStorage.getItem('wishlistSuccessMessage');
    if (successMessage) {
      this.showAlert(successMessage);
      sessionStorage.removeItem('wishlistSuccessMessage');
    }
    this.loadWishlists();
  }

  loadWishlists(): void {
    this.dataService.getUserInfo().subscribe(data => {
      this.userInfo = data;
      this.dataService.getWishlist(this.userInfo.id).subscribe(res => {
        this.wishlists = res.wishlists || [];
      });
    });
  }

  onWishlistChange(event: any): void {
    this.selectedWishlist = this.wishlists.find(wl => wl.id == event.target.value);
  }

  removeProduct(wishlistId: number, productId: number): void {
    this.dataService.removeProductFromWishlist(wishlistId, productId).subscribe(() => {
      this.showAlert('Produit supprimé.');
      
      // Mise à jour de la liste des produits dans selectedWishlist
      if (this.selectedWishlist) {
        this.selectedWishlist.products = this.selectedWishlist.products.filter((product: any) => product.id !== productId);
      }
    });
  }  
  

  showAlert(message: string): void {
    this.alertMessage = message;
    this.alertVisible = true;
    setTimeout(() => (this.alertVisible = false), 3000);
  }

  closeAlert(): void {
    this.alertVisible = false;
  }
}
