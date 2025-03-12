import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/product';
import { DataService } from 'src/app/services/data.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {
  id: any;
  data: any;
  
  product: any = { 
    libelle: '',
    reference: '',
    description: '',
    quantite: null,
    prix: null,
    defaultImage: '',
    images: []
  };

  alertMessage: string = '';
  defaultImage: File | null = null;
  otherImages: File[] = [];
  defaultImageUrl: string | null = null;
  otherImagesUrls: string[] = [];

  @ViewChild('productForm') productForm!: NgForm;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getData();
  }

  getData() {
    this.dataService.getProductById(+this.id).subscribe(
      (res) => {
        this.product = res;
      },
      (err) => {
        console.error('Erreur lors de la récupération des détails:', err);
      }
    );
  }

  onFileChange(event: any, type: string) {
    if (type === 'defaultImage') {
      const file = event.target.files[0];
      if (file) {
        this.defaultImage = file;
        this.defaultImageUrl = URL.createObjectURL(file);
      }
    } else if (type === 'otherImages') {
      this.otherImages = Array.from(event.target.files);
      this.otherImagesUrls = this.otherImages.map((img) => URL.createObjectURL(img));
    }
  }
  

  getDefaultImageUrl(): string | null {
    return this.defaultImage ? URL.createObjectURL(this.defaultImage) : null;
  }

  getOtherImagesUrls(): string[] {
    return Array.from(this.otherImages).map(file => URL.createObjectURL(file));
  }
  
  removeImage(imageId: number): void {
    // Supprimer l'image localement
    this.product.images = this.product.images.filter((image: any) => image.id !== imageId);

    // Supprimer l'image côté serveur
    this.dataService.deleteImageProduct(imageId).subscribe(
      (res) => {
        this.getData();
      }
    );
  }

  updateProduct() {
    if (this.productForm) {
      this.productForm.form.markAllAsTouched();
    }
  
    if (this.product.libelle && this.product.reference && this.product.description && this.product.quantite && this.product.prix && this.product.poids && this.defaultImage) {
      const formData = new FormData();
      formData.append('category_id', this.product.category_id.toString());
      formData.append('libelle', this.product.libelle);
      formData.append('reference', this.product.reference);
      formData.append('description', this.product.description);
      formData.append('quantite', this.product.quantite.toString());
      formData.append('prix', this.product.prix.toString());
      formData.append('poids', this.product.poids.toString());
  
      // Vérifiez que l'image par défaut est bien ajoutée
      formData.append('defaultImage', this.defaultImage);
  
      // Ajouter les autres images
      for (let i = 0; i < this.otherImages.length; i++) {
        formData.append('otherImages[]', this.otherImages[i]);
      }
  
      // Vérification du contenu avant d'envoyer la requête
      console.log("FormData:", formData);
  
      this.dataService.updateProduct(this.id, formData).subscribe(res => {
        sessionStorage.setItem('updateProductsuccessMessage', "Le produit a été mis à jour avec succès!");
        this.router.navigate(['/my-products']);
      });
    } else {
      this.alertMessage = 'Veuillez remplir tous les champs du formulaire.';
    }
  }
  
}
