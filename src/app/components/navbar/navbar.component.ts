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

    // S'abonner au compteur d'articles 
    this.dataService.totalItems$.subscribe((count: number) => {
      this.totalItems = count;
    });

    // Mettre à jour l'aperçu du panier 
    this.dataService.userId$.subscribe(userId => {
      if (userId) {
        this.userId = userId;
        this.dataService.refreshCartPreview(userId); 
      } else{
        let localCart = JSON.parse(sessionStorage.getItem('cart') || '[]');
        
        this.dataService.updateTotalItems(localCart.length); 
        
        // Si l'utilisateur est déconnecté, afficher le panier local
        this.dataService.refreshLocalCartPreview(); 
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
      this.total = parseFloat(total.toFixed(2));
    });
   
    // Récupérer les catégories
    this.dataService.getCategories().subscribe((data: any) => {
      this.categories = data; 
    });

    this.dataService.localcartPreview$.subscribe((cartItems: any) => {    
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
  
    // Vider le panier connecté pour récupérer le panier local 
    this.cartItems.length = 0;

     // S'abonner au compteur d'articles le mettre dans l'affichage
    this.dataService.totallocalItems$.subscribe((count: number) => {
      this.totalItems = count;
    });
  
    this.router.navigate(['/login']);      
  }
  
  // Récupérer les articles du panier
  getCartItems(): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;
  
        // Récupérer les articles du panier pour l'utilisateur
        this.dataService.getCart(this.userId).subscribe(response => {
          if (response.cartItems && typeof response.cartItems === 'object') {        
            this.totalItems = response.uniqueProductCount || 0;  
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
}
