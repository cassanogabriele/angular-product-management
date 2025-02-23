import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service'; // Ton service pour récupérer les catégories

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

    this.dataService.totalItems$.subscribe((count: number) => {
      this.totalItems = count;
    });

    // Récupérer les catégories
    this.dataService.getCategories().subscribe((data: any) => {
      this.categories = data; 
    });

    if (this.isLoggedIn) {
      this.getCartItems();
    } else {
      this.getLocalCartItems();
    }
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
      this.totalItems = this.cartItems.reduce((sum: number, item: any) => 
        sum + item.quantite, 0
      );
    }
  }  
}
