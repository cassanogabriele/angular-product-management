import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  constructor(private httpClient: HttpClient) { }

  // Page d'accueil 
  
  // Enregistrer l'article vu
  recordViewedProduct(productId: number, userId: number): Observable<any> {
    //  return this.httpClient.post(`http://127.0.0.1:8000/api/product/viewed/${productId}/${userId}`, null);
    return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/product/viewed/${productId}/${userId}', null);
  } 

  // Récupérer les produits récemment vus 
  getRecentlyViewedProducts(userId: string) {
    // return this.httpClient.get(`http://127.0.0.1:8000/api/products/recently-viewed/${userId}`);
    return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/products/recently-viewed/${userId}`);
  }
  
  // Récupérer 3 articles par catégorie 
  getLimitedProductsByCategory(): Observable<any> {
    // return this.httpClient.get<any>(`http://127.0.0.1:8000/api/products-by-category`);
    return this.httpClient.get<any>(`http://productmanagement.gabriel-cassano.be/api/products-by-category`);
  }  

  // Récupérer les produits ajoutés récemment
  getRecentProducts(): Observable<any> {
    // return this.httpClient.get('http://127.0.0.1:8000/api/recentProducts');
    return this.httpClient.get('http://productmanagement.gabriel-cassano.be/api/recentProducts');
  }
}
