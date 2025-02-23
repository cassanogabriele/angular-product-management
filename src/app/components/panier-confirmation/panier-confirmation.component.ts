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
  userId: any;
  isLoggedIn: boolean = false;
  totalItems: number = 0; 
  cartItems: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupération et conversion correcte de l'ID du produit
    const productIdParam = this.activatedRoute.snapshot.paramMap.get('productId');

    if (productIdParam) {
      this.productId = Number(productIdParam);
      this.getProductDetails();
    } else {
      console.error("ID du produit invalide.");
    }

    // Vérifier si l'utilisateur est connecté pour ajouter au panier local ou au pannier en db
    this.dataService.loggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });
  }

  //  Récupérer les détails du produit
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

  // Ajouter au panier avec la quantité sélectionnée
  addToCart(): void {
    if (this.isLoggedIn) {
      // Si l'utilisateur est connecté, on récupère ses informations
      this.dataService.getUserInfo().subscribe(
        (data: any) => {
          this.userInfo = data;
          this.userId = this.userInfo.id;
  
          // Ajout du produit au panier via l'API
          this.dataService.addToCart(this.productId, this.quantite, this.userId).subscribe(
            () => {
              // Récupérer les articles du panier après l'ajout
              this.dataService.getCart(this.userId).subscribe(response => {
                // Vérifier la structure de la réponse
                if (response.cartItems) {
                  // Convertir l'objet cartItems en un tableau
                  this.cartItems = Object.keys(response.cartItems).map(vendorId => ({
                    vendeur: response.cartItems[vendorId].vendeur,
                    items: response.cartItems[vendorId].items
                  }));
  
                  // On récupère tous les articles directement sans les grouper par vendeur
                  this.totalItems = response.uniqueProductCount || 0;
                  
                  // Mettre à jour le nombre total d'articles dans le panier
                  this.dataService.updateTotalItems(this.totalItems);
                } else {
                  console.error('Structure inattendue de la réponse de getCart:', response);
                }
              }, (err) => {
                console.error("Erreur lors de la récupération du panier :", err);
              });
  
              // Naviguer vers le panier après l'ajout
              this.router.navigate(['/cart']);
            },
            (err) => {
              console.error("Erreur lors de l'ajout au panier :", err);
            }
          );
        },
        (err) => {
          console.error('Erreur lors de la récupération des infos utilisateur:', err);
        }
      );
    } else {
       // Si l'utilisateur n'est pas connecté, gestion du panier local
        let localCart = JSON.parse(sessionStorage.getItem('cart') || '[]');

        // Trouver si l'article existe déjà dans le panier local
        const existingItem = localCart.find((item: any) => item.productId === this.productId);

        if (existingItem) {
          // Si le produit existe déjà, on augmente la quantité
          existingItem.quantite += this.quantite;
          // Ne comptabilise pas une deuxième fois cet article dans le total
        } else {
          // Sinon, on ajoute le produit au panier
          localCart.push({
            productId: this.productId,
            quantite: this.quantite,
            product: this.product,
          });
        }

        // Sauvegarder le panier local mis à jour dans sessionStorage
        sessionStorage.setItem('cart', JSON.stringify(localCart));

        
        // Mettre à jour le nombre total d'articles UNIQUES
        this.dataService.updateTotalItems(localCart.length);

        // Mettre à jour l'affichage du panier local
        this.getLocalCartItems();

        // Naviguer vers le panier après l'ajout
        this.router.navigate(['/cart']);
    }
  }  

   getCartItems(): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;
  
        // Récupérer les articles du panier pour cet utilisateur
        this.dataService.getCart(this.userId).subscribe(response => {
          // Convertir l'objet cartItems en un tableau
          this.cartItems = Object.keys(response.cartItems).map(vendorId => ({
            vendeur: response.cartItems[vendorId].vendeur,
            items: response.cartItems[vendorId].items
          }));
          
          // On récupère tous les articles directement sans les grouper par vendeur
          this.totalItems = response.uniqueProductCount || 0;    
        });
      },
      (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur:', err);
      }
    );
  } 
  
  // Récupérer les informations du panier local
  getLocalCartItems(): void {
    const localCart = sessionStorage.getItem('cart');
    if (localCart) {
      this.cartItems = JSON.parse(localCart);
  
      // Calculer le nombre total d'articles dans le panier local
      this.totalItems = this.cartItems.reduce((sum: number, item: any) => 
        sum + item.quantite, 0
      );
    }
  }  
}
