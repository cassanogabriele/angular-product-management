import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';

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
    private router: Router
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

            // Mettre à jour le nombre d'article dans la navigation 
            this.getCartItems();

            // Synchroniser le panier local avec la base de données après la connexion
            this.syncLocalCartWithDb();

            // Rediriger vers le profil
            this.router.navigate(['/home']);
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

  // Enreigistrement du panier local 
  syncLocalCartWithDb(): void {
    let localCart = JSON.parse(sessionStorage.getItem('cart') || '[]');

    if (localCart.length === 0) {
        return; // Pas besoin de synchronisation si le panier est vide
    }

    const userId = JSON.parse(sessionStorage.getItem('user') || '{}').id;

    if (!userId) {
        console.error("Erreur: Aucun utilisateur connecté.");
        return;
    }

    this.dataService.getCart(userId).subscribe(
        (response: any) => {
            // Assurez-vous que cartItems est un tableau
            const cartItemsArray = Array.isArray(response.cartItems)
                ? response.cartItems
                : Object.values(response.cartItems || {});

            console.log('Cart Items:', cartItemsArray);

            localCart.forEach((cartItem: any) => {
                const existingItem = cartItemsArray.find((item: any) => item.productId === cartItem.productId);

                if (existingItem) {
                    console.log(`Mise à jour de l'article ${cartItem.productId}`);
                    this.dataService.updateCartItem(cartItem.productId, cartItem.quantite, userId).subscribe();
                } else {
                    console.log(`Ajout de l'article ${cartItem.productId}`);
                    this.dataService.addToCart(cartItem.productId, cartItem.quantite, userId).subscribe();
                }
            });

            // Une fois la synchronisation terminée, vider le panier local
            sessionStorage.removeItem('cart');
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
