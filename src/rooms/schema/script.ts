import { MapSchema, ArraySchema } from "@colyseus/schema";
import { MyRoomState, Player, Carte, Equipe} from "./MyRoomState";

export function attribuer(liste_Player: Player[], sessionId: string, username: string , main : ArraySchema, carte_gagne :ArraySchema<Carte> , score_joueur : number) {
   const new_player = new Player(username, sessionId, main, carte_gagne, score_joueur);
   
   new_player.score_joueur = 0 ; 
   new_player.carte_gagne = new ArraySchema<Carte>;
   liste_Player.push(new_player);
   return liste_Player;
}
 
export function supprimerPlayer(sessionId: string, liste_Player: Player[]): void {
   const index = liste_Player.findIndex((Player) => Player.sessionId === sessionId);
   
   if (index !== -1) {
     liste_Player.splice(index, 1);
   }
}

 export function initialiserPartie(roomState: MyRoomState): Carte[] {
  const paquet = CreerPaquetCartes();
  return paquet;
}
 export function shuffleArray(array: any[]): any[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; 
  }
  return array;
}
export function Creer_Equipe(roomState: MyRoomState , joueur : Player[]): Equipe[] {
  
  if (roomState.players.size !== 4) {
    throw new Error("Exactly 4 players are required to create teams.");
    }
    shuffleArray(joueur);

    const equipe1 = new Equipe();
    equipe1.nom_equipe = "Team 1";
    equipe1.score_equipe = 0;
    equipe1.player = [];
    equipe1.player.push(joueur[0])
    //equipe1.player.push(joueur[0]);
    equipe1.player.push(joueur[1]);

    const equipe2 = new Equipe();
    equipe2.nom_equipe = "Team 2";
    equipe2.score_equipe = 0;
    equipe2.player = [];
    equipe1.player.push(joueur[2]);
    equipe1.player.push(joueur[3]);

    return [equipe1, equipe2];
    
}

 export function Distribuer_carte(roomState: MyRoomState , cartesADistribuer : number , paquet : Carte[]): Carte[]{
  
    roomState.players.forEach(joueur => {
      joueur.main = new ArraySchema<Carte>();
      for(let nbr_carte = 0 ; nbr_carte < cartesADistribuer; nbr_carte++ ){
        const card = paquet.pop();
        joueur.main.push(card);
      }
    })
  return paquet;
}

export function CreerPaquetCartes(): Carte[] {
  const paquet: Carte[] = [];
  
  const listeDeNombreDeCartes : number[] = [1,2,3,4,5,6,7,10,11,12]
  const listeDetypeDeCartes : string[] = ["épées", "ors", "coupes", "bâtons"]

  for (const nombre of listeDeNombreDeCartes) {
     for (const type of listeDetypeDeCartes) {
      const carte = new Carte();
      carte.num_carte = nombre;
      carte.type_carte = type;
      paquet.push(carte);
    }
  }
  return paquet;
}

export function initialiser_table(roomState: MyRoomState): Carte[]{
  let paquet: Carte[];
  paquet = CreerPaquetCartes();
  let new_paquet: Carte[];
  new_paquet = shuffleArray(paquet);
  roomState.cartesSurTable.push(new_paquet.pop());
  while (roomState.cartesSurTable.length < 4 ){
    let card = new_paquet.pop();
    if (!carteAppartient(roomState.cartesSurTable,card)){
      roomState.cartesSurTable.push(card);
    }else{
      new_paquet.unshift(card);
    }
  }
  return new_paquet 
}

  export function carteAppartient(cartesSurTable: ArraySchema<Carte>, carteRecherchee: Carte): boolean {
    
    for (const carte of cartesSurTable) {
      if (carte.num_carte === carteRecherchee.num_carte) {
        return true; 
      }
    }
  return false; 

}

export function melangerCartes(paquet: Carte[]): void {
   for (let i = paquet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paquet[i], paquet[j]] = [paquet[j], paquet[i]];
    }
}

export function areCartesEqual(carte1: Carte, carte2: Carte): boolean {
  return carte1.num_carte === carte2.num_carte && carte1.type_carte === carte2.type_carte;
}
export function areCartesEqualnum(carte1: Carte, carte2: Carte): boolean {
  return carte1.num_carte === carte2.num_carte ;
}
 
export function jouerunecarte(roomState : MyRoomState , joueur : Player , carte : Carte){
    roomState.cartesSurTable.push(carte);
    
    let carte_a_trouver : number;
    for(  carte_a_trouver = 0 ; carte_a_trouver < joueur.main.length ; carte_a_trouver++ ) {
      if(joueur.main[carte_a_trouver] === carte){
        joueur.main.splice(carte_a_trouver);
      }
    }  
  }

export function jouerCarte(roomState : MyRoomState, joueur: Player, carte : Carte, indice_carte : number ): MyRoomState {
    if (indice_carte != -1) {

      let liste_indice : number[];
      liste_indice = trouverSuite(roomState, indice_carte);
      joueur.carte_gagne.push(roomState.cartesSurTable[indice_carte]);
      roomState.cartesSurTable.splice(indice_carte,1);
  return roomState;
}
}

export function trouverIndiceCarteDansMain(main: ArraySchema<Carte>, carteRecherchee: Carte): number {
  for (let i = 0; i < main.length; i++) {
    if (
      main[i].num_carte === carteRecherchee.num_carte) {
      return i; // Renvoie l'indice de la carte si elle est trouvée
    }
  }
  return -1; // Renvoie -1 si la carte n'est pas trouvée dans la main
}

export function valeurSuivante(valeur: string): string {
  switch (valeur) {
    case "1":
      return "2";

    case "2":
      return "3";

    case "3":
      return "4";

    case "4":
      return "1";
  }
}

export function checkRonda(joueur: Player): { rondaTrouvee: boolean, ronda: number | null } {
  let rondaTrouvee = false;
  let ronda = null;

  for (let carte = 0; carte < joueur.main.length; carte++) {
    for (let carte_a_comparer = 0; carte_a_comparer < joueur.main.length; carte_a_comparer++) {
      if (carte !== carte_a_comparer && joueur.main[carte].num_carte === joueur.main[carte_a_comparer].num_carte) {
        rondaTrouvee = true;
        ronda = joueur.main[carte].num_carte;
      }
    }
  }

  return { rondaTrouvee, ronda };
}

export function checkTringa(joueur: Player): { tringaTrouvee: boolean, tringa: number | null } {
  let tringaTrouvee = false;
  let tringa = null;

  if (joueur.main.length < 3) {
    tringaTrouvee = false;
  } else {
    const numCarte = joueur.main[0].num_carte; // Prend le numéro de la première carte.

    // Vérifie si toutes les cartes ont le même numéro que la première.
    tringaTrouvee = joueur.main.every((carte) => carte.num_carte === numCarte);

    if (tringaTrouvee) {
      tringa = numCarte;
    }
  }

  return { tringaTrouvee, tringa };
}

export function trouverSuite(roomState: MyRoomState, indice : number): number[] {
  const listeDindice: number[] = [];
  let num_ref = roomState.cartesSurTable[indice].num_carte;
  num_ref+=1;
  let temp = true;
  while(temp ){ 
    temp = false;
    for (let i =0 ;i< roomState.cartesSurTable.length; i++) {
      if (i === 8){
        i=10;
      }
      if (roomState.cartesSurTable[i].num_carte == num_ref){
        listeDindice.push(i)
        temp = true;
      } 
    }
    num_ref+=1;
  }
  return listeDindice;
}


export function annoncerMissa(roomState : MyRoomState , joueur : Player , carte : Carte): boolean {
  let missa : boolean;
  if (roomState.cartesSurTable.length ===0){
    joueur.score_joueur += 1;
    missa = true
  }
  return missa; 
}

export function trouverPaireSurTable(roomState: MyRoomState, carte: Carte): number {
  let result = -1;
  const cartesSurTable = roomState.cartesSurTable;
  for (let j = 0; j < cartesSurTable.length; j++) {
    const carteTable = cartesSurTable[j];
    if (carte.num_carte === carteTable.num_carte) {
      result = j; 
      break; 
    }
  }
  return result;
}

 