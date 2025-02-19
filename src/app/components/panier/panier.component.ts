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

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getCartItems();
  }

  // Récupérer les informations du panier 
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

          console.log(this.cartItems);
  
          this.total = response.total;
        });
      },
      (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur:', err);
      }
    );
  }    

  // Supprimer un article du panier en utilisant l'ID du produit et l'ID de l'utilisateur
  removeFromCart(productId: number): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;
  
        // Appel à la méthode de suppression du panier avec l'ID de l'utilisateur et du produit
        this.dataService.removeFromCart(productId, this.userId).subscribe(
          (response) => {
            // Mettre à jour l'affichage du panier après suppression
            this.getCartItems(); // Cette méthode va récupérer les articles du panier après la suppression
          },
          (err) => {
            console.error('Erreur lors de la suppression de l\'article du panier', err);
          }
        );
      },
      (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur:', err);
      }
    );
  }
  
  // Méthode pour mettre à jour la quantité d'un produit dans le panier
  updateCart(item: any): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;
  
        this.dataService.updateCartItem(item.product_id, item.quantite, this.userId).subscribe(response => {
          // Récupérer les infos mise à jour du panier
          this.getCartItems();  
        });
      }
    );  
  }
}
