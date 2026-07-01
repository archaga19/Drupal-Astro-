export interface DrupalUser {
  name: string;
  uid: string;
  mail: string;
  roles_target_id: string; 
  uuid: string;
  user_picture: string;    
  field_organizacion: string; // Ejemplo: "Bomberos" o "Cruz Roja"
}