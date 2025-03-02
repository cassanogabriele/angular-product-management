import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpClient: HttpClient) { }

  // Récupérer les informations du vendeur
  getSellerDetails(sellerId: number): Observable<any> {   
    return this.httpClient.get(`http://127.0.0.1:8000/api/seller/${sellerId}`);
    // return this.httpClient.get(`http://productmanagement.gabriel-cassano.be/api/seller/${sellerId}`);
  }
}
