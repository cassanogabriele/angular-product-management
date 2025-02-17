import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';  
import { Observable } from 'rxjs';

@Component({
  selector: 'app-seller-profile',
  templateUrl: './seller-profile.component.html',
  styleUrls: ['./seller-profile.component.css']
})
export class SellerProfileComponent implements OnInit {
  sellerDetails: any;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService  
  ) { }

  ngOnInit(): void {
    // Récupère l'ID passé dans l'URL
    const sellerId = this.route.snapshot.paramMap.get('id'); 

    if(sellerId )
    {
      this.userService.getSellerDetails(+sellerId).subscribe(
        (res) => {
          this.sellerDetails = res;
        },
        (err) => {
          console.error('Erreur lors de la récupération des détails:', err);
        }
      );
    }
  }
}
