import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('authToken');
  }

  user = {
    email: '',
    password: ''
  };

  @ViewChild('loginForm') loginForm!: NgForm;
  alertMessage: string | null = null; // Message d'alerte générique
  successMessage: string | null = null;
  userInfo: any;
  userId: any;
  totalItems: number = 0; 
  cartItems: any[] = [];
  total: number = 0;

  constructor(
    private dataService: DataService,
    private router: Router,
    private productService: ProductService 
  ) {}

  ngOnInit(): void {
    // Récupérer le message depuis sessionStorage 
    this.successMessage = sessionStorage.getItem('alertMessage');
    
    // Supprimer le message après l'avoir récupéré (facultatif)
    sessionStorage.removeItem('userSuccessMessage');
    sessionStorage.removeItem('alertMessage');

    // Si l'utilisateur est déjà connecté, rediriger vers la page du profil
    if (this.isLoggedIn()) {      
      this.router.navigate(['/home']);
    }
  }

  login(): void {
    // Marquer tous les champs comme touchés avant de soumettre
    if (this.loginForm) {
      this.loginForm.form.markAllAsTouched();
    }

    // Vérifier que tous les champs obligatoires sont remplis
    if (this.user.email && this.user.password) {
      const formData = new FormData();
      formData.append('email', this.user.email);
      formData.append('password', this.user.password);

      // Appeler la méthode de connexion avec les données
      this.dataService.login(formData).subscribe(
        (res: any) => {
          if (res.token) {
            // Stockage du token dans sessionStorage
            sessionStorage.setItem('authToken', res.token);
            sessionStorage.setItem('user', JSON.stringify(res.user)); 

            // Appeler la méthode qui gère la mise à jour de l'état de connexion
            this.dataService.handleLoginSuccess(res.token);

            // Message de succès
            sessionStorage.setItem('userLoginSuccessMessage', 'Vous êtes connectés !');

            this.dataService.getUserInfo().subscribe(
              (data: any) => {
                this.userInfo = data;
                this.userId = this.userInfo.id;

                // Récupérer les produits vus stockés dans localStorage
                const viewedProducts = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        
                if (viewedProducts.length > 0) {
                  viewedProducts.forEach((product: any) => {
                    this.productService.recordViewedProduct(product.id, this.userId).subscribe();
                  });
                }

                // Enregistrer le panier local dans la db 
                this.syncLocalCartWithDb();                
              },
              (err) => {
                console.error('Erreur lors de la récupération des infos utilisateur:', err);
              }
            );                   
          }
        },
        (err) => {
          // Gérer les erreurs spécifiques
          if (err.status === 401) {
            // Si erreur 401, cela veut dire que les identifiants sont incorrects
            this.alertMessage = 'Email ou mot de passe incorrect. Veuillez réessayer.';
          } else {
            // Erreur générique
            this.alertMessage = 'Une erreur s\'est produite. Veuillez réessayer.';
          }
          console.error('Erreur lors de la connexion', err);
        }
      );
    } else {
      this.alertMessage = 'Veuillez remplir tous les champs du formulaire.';
    }
  }

   // Récupérer les articles du panier
   getCartItems(): void {   
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;
  
        // Récupérer les articles du panier pour cet utilisateur
        this.dataService.getCart(this.userId).subscribe(response => {
          // On récupère tous les articles directement sans les grouper par vendeur
          this.totalItems = response.uniqueProductCount || 0;        
          this.dataService.updateTotalItems(this.totalItems);
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
  
      // Calcul du total avec la bonne structure
      this.total = this.cartItems.reduce((sum: number, item: any) => 
        sum + ((item.product?.prix || 0) * (item.quantite || 1)), 0
      );
    } 
  }  

  // Enregistrement du panier local 
  syncLocalCartWithDb(): void {
    let localCart = JSON.parse(sessionStorage.getItem('cart') || '[]');

    if (localCart.length === 0) {
        console.log('Panier local vide, rien à synchroniser.');
        return; // Pas besoin de synchronisation si le panier est vide
    }

    const userId = JSON.parse(sessionStorage.getItem('user') || '{}').id;

    if (!userId) {
        console.error("Erreur: Aucun utilisateur connecté.");
        return;
    }

    // Récupérer le panier actuel de l'utilisateur avant de mettre à jour
    console.log("Récupération du panier actuel pour l'utilisateur avec ID:", userId);
    this.dataService.getCart(userId).subscribe(
        (response: any) => {
            console.log("Réponse initiale du panier:", response);

            // Assurez-vous que cartItems est un tableau
            const cartItemsArray = Array.isArray(response.cartItems)
                ? response.cartItems
                : Object.values(response.cartItems || {});
            
            console.log("Cart Items Array après récupération de l'API:", cartItemsArray);

            // Synchronisation du panier local avec les éléments du panier dans la base de données
            localCart.forEach((cartItem: any) => {
                const existingItem = cartItemsArray.find((item: any) => item.productId === cartItem.productId);

                if (existingItem) {
                    console.log(`Mise à jour de l'élément: ${cartItem.productId} avec la quantité: ${cartItem.quantite}`);
                    this.dataService.updateCartItem(cartItem.productId, cartItem.quantite, userId).subscribe(
                        () => console.log(`Panier mis à jour pour le produit ${cartItem.productId}`),
                        (err) => console.error('Erreur lors de la mise à jour de l\'élément:', err)
                    );
                } else {
                    console.log(`Ajout du produit ${cartItem.productId} avec quantité: ${cartItem.quantite}`);
                    this.dataService.addToCart(cartItem.productId, cartItem.quantite, userId).subscribe(
                        () => console.log(`Produit ${cartItem.productId} ajouté au panier`),
                        (err) => console.error('Erreur lors de l\'ajout de l\'élément:', err)
                    );
                }
            });

            // Une fois la synchronisation terminée, on récupère à nouveau le panier pour s'assurer qu'il est mis à jour
            console.log("Récupération du panier après synchronisation...");
            this.dataService.getCart(userId).subscribe(
                (updatedCartResponse: any) => {
                    console.log("Panier mis à jour après synchronisation:", updatedCartResponse);

                    if (updatedCartResponse.cartItems) {
                        // Mettre à jour les éléments du panier de l'utilisateur avec la version mise à jour
                        this.cartItems = Object.keys(updatedCartResponse.cartItems).map(vendorId => ({
                            vendeur: updatedCartResponse.cartItems[vendorId].vendeur,
                            items: updatedCartResponse.cartItems[vendorId].items
                        }));

                        this.totalItems = updatedCartResponse.uniqueProductCount || 0;

                        // Mettre à jour le compteur du nombre d'articles dans la navbar
                        this.dataService.updateTotalItems(this.totalItems);
                        // Mettre à jour l'aperçu du panier dans la navbar
                        this.dataService.refreshCartPreview(userId);
                    }
                },
                (err) => {
                    console.error('Erreur lors de la récupération du panier mis à jour:', err);
                }
            );

            // Une fois la synchronisation terminée, vider le panier local
            sessionStorage.removeItem('cart');

            // Rafraîchir la page après la synchronisation du panier
            setTimeout(() => {
                location.reload(); // Rafraîchit la page pour mettre à jour les données affichées
            }, 1000); // Délai de 1 seconde avant le rafraîchissement (ajuste le délai selon tes besoins)
        },
        (err) => console.error('Erreur lors de la récupération du panier de l\'utilisateur:', err)
    );
  }

  logout(): void {
    // Retirer le token et l'utilisateur du sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
  }

  // Méthode pour fermer le message de succès
  closeMessage(): void {
    this.successMessage = '';
  }
}
