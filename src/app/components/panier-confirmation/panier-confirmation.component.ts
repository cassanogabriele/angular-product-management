import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-panier-confirmation',
  templateUrl: './panier-confirmation.component.html',
  styleUrls: ['./panier-confirmation.component.css']
})
export class PanierConfirmationComponent implements OnInit {
  product: any;
  quantite: number = 1;
  productId: number = 0; 
  userInfo: any;
  userId: number | null = null;
  isLoggedIn: boolean = false;
  totalItems: number = 0; 
  cartItems: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupération de l'ID du produit depuis l'URL
    const productIdParam = this.activatedRoute.snapshot.paramMap.get('productId');

    if (productIdParam) {
      this.productId = Number(productIdParam);
      this.getProductDetails();
    } else {
      console.error("ID du produit invalide.");
    }

    // Vérification de la connexion de l'utilisateur
    this.dataService.loggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      if (this.isLoggedIn) {
        this.dataService.getUserInfo().subscribe((data: any) => {
          this.userInfo = data;
          this.userId = data.id;
          this.getCartItems(); 
        });
      } else {
        this.getLocalCartItems(); 
      }
    });
  }

  // Récupérer les détails du produit
  getProductDetails(): void {
    this.dataService.getProductById(this.productId).subscribe(
      (res) => {
        this.product = res;
      },
      (err) => {
        console.error('Erreur lors de la récupération des détails du produit:', err);
      }
    );
  }

  // Ajouter un produit au panier
  addToCart(): void {
    if (this.isLoggedIn && this.userId) {
      this.dataService.addToCart(this.productId, this.quantite, this.userId).subscribe(
        () => {
          // Mettre à jour le compteur d'article du panier 
          this.dataService.getCart(this.userId).subscribe((cartResponse: any) => {
            // Vérifier la structure de la réponse
            if (cartResponse.cartItems) {
              // Mettre à jour le nombre total d'articles dans le panier
              this.totalItems = cartResponse.uniqueProductCount || 0;
            } 
          });       

          this.router.navigate(['/cart']); 
        },
        (err) => {
          console.error("Erreur lors de l'ajout au panier :", err);
        }
      );
    } else {
      this.addToLocalCart(); 
    }
  }
  
  // Ajouter au panier local
  addToLocalCart(): void {
    let localCart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const existingItem = localCart.find((item: any) => item.productId === this.productId);

    if (existingItem) {
      existingItem.quantite += this.quantite;
    } else {
      localCart.push({
        productId: this.productId,
        quantite: this.quantite,
        product: this.product,
      });
    }

    sessionStorage.setItem('cart', JSON.stringify(localCart));
 
    this.updateCartData(); 
    // Récupérer le nombre d'articles uniques dans le panier
    this.dataService.updateTotalItems(localCart.length);
    this.dataService.refreshLocalCartPreview();
    // Récupérer les détails de l'aperçu du panier local à jour 
    this.dataService.refreshLocalCartPreview();
    this.router.navigate(['/cart']);
  }

  // Récupérer les articles du panier en base de données
  getCartItems(): void {
    if (!this.userId) return;

    this.dataService.getCart(this.userId).subscribe(
      (response) => {
        if (response.cartItems) {
          this.cartItems = Object.keys(response.cartItems).map(vendorId => ({
            vendeur: response.cartItems[vendorId].vendeur,
            items: response.cartItems[vendorId].items
          }));

          this.totalItems = response.uniqueProductCount || 0;
        }
      }
    );
  }

  // Récupérer les informations du panier local
  getLocalCartItems(): void {
    const localCart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    this.cartItems = localCart;

    this.totalItems = this.cartItems.reduce((sum: number, item: any) => sum + item.quantite, 0);
  }

  // Mise à jour du nombre total d'articles dans la navbar
  updateCartData(): void {
    if (this.isLoggedIn) {
      this.getCartItems();
    } else {
      this.getLocalCartItems();
    }
  }
}
