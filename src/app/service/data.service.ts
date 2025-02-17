import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../product';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private httpClient: HttpClient) { }

  getData(){
    return this.httpClient.get('http://productmanagement.gabriel-cassano.be/api/products');
    // return this.httpClient.get('http://127.0.0.1:8000/api/products');
  }

  insertData(data:Product){
    return this.httpClient.post('http://productmanagement.gabriel-cassano.be/api/addProduct', data);
  }

  deleteData(id:any){
    return this.httpClient.delete('http://productmanagement.gabriel-cassano.be/api/deleteProduct/'+id);
  }

  // Récupérer les infos du produit à mettre à jour
  getProductById(id:any){
    return this.httpClient.get('http://productmanagement.gabriel-cassano.be/api/product/'+id);
  }

  updateProduct(id:any, data:Product){
    return this.httpClient.put('http://productmanagement.gabriel-cassano.be/api/updateProduct/'+id, data);
  }
}
