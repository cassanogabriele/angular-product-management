import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router  } from '@angular/router';  
import { Product } from 'src/app/product';
import { DataService } from 'src/app/services/data.service';  
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit{
  id:any;
  data:any;
  product = new Product;
  alertMessage: string = ''; 

  // Récupérer une référence au formulaire Angular
  @ViewChild('productForm') productForm!: NgForm
 
  constructor(
    private route: ActivatedRoute,
    // Injection de Router
    private router: Router, 
    private dataService:DataService
  ) {}  

  ngOnInit(): void {
    // Accéder à l'ID dans les paramètres de la route
    this.id = this.route.snapshot.paramMap.get('id');
    this.getData();
  }

  getData(){
    this.dataService.getProductById(this.id).subscribe(
      res =>{
        this.data = res;
        this.product = this.data;
      }
    );
  }

  updateProduct(){
    // Marquer tous les champs comme touchés avant de soumettre
    if (this.productForm) {
      this.productForm.form.markAllAsTouched();
    }

    if (this.product.reference && this.product.description && this.product.quantite && this.product.prix) {  
          this.dataService.updateProduct(this.id, this.product).subscribe(
            res =>{
              this.data = res;
              this.product = this.data;

              // Redirection avec un message
              this.router.navigate(['/'], {
                state: { message: 'Le produit a été ajouté avec succès!' }
              });
            }
          );
    } else{
      this.alertMessage = 'Veuillez remplir tous les champs du formulaire.';
    } 
  }
}
