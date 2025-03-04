import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ProductService } from 'src/app/services/product.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  recentProducts: any[] = [];
  recentlyViewedProducts: any[] = [];
  localRecentlyViewedProducts: any[] = [];
  limitedProducts: any[] = [];  // Catégories avec produits (format que l'API renvoie)
  userInfo: any;
  userId: any;
  successMessage: string | null = null;
  isLoggedIn: boolean = false;
  totalItems: number = 0; 
  cartItems: any[] = [];

  constructor(
    private dataService: DataService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute, 
  ) {}

  ngOnInit(): void {
    // Récupérer le message de succès depuis sessionStorage
    this.successMessage = sessionStorage.getItem('userLoginSuccessMessage');

    // Supprimer le message après l'avoir récupéré
    sessionStorage.removeItem('userLoginSuccessMessage');

    // S'abonner à l'état de connexion
    this.dataService.loggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });

    this.loadRecentProducts();
    this.loadRecentlyViewedProducts();
    this.loadProductsByCategory();

    this.dataService.loggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      
      if (this.isLoggedIn) {
        this.dataService.getUserInfo().subscribe(
          (data: any) => {
            this.userInfo = data;
            this.userId = this.userInfo.id;
      
            // Récupérer les articles du panier pour cet utilisateur
            this.dataService.getCart(this.userId).subscribe(response => {
              if (response.cartItems && typeof response.cartItems === 'object') {        
                this.totalItems = response.uniqueProductCount || 0; 
                
                this.dataService.updateTotalItems(this.totalItems);
              } 
            });

            // Mettre à jour l'aperçu de panier dans la navbar 
            this.dataService.refreshCartPreview(this.userId); 
          }
        );    
      } else {
        // Récupération des informations du panier local 
        let localCart = JSON.parse(sessionStorage.getItem('cart') || '[]');

        if (localCart) {
          this.cartItems = JSON.parse(localCart);
      
          // Calcul du total avec la bonne structure
          this.totalItems = this.cartItems.reduce((sum: number, item: any) => 
            sum + ((item.product?.prix || 0) * (item.quantite || 1)), 0
          );
        } 

        this.dataService.updateTotalItems(localCart.length);
        this.dataService.refreshLocalCartPreview();
      }   
    });    
  }

  loadRecentProducts(): void {
    this.productService.getRecentProducts().subscribe(
      (data) => {
        this.recentProducts = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des produits récents:', error);
      }
    );
  }

  loadRecentlyViewedProducts(): void {
    if (this.dataService.isLoggedIn()) { 
      this.dataService.getUserInfo().subscribe(
        (data: any) => {
          this.userInfo = data;
          this.userId = this.userInfo.id;
  
          this.productService.getRecentlyViewedProducts(this.userId).subscribe(
            (data: any) => {
              this.recentlyViewedProducts = data;  
            },
            (error) => {
              console.error('Erreur lors de la récupération des produits', error);
            }
          );
        },
      );   
    } else {      
      this.localRecentlyViewedProducts = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    }      
  }

  loadProductsByCategory(): void {
    this.productService.getLimitedProductsByCategory().subscribe(
      (data: any) => {
        // Créer un objet pour regrouper les produits par catégorie
        const groupedProducts: any[] = [];
        
        // Utilisation de `reduce` pour regrouper les produits par `category_name`
        data.forEach((item: any) => {
          const categoryIndex = groupedProducts.findIndex(
            (category: any) => category.category_name === item.category_name
          );
  
          if (categoryIndex === -1) {
            // Si la catégorie n'existe pas encore, on l'ajoute
            groupedProducts.push({
              category_name: item.category_name,
              products: [item]
            });
          } else {
            // Si la catégorie existe déjà, on ajoute le produit à cette catégorie
            groupedProducts[categoryIndex].products.push(item);
          }
        });
  
        // Assignation du tableau regroupé à la variable `limitedProducts`
        this.limitedProducts = groupedProducts;
      },
      (error) => {
        console.error('Erreur lors de la récupération des produits par catégorie:', error);
      }
    );
  }

   // Fonction pour générer un tableau de placeholders en fonction des produits existants
   placeholderArray(category: any): any[] {
    const remaining = 3 - category.products.length; // Calcule combien de tuiles sont nécessaires
    return new Array(remaining).fill(null); // Remplis avec des éléments factices
  }
  
  recordProduct(productId: number): void {   
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;

        this.productService.recordViewedProduct(productId, this.userId).subscribe(() => {});
      },
    );
  } 

  handleWishlistClick(productId: any): void {  
    if (!this.dataService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/wishlist', productId]);
    }   
  }   
  
   // Ajouter un produit au panier 
   handleAddToCart(productId: number): void {  
    this.router.navigate(['/cart-confirmation', productId]);
   }
}
