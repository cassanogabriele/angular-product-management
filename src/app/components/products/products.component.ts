import { Component, OnInit, ViewChild } from '@angular/core';
import { Product } from 'src/app/product';
import { DataService } from 'src/app/services/data.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products', 
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})

// implements OnInit : La classe implémente l’interface OnInit, on peut utiliser la méthode ngOnInit(), qui est appelée lorsque le composant est initialisé.
export class ProductsComponent implements OnInit {
  // Contient les données des produits récupérées via le service DataService, effectuant 
  // la requête SQL à partir de l'API Laravel.
  products: any;

  // Récupérer une référence au formulaire Angular
  @ViewChild('productForm') productForm!: NgForm

  alertMessage: string = ''; 
  alertVisible: boolean = false; 
  errorMessage: string = '';
  userInfo: any;

  // Constructeur de classe, appelé lorsque le composant est instancié

  /*
  Utilisation de l'injection de dépendance d'Angular pour injecter le service DataService pour 
  récupérer des données. Le mot-clé "private" fait en sorte que la variable dataService soit accessible 
  dans la classe du composnat. 
  */
  constructor(
    private dataService: DataService, 
    private router: Router) 
  {}  

  /*
  Méthode de cycle de vie dans Angular, qui est appelée juste après que le composant a été initialisé, après que 
  le constructeur a été exécuté. 
  */
  ngOnInit(): void {
    sessionStorage.removeItem('userLoginSuccessMessage');

    // Vérifiez si l'utilisateur est connecté
    if (!this.dataService.isLoggedIn()) {
      // Si non connecté, rediriger vers la page d'accueil
      this.router.navigate(['/home']);
    } else{
      this.getProductData();
    
      // Vérifiez si un message de succès est stocké dans sessionStorage et le récupérer
      const successMessage = sessionStorage.getItem('productSuccessMessage');
  
      if (successMessage) {
        this.showAlert(successMessage);
        // Supprimer le message de succès après l'affichage
        sessionStorage.removeItem('productSuccessMessage');
      }
    }   
  }
  
  getProductData() {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
  
        // Passer l'ID de l'utilisateur à la méthode getData()
        this.dataService.getData(this.userInfo.id).subscribe(res => {
          this.products = res;

          console.log(this.products);

        }, error => {
          console.error('Erreur lors de la récupération des produits', error);
        });
      },
      (error) => {
        this.errorMessage = 'Une erreur est survenue lors de la récupération des informations de l\'utilisateur.';
        console.error(error);
      }
    );
  }  
 
  showAlert(message: string): void {
    this.alertMessage = message;
    this.alertVisible = true;

    // Cache l'alerte après 3 secondes
    setTimeout(() => {
      this.alertVisible = false;
    }, 3000);
  }

  closeAlert(): void {
    this.alertVisible = false;
  }

  deleteData(id:any){
    // Appel de la méthode "deleteData()", qui supprime un produit dans la base de données
    this.dataService.deleteData(id).subscribe(res => { 
      this.getProductData();
      this.showAlert('Produit supprimé avec succès !');
    })
  }

  // Récupérer les infos du produit à mettre à jour
  getProduct(id:any){
    this.dataService.deleteData(id).subscribe(res => { 
      this.getProductData();
      this.showAlert('Produit mise à jour avec succès !');
    })
  }
}
