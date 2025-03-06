import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlist: any;
  userInfo: any;
  productId: number | null = null;
  showWishlistSelect: boolean = false;
  newWishlistName: string = '';
  selectedWishlistId: number | null = null;
  alertMessage: string = ''; 
  alertVisible: boolean = false;  
  wishlistNames: { id: number, name: string }[] = [];
  showCreateForm: boolean = false;

  @ViewChild('wishlistForm') wishlistForm!: NgForm;

  constructor(
    private dataService: DataService,
    private productService: ProductService,
    private route: ActivatedRoute, 
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('productId') ? Number(params.get('productId')) : null;
    });

    this.loadWishlist();
  }

  // Charger les listes de souhaits de l'utilisateur
  loadWishlist(): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;

        this.dataService.getWishlist(this.userInfo.id).subscribe((data: any) => {
          if (data.wishlists && Array.isArray(data.wishlists)) {
            this.wishlistNames = data.wishlists.map((wl: any) => ({
              id: wl.id,
              name: wl.name
            }));
            this.showWishlistSelect = this.wishlistNames.length > 0;
          } else {
            this.wishlistNames = [];
            this.showWishlistSelect = false;
          }
        });
      },
      (error) => {
        console.error('Erreur lors du chargement des données utilisateur', error);
      }
    );
  }

  // Créer une liste de souhaits
  createWishlist(): void {
    if (this.wishlistForm) {
      this.wishlistForm.form.markAllAsTouched();
    }

    this.route.paramMap.subscribe(params => {
      this.productId = params.get('productId') ? Number(params.get('productId')) : null;

      this.dataService.createWishlist(this.userInfo.id, this.newWishlistName, this.productId).subscribe(
        () => {
          // Stocker le message de succès dans sessionStorage
          sessionStorage.setItem('wishlistSuccessMessage', `La liste "${this.newWishlistName}" a été créée avec succès et le produit a été ajouté !`);
          // Rediriger vers la page de détails de la liste de souhaits ou actualiser la page
          this.router.navigate(['/wishlist-details']); 
        },
        (error) => {
          console.error('Erreur lors de la création de la wishlist', error);
        }
      );
    });    
  }

  // Ajouter un produit à la liste de souhait choisie
  addProductToWishlist(): void {
    if (!this.selectedWishlistId || !this.productId) { 
      return;
    }

    this.dataService.addProductToWishlist(this.userInfo.id, this.selectedWishlistId, this.productId).subscribe(
      () => {
        // Stocker le message de succès dans sessionStorage
        sessionStorage.setItem('wishlistSuccessMessage', 'Produit ajouté à la wishlist !');
        // Rediriger vers la page de détails de la wishlist ou actualiser la page
        this.router.navigate(['/wishlist-details']); 
      },
      (error) => {
        console.error('Erreur lors de l\'ajout du produit', error);
      }
    );
  }

  // Fermer l'alerte
  closeAlert(): void {
    this.alertVisible = false;
  }

  // Basculer l'affichage du formulaire de création
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }
}
