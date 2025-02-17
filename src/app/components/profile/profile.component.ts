import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userInfo: any;

  user = {
    name: '',
    firstname: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    photo: null as File | null,  // Spécifier que la photo peut être un objet File ou null
    sexe: ''
  };
  
  editData: any = {};
  errorMessage: string = '';
  userLoginSuccessMessage: string | null = null;
 
  editMode: boolean = false;
  selectedFile: File | null = null;
  selectedImageUrl: string | null = null;  // Ajouter une variable pour l'aperçu de l'image

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    sessionStorage.removeItem('userLoginSuccessMessage');

    if (!this.dataService.isLoggedIn()) {
      this.router.navigate(['/home']);
    } else {
      this.userLoginSuccessMessage = sessionStorage.getItem('userLoginSuccessMessage');
     
      this.dataService.getUserInfo().subscribe(
        (data: any) => {
          this.userInfo = data;
          this.editData = { ...data };
        },
        (error) => {
          this.errorMessage = "Une erreur est survenue lors de la récupération des informations de l'utilisateur.";         
        }
      );
    }
  }

  closeMessage(): void {
    this.userLoginSuccessMessage = null;    
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editData = { ...this.userInfo }; // Réinitialiser aux données originales
  }

  // Gérer l'upload de la photo et afficher l'aperçu
  onFileChange(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.user.photo = file; // Assigner le fichier sélectionné
      this.selectedImageUrl = URL.createObjectURL(file); // Créer une URL temporaire pour l'aperçu
    }
  }

  updateProfile(): void {
    const formData = new FormData();
    formData.append('name', this.editData.name);
    formData.append('firstname', this.editData.firstname);
    formData.append('phone', this.editData.phone);
    formData.append('email', this.editData.email);
    formData.append('password', this.editData.password);
    formData.append('sexe', this.editData.sexe);

    // Ajouter la photo au FormData si elle existe
    if (this.user.photo) {
      formData.append('photo', this.user.photo, this.user.photo.name);
    }

    this.dataService.updateUserProfile(formData).subscribe(
      (response: any) => {
        this.userInfo = response;
        this.editMode = false;
        this.userLoginSuccessMessage = "Profil mis à jour avec succès!";    
        // Recharger les informations de l'utilisateur à jour
        this.dataService.getUserInfo().subscribe(
          (data: any) => {
            this.userInfo = data;
            this.editData = { ...data };
          },
          (error) => {
            this.errorMessage = "Une erreur est survenue lors de la récupération des informations de l'utilisateur.";         
          }
        );
      },
      (error) => {
        this.errorMessage = "Une erreur est survenue lors de la mise à jour du profil.";
        console.error(error);
      }
    );
  }
}
