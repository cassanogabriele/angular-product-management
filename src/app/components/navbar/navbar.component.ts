import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  categories: any[] = [];
  alertMessage: string = '';
  userInfo: any;
  userId: any;
  cartItems: any[] = [];
  total: number = 0;
  totalItems: number = 0; 
  cartPreview: any[] = []; 

  constructor(
    private dataService: DataService,   
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner à l'état de connexion
    this.dataService.loggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });
   
    // Récupérer les catégories
    this.dataService.getCategories().subscribe((data: any) => {
      this.categories = data; 
    });

    // Si on est connecté, on récupère le panier en db, sinon, on récupère le panier local
    if (this.isLoggedIn) {
      this.getCartItems();

      // S'abonner au compteur d'articles le mettre dans l'affichage
      this.dataService.totalItems$.subscribe((count: number) => {
        this.totalItems = count;
      });

      // Mettre à jour l'aperçu du panier 
      this.dataService.userId$.subscribe(userId => {
        if (userId) {
          this.userId = userId;
          this.dataService.refreshCartPreview(userId); 
        }
      });    
  
      // S'abonner pour mettre à jour l'affichage de l'aperçu du panier 
      this.dataService.cartPreview$.subscribe((cartItems: any) => {    
        try {
          // Convertir l'objet cartItems en tableau
          this.cartItems = Object.entries(cartItems).map(([vendorId, vendorData]: [string, any]) => ({
            vendeur: vendorData.vendeur,
            items: vendorData.items
          }));
        } catch (error) {
          console.error("Erreur lors de la mise à jour du panier :", error);
        }
      });

      // S'abonner pour mettre à jour le total du panier 
      this.dataService.totalCartPreview$.subscribe((total: number) => {
        this.total = total;
      });
    } else {
      this.getLocalCartItems();

      this.dataService.localcartPreview$.subscribe(cartItems => {
        this.cartItems = cartItems;
      });
    }
    
    this.getCartItemsPreview();
  }

  // Lorsque l'utilisateur change de catégorie
  onCategoryChange(categoryId: number): void {
    // Changer l'URL en fonction de la catégorie sélectionnée (pas de rechargement de page)
    this.router.navigate(['/all-products', categoryId]);   
  }

  logout(): void {
    this.dataService.logout();  
    sessionStorage.setItem('alertMessage', 'Vous êtes déconnecté.');
  
    // Réinitialiser le nombre d'articles avant de charger le panier local
    this.totalItems = 0;
  
    // Récupérer les articles du panier local après déconnexion
    this.getLocalCartItems();
  
    this.router.navigate(['/login']);  
  }
  
  // Récupérer les articles du panier
  getCartItems(): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;
  
        // Récupérer les articles du panier pour cet utilisateur
        this.dataService.getCart(this.userId).subscribe(response => {
          if (response.cartItems && typeof response.cartItems === 'object') {        
            this.totalItems = response.uniqueProductCount || 0;  
          } else {
            console.error("Erreur: cartItems n'est pas un objet valide:", response.cartItems);
          }
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
      this.totalItems = this.cartItems.length;
      console.log(this.totalItems);
    }
  }  
  
  getCartItemsPreview(): void {
    if (this.isLoggedIn) { 
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
    } else {
      // Aperçu du panier local
      const localCart = sessionStorage.getItem('cart');

      if (localCart) {
        this.cartItems = JSON.parse(localCart);
        
        this.total = 0;
        let itemCount = 0; 

        // Parcourir les articles du panier
        for (let i = 0; i < this.cartItems.length && itemCount < 3; i++) { // Limiter à 3 articles
          const item = this.cartItems[i];

          // Vérifier que item.product existe avant de l'utiliser
          if (item.product) {
            // Pousser les données correctement dans cartItems avec la structure attendue
            this.cartItems.push({
              vendeur: item.product.libelle, 
              items: [{
                productId: item.productId,
                libelle: item.product.libelle,
                quantite: item.quantite,
                prix: item.product.prix,
                poids: item.product.poids,
                defaultImage: item.product.defaultImage
              }]
            });

            // Calcul du total
            this.total += item.product.prix * item.quantite;  
            this.total.toFixed(2);          
          
            // Incrémenter le compteur d'articles
            itemCount++;
          } else {
            console.warn(`Produit manquant pour l'item avec productId: ${item.productId}`);
          }
        }
      } else {
        console.log('Aucun article dans le panier local');
      } 
    } 
  }    
}
