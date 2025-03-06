import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})

export class PanierComponent {
  cartItems: any[] = [];
  total: number = 0;
  userInfo: any;
  userId: any;
  isLoggedIn: boolean = false;
  totalItems: number = 0; 

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté
    this.dataService.loggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    
      if (this.isLoggedIn) {
        this.getCartItems();   
        this.getCartItemsPreview();

        // Panier connecté 
        this.dataService.getUserInfo().subscribe(
          (data: any) => {
            this.userInfo = data;
            this.userId = this.userInfo.id;
      
            // Récupérer les articles du panier l'utitilisateur
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
        this.getLocalCartItems();        
      }     
    });  
  }

  getCartItemsPreview(): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;
  
        // Récupérer les articles du panier pour cet utilisateur
        this.dataService.getCartPreview(this.userId).subscribe(response => {
          // S'assurer que cartItems existe bien dans la réponse
          if (response.cartItems) {
            // Convertir l'objet cartItems en un tableau
            this.cartItems = Object.keys(response.cartItems).map(vendorId => ({
              vendeur: response.cartItems[vendorId].vendeur,
              items: response.cartItems[vendorId].items
            }));
            
            this.total = response.total.toFixed(2);
            this.totalItems = response.uniqueProductCount || 0;  
          } else {
            console.error("cartItems est vide ou mal formaté", response);
          }
        });
      },
      (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur:', err);
      }
    );
  }    

  // Récupérer les informations du panier 
  getCartItems(): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;
  
        // Récupérer les articles du panier pour l' utilisateur
        this.dataService.getCart(this.userId).subscribe(response => {      
          // Convertir l'objet cartItems en un tableau
          this.cartItems = Object.keys(response.cartItems).map(vendorId => ({
            vendeur: response.cartItems[vendorId].vendeur,
            items: response.cartItems[vendorId].items
          }));
  
          this.total = response.total.toFixed(2);
        });
      },
      (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur:', err);
      }
    );
  }    

  // Supprimer un article du panier 
  removeFromCart(productId: number): void {
    if (this.isLoggedIn) {
      this.dataService.getUserInfo().subscribe(
        (data: any) => {
          this.userInfo = data;
          this.userId = this.userInfo.id;
  
          this.dataService.removeFromCart(productId, this.userId).subscribe(
            (response) => {
              // Mise à jour du panier après suppression
              this.dataService.getCart(this.userId).subscribe((cartResponse: any) => {
                // Vérifier la structure de la réponse
                if (cartResponse.cartItems) {
                  this.cartItems = Object.keys(cartResponse.cartItems).map(vendorId => ({
                    vendeur: cartResponse.cartItems[vendorId].vendeur,
                    items: cartResponse.cartItems[vendorId].items
                  }));
  
                  // Mettre à jour le nombre total d'articles dans le panier
                  this.totalItems = cartResponse.uniqueProductCount || 0; 

                  this.dataService.updateTotalItems(this.totalItems);

                  // Mettre à jour l'aperçu de panier dans la navbar 
                  this.dataService.refreshCartPreview(this.userId); 
                } 
              });
            },
          );
        }
      );
    } else {
      // Si l'utilisateur n'est pas connecté, on supprime l'article du panier local
      this.removeLocalCartItem(productId);
    }
  }
    
  // Metrre à jour la quantité d'un produit dans le panier
  updateCart(item: any): void {
    if (this.isLoggedIn) {
      this.dataService.getUserInfo().subscribe(
        (data: any) => {
          this.userInfo = data;
          this.userId = this.userInfo.id;
    
          this.dataService.updateCartItem(item.product_id, item.quantite, this.userId).subscribe(() => {
            this.getCartItems();  

            // Mettre à jour l'aperçu de panier dans la navbar 
            this.dataService.refreshCartPreview(this.userId); 
          });
        }
      );  
    } else {
      // Si l'utilisateur n'est pas connecté, on met à jour le panier local 
      this.updateLocalCart(item);
    }
  }

  // Mettre à jour la quantité d'un produit dans le panier local
  updateLocalCart(item: any): void {
    let localCart = JSON.parse(sessionStorage.getItem('cart') || '[]');

    const existingItem = localCart.find((cartItem: any) => cartItem.productId === item.productId);
    if (existingItem) {
      existingItem.quantite = item.quantite;
    }

    sessionStorage.setItem('cart', JSON.stringify(localCart));
    this.getLocalCartItems();
  }

  // Supprimer un article du panier local
  removeLocalCartItem(productId: number): void {
    let localCart = JSON.parse(sessionStorage.getItem('cart') || '[]');
  
    // Trouver l'index de l'article à supprimer dans le panier
    const index = localCart.findIndex((cartItem: any) => cartItem.productId === productId);
    
    if (index !== -1) {
      // Retirer l'élément du panier
      localCart.splice(index, 1);
  
      // Mettre à jour le panier dans sessionStorage
      sessionStorage.setItem('cart', JSON.stringify(localCart));
  
      // Calculer le nombre total d'articles restants
      this.totalItems = this.cartItems.length;  
      // Mettre à jour l'affichage local du panier
      this.getLocalCartItems();

      // Récupération des informations du panier local 
      this.dataService.updateTotalItems(localCart.length);
      this.dataService.refreshLocalCartPreview();
    }
  }
  
  // Récupérer les informations du panier local
  getLocalCartItems(): void {
    const localCart = sessionStorage.getItem('cart');
    
    if (localCart) {
      this.cartItems = JSON.parse(localCart);
  
      // Calcul du total avec la bonne structure
      this.total = this.cartItems.reduce((sum: number, item: any) => 
        sum + ((item.product?.prix || 0) * (item.quantite || 1)), 0
      );
    } 
  }  
}
