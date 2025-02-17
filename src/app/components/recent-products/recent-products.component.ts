import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-recent-products',
  templateUrl: './recent-products.component.html',
  styleUrls: ['./recent-products.component.css']
})
export class RecentProductsComponent implements OnInit {
  recentProducts: any[] = [];
  userInfo: any;
  userId:any;

  constructor(
    private productService: ProductService,
    private dataService: DataService, 
  ) {}

  ngOnInit(): void {
    this.dataService.getUserInfo().subscribe(
      (data: any) => {
        this.userInfo = data;
        this.userId = this.userInfo.id;
      },
    );
    
    if (this.userId) {
      this.loadRecentProducts();
    } else {
      console.error('Utilisateur non connecté');
    }
  }

  // Voir les produits récemment vus
  loadRecentProducts(): void {
    this.productService.getRecentlyViewedProducts(this.userId).subscribe(
      (data: any) => {
        this.recentProducts = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des produits', error);
      }
    );
  }  
}
