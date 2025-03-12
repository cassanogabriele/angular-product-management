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

  // Aperçu du panier dans la navbar 

  // Panier db 

  // Nombre d'articles uniques dans le panier
  private totalItemsSubject = new BehaviorSubject<number>(0);
  public totalItems$ = this.totalItemsSubject.asObservable();
  public totallocalItems$ = this.totalItemsSubject.asObservable();

  public cartPreview$ = new BehaviorSubject<any[]>([]);

  // Total du panier
  private totalCartPreviewSubject = new BehaviorSubject<number>(0);  // Total du panier
  public totalCartPreview$ = this.totalCartPreviewSubject.asObservable();

  private userIdSubject = new BehaviorSubject<number | null>(null);
  public userId$ = this.userIdSubject.asObservable();

  public total: number = 0;

  // Panier local 
  public localcartPreview$ = new BehaviorSubject<any[]>([]);

  constructor(private httpClient: HttpClient) { }

  // Mettre à jour l'ID utilisateur dans le BehaviorSubject
  setUserId(userId: number): void {
    this.userIdSubject.next(userId);
  }

  // Mettre à jour le nombre d'articles dans la navbar quand on se connecte
  updateTotalItems(count: number) {
    this.totalItemsSubject.next(count);
  }   

  // Rafraîchir l'aperçu du panier
  refreshCartPreview(userId: any): void {
    this.getCartPreview(userId).subscribe(
      (response: any) => {
        if (response.cartItems) {
          this.cartPreview$.next(response.cartItems);  

          // Mise à jour du total du panier
          this.totalCartPreviewSubject.next(response.total);  
        }
      }
    );
  }  

  // Rafraîchir l'aperçu du panier local
  refreshLocalCartPreview(): void {
      // Récupérer les articles du panier local depuis sessionStorage
      const localCart = JSON.parse(sessionStorage.getItem('cart') || '[]');

      // Vérifier que le panier local n'est pas vide
      if (localCart.length > 0) {
          // Limiter à 3 articles maximum
          const limitedCart = localCart.slice(0, 3);

          // Créer une structure pour le panier
          const cartItems = limitedCart.map((cartItem: any) => ({
              vendeur: cartItem.product.libelle, // Par exemple, on prend le libellé du produit comme vendeur
              items: [{
                  productId: cartItem.productId,
                  libelle: cartItem.product.libelle,
                  quantite: cartItem.quantite,
                  prix: cartItem.product.prix,
                  poids: cartItem.product.poids,
                  defaultImage: cartItem.product.defaultImage
              }]
          }));
          
          // Mettre à jour le comportement des observables
          this.localcartPreview$.next(cartItems);

          // Calculer le total du panier local avec **TOUS** les articles, pas juste les 3 premiers
          const total = localCart.reduce((sum: number, item: any) =>
              sum + (item.product.prix * item.quantite), 0
          );

          // Mettre à jour le total
          this.totalCartPreviewSubject.next(parseFloat(total.toFixed(2)));
      } else {
          // Si le panier est vide, réinitialiser les valeurs
          this.localcartPreview$.next([]);
          this.totalCartPreviewSubject.next(0);
      }
  }
  
  // Les utilisateurs 

  // Créer un compte
  insertUser(data: FormData): Observable<any> {
    // return this.httpClient.post('http://127.0.0.1:8000/api/register', data, {responseType: 'text'});
    return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/register', data);
  }

  // Vérifier si l'utilisateur est connecté 
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('authToken');
  }

  // S'authentifier
  login(data: FormData): Observable<any> {    
    // return this.httpClient.post('http://127.0.0.1:8000/api/login', data);  
    return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/login', data);  
   
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

    // return this.httpClient.get('http://127.0.0.1:8000/api/me', { headers });   
    return this.httpClient.get('http://productmanagement.gabriel-cassano.be/api/me', { headers });
  }

  updateUserProfile(data: FormData): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // return this.httpClient.post('http://127.0.0.1:8000/api/update-profile', data, { headers });
    return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/update-profile', data, { headers });
  }

  // Les produits 
  getData(userId: string) {
    // return this.httpClient.get(`http://127.0.0.1:8000/api/products/${userId}`);
    return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/products/${userId}`);
  }

  insertData(formData: FormData): Observable<any> {
    // return this.httpClient.post('http://127.0.0.1:8000/api/addProduct', formData);
    return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/addProduct', formData);
  }  
  
  deleteData(id:any){
    // return this.httpClient.delete('http://127.0.0.1:8000/api/deleteProduct/'+id);
    return this.httpClient.delete('http://productmanagement.gabriel-cassano.be/api/deleteProduct/'+id);
  }

  // Page des articles 

  // Récupérer les catégories des produits
  getCategories() {
    // return this.httpClient.get('http://127.0.0.1:8000/api/categories'); 
    return this.httpClient.get('http://productmanagement.gabriel-cassano.be/api/categories'); 
  }    

  // Récupérer les produits par catégorie
  getProductsByCategory(categoryId: number): Observable<any> {
    // return this.httpClient.get(`http://127.0.0.1:8000/api/articles/category/${categoryId}`);
    return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/articles/category/${categoryId}`);
  }

  // Récupérer le nom de la catégorie
  getCategoryById(categoryId: number): Observable<any> {
    // return this.httpClient.get(`http://127.0.0.1:8000/api/categories/${categoryId}`);
    return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/articles/category/${categoryId}`);
  }
  
  // Récupérer les infos du produit à mettre à jour
  getProductById(id:any){
    // return this.httpClient.get('http://127.0.0.1:8000/api/product/'+id);
    return this.httpClient.get('http://productmanagement.gabriel-cassano.be/api/product/'+id);
  }

  deleteImageProduct(idImage:any){
    // return this.httpClient.delete('http://127.0.0.1:8000/api/deleteImageProduct/'+idImage);
    return this.httpClient.delete('http://productmanagement.gabriel-cassano.be/api/deleteImageProduct/'+idImage);
  }

  updateProduct(id:any, formData: FormData){
    // return this.httpClient.post('http://127.0.0.1:8000/api/updateProduct/'+id, formData);
    return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/updateProduct/'+id, formData);
  }
 
  // Liste de souhaits 
  getWishlist(userId: string): Observable<any> {
    // return this.httpClient.get(`http://127.0.0.1:8000/api/wishlist/${userId}`);
    return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/wishlist/${userId}`);
  }

  // Créer une nouvelle wishlist et ajouter le produit
  createWishlist(userId: string, wishlistName: string, productId: any): Observable<any> {     
    /*
    return this.httpClient.post('http://127.0.0.1:8000/api/createWishlist', {
      userId: userId,
      name: wishlistName,
      productId: productId  
    });
    */

    return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/createWishlist', {
      userId: userId,
      name: wishlistName,
      productId: productId  
    });  
  }

  // Ajouter un produit à une wishlist existante
  addProductToWishlist(userId: any, wishlistId: any, productId: any): Observable<any> {    
    /*
    return this.httpClient.post(`http://127.0.0.1:8000/api/addProductToWhishlist`, {
      userId: userId,
      wishlistId: wishlistId,
      productId: productId
    });
    */
   
    return this.httpClient.post(`http://productmanagement.gabriel-cassano.be/api/addProductToWishlist`, {
      userId: userId,
      wishlistId: wishlistId,
      productId: productId
    }); 
  }  

  removeProductFromWishlist(wishlistId: any, productId: any): Observable<any> {
    // return this.httpClient.delete(`http://127.0.0.1:8000/api/removeProductFromWishlist/${wishlistId}/${productId}`);
    return this.httpClient.delete(`http://productmanagement.gabriel-cassano.be/${wishlistId}/${productId}`);
  }  

  // Panier 
  
  // Ajouter un produit au panier
  addToCart(productId: number, quantite: number, userId: any): Observable<any> { 
    /*
    return this.httpClient.post(`http://127.0.0.1:8000/api/addProductToCart`, { 
      userId: userId,
      product_id: productId, 
      quantite 
    });
    */
   
    return this.httpClient.post(`http://productmanagement.gabriel-cassano.be/api/addProductToCart`, { 
      product_id: productId, 
      quantite 
    });
  }
  
  // Récuper les informations du panier
  getCart(userId: any): Observable<any> {        
    /*
    return this.httpClient.get(`http://127.0.0.1:8000/api/cart`, {
      params: { userId: userId }
    });
    */
   
    return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/cart`, {
      params: { userId: userId }
    });
  }

  // Aperçu de panier (navbar)
  getCartPreview(userId: number): Observable<any> {   
    /*
    return this.httpClient.get(`http://127.0.0.1:8000/api/cart-preview`, {
      params: { userId: userId }
    });
    */
 
    return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/cart-preview`, {
      params: { userId: userId }
    });    
  }

  // Supprimer un produit du panier
  removeFromCart(productId: number, userId: number): Observable<any> {
    // return this.httpClient.delete(`http://127.0.0.1:8000/api/cart/${userId}/${productId}`);
    return this.httpClient.delete(`http://productmanagement.gabriel-cassano.be/api/cart/${userId}/${productId}`);
  }  

  // Mettre à jour le panier quand on modifie la quantité
  updateCartItem(productId: number, quantite: number, userId: number): Observable<any> {    
    /*
    return this.httpClient.put(`http://127.0.0.1:8000/api/updateCartItem`, { 
      product_id: productId, 
      quantite: quantite,
      user_id: userId 
    });
    */
   
    return this.httpClient.post(`http://productmanagement.gabriel-cassano.be/api/updateCartItem`, { 
      product_id: productId, 
      quantite: quantite,
      user_id: userId 
    });
  }  
}
