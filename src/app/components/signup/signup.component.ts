import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router'; 

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  user = {
    name: '',
    firstname: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    photo: null as File | null, 
    sexe: ''
  };

  // Récupérer une référence au formulaire Angular
  @ViewChild('userForm') userForm!: NgForm;

  alertMessage: string = ''; 
  selectedImageUrl: string | null = null; 

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

   // Gérer l'upload de la photo et afficher un aperçu
   onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.user.photo = file;
       // Créer une URL temporaire pour l'aperçu
      this.selectedImageUrl = URL.createObjectURL(file);
    }
  }


  insertUser() {
    // Marquer tous les champs comme touchés avant de soumettre
    if (this.userForm) {
      this.userForm.form.markAllAsTouched();
    }

    // Vérifier que tous les champs obligatoires sont remplis
    if (this.user.name && this.user.firstname && this.user.phone && this.user.email && this.user.sexe && this.user.password && this.user.password_confirmation && this.user.photo) {
      // Créer un objet FormData pour envoyer les données
      const formData = new FormData();
      formData.append('name', this.user.name);
      formData.append('firstname', this.user.firstname);
      formData.append('phone', this.user.phone);
      formData.append('email', this.user.email);
      formData.append('password', this.user.password);
      formData.append('password_confirmation', this.user.password_confirmation);
      formData.append('sexe', this.user.sexe);
      
      // Ajouter la photo au FormData si elle existe
      if (this.user.photo) {
        formData.append('photo', this.user.photo, this.user.photo.name);
      }

      // Appeler la méthode d'insertion avec les données
      this.dataService.insertUser(formData).subscribe(
        res => {
          // Stockage du message de succès dans sessionStorage
          sessionStorage.setItem('userSuccessMessage', 'Votre compte a été créé avec succès !');

          // Redirection vers la page d'accueil ou autre page
          this.router.navigate(['/home']);
        },
        err => {
          // Gérer les erreurs
          this.alertMessage = 'Une erreur s\'est produite. Veuillez réessayer.';
          console.error('Erreur lors de l\'inscription', err);
        }
      );
    } else {
      this.alertMessage = 'Veuillez remplir tous les champs du formulaire.';
    } 
  }
}
