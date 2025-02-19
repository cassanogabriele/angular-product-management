import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-allproducts',
  templateUrl: './allproducts.component.html',
  styleUrls: ['./allproducts.component.css']
})
export class AllproductsComponent implements OnInit {
  products: any[] = [];
  userInfo: any;
  userId: any;
  categoryId?: number;  
  categoryTitle: string = ''; // Nouvelle propriété pour le titre de la catégorie
  wishlist: any;
  showWishlistSelect: boolean = false;
  product: any;   
  wishlists: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute, 
    private productService: ProductService 
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const categoryIdParam = params.get('categoryId');
      if (categoryIdParam) {
        this.categoryId = +categoryIdParam;
        this.getCategoryTitle(this.categoryId); 
        this.getProductsByCategory(this.categoryId);
      }
    });
  } 

  // Ajouter le produit à la liste de souhaits
  handleWishlistClick(productId: any): void {  
    if (!this.dataService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/wishlist', productId]);
    }   
  }    

  placeholderArray(category: any): any[] {
    const remaining = 3 - category.products.length;
    return new Array(remaining).fill(null);
  }

  getProductsByCategory(categoryId: number): void {
    this.dataService.getProductsByCategory(categoryId).subscribe(
      (res) => {
        this.products = res;
      },
      (err) => {
        console.error('Erreur lors de la récupération des produits:', err);
      }
    );
  }

  // Nouvelle méthode pour récupérer le titre de la catégorie
  getCategoryTitle(categoryId: number): void {
    this.dataService.getCategoryById(categoryId).subscribe(
      (res) => {
        this.categoryTitle = res.name; 
      },
      (err) => {
        console.error('Erreur lors de la récupération du titre de la catégorie:', err);
      }
    );
  }

  viewProductDetails(productId: number): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;

        this.productService.recordViewedProduct(productId, this.userId).subscribe(() => {
          this.router.navigate(['/wishlist', productId]);
        });
      },
      (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur:', err);
      }
    );
  }

  // Ajouter un produit au panier 
  handleAddToCart(productId: number): void {  
   this.router.navigate(['/cart-confirmation', productId]);
  }
}
