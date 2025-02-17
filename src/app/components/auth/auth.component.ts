import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('authToken');
  }

  user = {
    email: '',
    password: ''
  };

  @ViewChild('loginForm') loginForm!: NgForm;
  alertMessage: string | null = null; // Message d'alerte générique
  successMessage: string | null = null;

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer le message depuis sessionStorage 
    this.successMessage = sessionStorage.getItem('alertMessage');
    
    // Supprimer le message après l'avoir récupéré (facultatif)
    sessionStorage.removeItem('userSuccessMessage');
    sessionStorage.removeItem('alertMessage');

    // Si l'utilisateur est déjà connecté, rediriger vers la page du profil
    if (this.isLoggedIn()) {      
      this.router.navigate(['/home']);
    }
  }

  login(): void {
    // Marquer tous les champs comme touchés avant de soumettre
    if (this.loginForm) {
      this.loginForm.form.markAllAsTouched();
    }

    // Vérifier que tous les champs obligatoires sont remplis
    if (this.user.email && this.user.password) {
      const formData = new FormData();
      formData.append('email', this.user.email);
      formData.append('password', this.user.password);

      // Appeler la méthode de connexion avec les données
      this.dataService.login(formData).subscribe(
        (res: any) => {
          if (res.token) {
            // Stockage du token dans sessionStorage
            sessionStorage.setItem('authToken', res.token);
            sessionStorage.setItem('user', JSON.stringify(res.user)); 

            // Appeler la méthode qui gère la mise à jour de l'état de connexion
            this.dataService.handleLoginSuccess(res.token);

            // Message de succès
            sessionStorage.setItem('userLoginSuccessMessage', 'Vous êtes connectés !');

            // Rediriger vers le profil
            this.router.navigate(['/home']);
          }
        },
        (err) => {
          // Gérer les erreurs spécifiques
          if (err.status === 401) {
            // Si erreur 401, cela veut dire que les identifiants sont incorrects
            this.alertMessage = 'Email ou mot de passe incorrect. Veuillez réessayer.';
          } else {
            // Erreur générique
            this.alertMessage = 'Une erreur s\'est produite. Veuillez réessayer.';
          }
          console.error('Erreur lors de la connexion', err);
        }
      );
    } else {
      this.alertMessage = 'Veuillez remplir tous les champs du formulaire.';
    }
  }

  logout(): void {
    // Retirer le token et l'utilisateur du sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
  }

  // Méthode pour fermer le message de succès
  closeMessage(): void {
    this.successMessage = '';
  }
}
