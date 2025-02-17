/* Fichier essentiel dans une application Angular, qui définit le composant principal de l'application. */


/*
Importation du décorateur component fournit par Angular, importé depuis le module '@angular/core'. Il permet 
de transformer la classe "AppComponent" en un composant Angular. 
*/
import { Component } from '@angular/core';

/*
Le décorateur "Component" est utilisé pour associer la logique TypeScript, dans la classe "AppComponent", à un template HTML et un fichier de style. Il permet
également de spécifier le sélecteur de ce composant pour qu'il soit intégré dans l'application. 
*/
@Component({
  // Spécifie le nom de la balise HTML que le composant va représenter dans l'application.
  selector: 'app-root',
  // Propriété qui indique à Angular où se trouve le template HTML qui sera rendu pour ce composant.
  templateUrl: './app.component.html',
  // Propriété spécifiant les fichiers CSS à utiliser pour ce composants. 
  styleUrls: ['./app.component.css']
})

// Coeur du composant, c'est là où on définit la logique et les propriétés associées au composant.
export class AppComponent {
  title = 'my preferred products';
}
