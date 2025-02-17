import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from '../product';
import { User } from '../user';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private httpClient: HttpClient) { }

  // Les utilisateurs 

  // Créer un compte
  insertUser(data: FormData): Observable<any> {
    return this.httpClient.post('http://127.0.0.1:8000/api/register', data, {responseType: 'text'});
    // return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/register', data);
  }

  // Vérifier si l'utilisateur est connecté 
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('authToken');
  }

  // S'authentifier
  login(data: FormData): Observable<any> {    
    return this.httpClient.post('http://127.0.0.1:8000/api/login', data);  
    // return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/login', data);  
   
    // Met à jour l'état de la connexion à true
    this.loggedInSubject.next(true);
  }  
 
  // Mettre à jour l'état de la connexion après une connexion réussie
  handleLoginSuccess(token: string): void {
    sessionStorage.setItem('authToken', token);
    this.loggedInSubject.next(true);
  }

  // Déconnexion de l'utilisateur
  logout(): void {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    this.loggedInSubject.next(false);  
  }  

  // Récupérer les infos utilisateur (route /me)
  getUserInfo(): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.httpClient.get('http://127.0.0.1:8000/api/me', { headers });   
    // return this.httpClient.get('http://productmanagement.gabriel-cassano.be/api/me', { headers });
  }

  updateUserProfile(data: FormData): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.httpClient.post('http://127.0.0.1:8000/api/update-profile', data, { headers });
    // return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/update-profile', data, { headers });
  }

  // Les produits 
  getData(userId: string) {
    return this.httpClient.get(`http://127.0.0.1:8000/api/products/${userId}`);
    // return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/products/${userId}`);
  }

  insertData(formData: FormData): Observable<any> {
    return this.httpClient.post('http://127.0.0.1:8000/api/addProduct', formData);
    // return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/addProduct', formData);
  }  
  
  deleteData(id:any){
    return this.httpClient.delete('http://127.0.0.1:8000/api/deleteProduct/'+id);
    // return this.httpClient.delete('http://productmanagement.gabriel-cassano.be/api/deleteProduct/'+id);
  }

  // Page des articles 

  // Récupérer les catégories des produits
  getCategories() {
    return this.httpClient.get('http://localhost:8000/api/categories'); 
    // return this.httpClient.get('http://productmanagement.gabriel-cassano.be/api/categories'); 
  }    

  // Récupérer les produits par catégorie
  getProductsByCategory(categoryId: number): Observable<any> {
    return this.httpClient.get(`http://127.0.0.1:8000/api/articles/category/${categoryId}`);
    // return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/articles/category/${categoryId}`);
  }

  // Récupérer le nom de la catégorie
  getCategoryById(categoryId: number): Observable<any> {
    return this.httpClient.get(`http://127.0.0.1:8000/api/categories/${categoryId}`);
    // return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/articles/category/${categoryId}`);
  }
  
  // Récupérer les infos du produit à mettre à jour
  getProductById(id:any){
    return this.httpClient.get('http://127.0.0.1:8000/api/product/'+id);
    // return this.httpClient.get('http://productmanagement.gabriel-cassano.be/api/product/'+id);
  }

  updateProduct(id:any, data:Product){
    return this.httpClient.put('http://127.0.0.1:8000/api/updateProduct/'+id, data);
    // return this.httpClient.put('http://productmanagement.gabriel-cassano.be/api/updateProduct/'+id, data);
  }

  // Liste de souhaits 
  getWishlist(userId: string): Observable<any> {
    return this.httpClient.get(`http://127.0.0.1:8000/api/wishlist/${userId}`);
   // return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/wishlist/${userId}`);
  }

  // Créer une nouvelle wishlist et ajouter le produit
  createWishlist(userId: string, wishlistName: string, productId: any): Observable<any> {   
    return this.httpClient.post('http://127.0.0.1:8000/api/createWishlist', {
      userId: userId,
      name: wishlistName,
      productId: productId  
    });
  }

  // Ajouter un produit à une wishlist existante
  addProductToWishlist(userId: any, wishlistId: any, productId: any): Observable<any> {   
    return this.httpClient.post(`http://127.0.0.1:8000/api/addProductToWhishlist`, {
      userId: userId,
      wishlistId: wishlistId,
      productId: productId
    });

    /*
    return this.httpClient.post(`http://productmanagement.gabriel-cassano.be/api/addProductToWishlist`, {
      userId: userId,
      wishlistId: wishlistId,
      productId: productId
    });
    */
  }
  

  removeProductFromWishlist(wishlistId: any, productId: any): Observable<any> {
    return this.httpClient.delete(`http://127.0.0.1:8000/api/removeProductFromWishlist/${wishlistId}/${productId}`);
    // return this.httpClient.delete(`http://productmanagement.gabriel-cassano.be/${wishlistId}/${productId}`);
  }  
}
