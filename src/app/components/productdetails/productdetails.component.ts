import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-details',
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (productId) {
      this.dataService.getProductById(+productId).subscribe(
        (res) => {
          this.product = res;
        },
        (err) => {
          console.error('Erreur lors de la récupération des détails:', err);
        }
      );
    }
    
    this.dataService.loggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });
  }

  // Ajouter un produit au panier 
  handleAddToCart(productId: number): void {  
    this.router.navigate(['/cart-confirmation', productId]);
  }

  // Ajouter le produit à la liste de souhaits
  handleWishlistClick(productId: any): void {  
    if (!this.dataService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/wishlist', productId]);
    }   
  }    
}
