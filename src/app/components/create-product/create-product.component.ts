import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { NgForm } from '@angular/forms';
import { Product } from 'src/app/product';
import { ActivatedRoute, Router } from '@angular/router';  

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent {
  @ViewChild('productForm') productForm!: NgForm;

  alertMessage: string = ''; 
  alertVisible: boolean = false; 
  products: any;
  product = new Product;

  defaultImage: File | null = null;
  otherImages: File[] = [];
  defaultImageUrl: string | null = null;
  otherImagesUrls: string[] = [];

  userId: number | null = null; 
  errorMessage: string = '';
  editData: any = {};
  categories: any;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dataService.getCategories().subscribe(
      (data: any) => {
        this.categories = data;
      },
      (error) => {
        console.error("Erreur lors de la récupération des catégories", error);
      }
    );

    // Récupérer les informations de l'utilisateur
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userId = data.id; 
        this.userId = Number(data.id);  
        this.editData = { ...data };
      },
      (error) => {
        this.errorMessage = "Une erreur est survenue lors de la récupération des informations de l'utilisateur.";
        console.error(this.errorMessage, error);
      }
    );
  }

  onFileChange(event: any, type: string) {
    if (type === 'defaultImage') {
      this.defaultImage = event.target.files[0];
      // Créer l'URL de l'image par défaut
      if (this.defaultImage) {
        this.defaultImageUrl = URL.createObjectURL(this.defaultImage);
      }
      // Force Angular à effectuer la détection des changements
      this.cdRef.detectChanges();
    } else if (type === 'otherImages') {
      this.otherImages = Array.from(event.target.files);
      // Créer les URLs des autres images
      this.otherImagesUrls = this.otherImages.map((img) => URL.createObjectURL(img));
      // Force Angular à effectuer la détection des changements
      this.cdRef.detectChanges();
    }
  }

  getDefaultImageUrl(): string | null {
    return this.defaultImage ? URL.createObjectURL(this.defaultImage) : null;
  }

  getOtherImagesUrls(): string[] {
    return Array.from(this.otherImages).map(file => URL.createObjectURL(file));
  }

  insertData() {
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
      formData.append('id_utilisateur', this.userId?.toString() || ''); 
      formData.append('defaultImage', this.defaultImage);

      // Ajouter les autres images
      for (let i = 0; i < this.otherImages.length; i++) {
        formData.append('otherImages[]', this.otherImages[i]);
      }

      this.dataService.insertData(formData).subscribe(res => {
        sessionStorage.setItem('productSuccessMessage', 'Le produit a été créé avec succès!');
        this.router.navigate(['/my-products']);
      });
    } else {
      this.alertMessage = 'Veuillez remplir tous les champs du formulaire.';
    }
  }
}