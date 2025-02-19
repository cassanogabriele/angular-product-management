export class Product {
    libelle!: string;
    reference!: string;
    description!: string;
    quantite!: number;
    prix!: number;
    poids!: number; 
    id_utilisateur!: number;
    category_id!: number;
    defaultImage!: File | string;
  }
  