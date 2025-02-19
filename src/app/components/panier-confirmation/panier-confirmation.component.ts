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

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Récupération et conversion correcte de l'ID du produit
    const productIdParam = this.activatedRoute.snapshot.paramMap.get('productId');
    if (productIdParam) {
      this.productId = Number(productIdParam);
      this.getProductDetails();
    } else {
      console.error("ID du produit invalide.");
    }
  }

  // ✅ Fonction pour récupérer les détails du produit
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

  // ✅ Fonction pour ajouter au panier avec la quantité sélectionnée
  addToCart(): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;

        this.dataService.addToCart(this.productId, this.quantite, this.userId).subscribe(
          () => {
            alert('Produit ajouté au panier avec succès !');
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
  }
}
