import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service'; // Ton service pour récupérer les catégories

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  categories: any[] = [];
  alertMessage: string = '';

  constructor(
    private dataService: DataService,   
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner à l'état de connexion
    this.dataService.loggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });

    // Récupérer les catégories
    this.dataService.getCategories().subscribe((data: any) => {
      this.categories = data; 
    });
  }

  // Lorsque l'utilisateur change de catégorie
  onCategoryChange(categoryId: number): void {
    // Changer l'URL en fonction de la catégorie sélectionnée (pas de rechargement de page)
    this.router.navigate(['/all-products', categoryId]);   
  }

  logout(): void {
    this.dataService.logout();  
    sessionStorage.setItem('alertMessage', 'Vous êtes déconnecté.');
    this.router.navigate(['/login']);
  }
}
