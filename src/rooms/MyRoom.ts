import { Room, Client, ClientArray } from "@colyseus/core";
import { Carte, MyRoomState, Player,Equipe } from "./schema/MyRoomState";
import * as script from "./schema/script";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  liste_player: Player[] = [];

  paquet: Carte[] =[];
  roomState : MyRoomState;

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.state.players
    this.onMessage("type", (client, message) => {
      console.log("welcome to the game")
    }); 
      this.onMessage("Start partie", () =>{ 
        let paquet: Carte[];
        this.paquet = script.initialiser_table(this.state); // CreerPaquetCartes et 4 cartes sur la table
        let equipe;
        equipe = script.Creer_Equipe(this.state,this.liste_player ); //creation des equipes
        }
      )
      this.onMessage("DistribuerCarte", () => {
        const joueursAvecRonda: [Player, number][] = [];
        this.state.joueursAvecRonda = joueursAvecRonda;
        const joueursAvecTringa: [Player, number][] = [];
        this.state.joueursAvecTringa = joueursAvecTringa;
        this.paquet = script.Distribuer_carte(this.state , 3 , this.paquet); //distribution des cartes aux joueurs
        this.broadcast("Declarer Ronda ou Tringa", { message: "Vous pouvez annoncer ronda ou tringa en utilisant l'événement annonceRonda ou annonceTringa." });
      });
 
      this.onMessage("annonceRonda", (client) => {
        const joueur = this.state.players.get(client.sessionId);
        const { rondaTrouvee, ronda } = script.checkRonda(joueur);
          if (rondaTrouvee) {
            this.state.joueursAvecRonda.push([joueur, ronda]);
          }
        client.send("annonceRondaConfirmee");
      });

      this.onMessage("annonceTringa", (client) => {
        const joueur = this.state.players.get(client.sessionId);
        const { tringaTrouvee, tringa } = script.checkTringa(joueur);
          if (tringaTrouvee) {
            this.state.joueursAvecTringa.push([joueur, tringa]);
          }
        client.send("annonceTringaConfirmee");
      });

      this.onMessage("ronda tringa", () => {
        this.state.players.forEach((joueur) => {
          joueur.score_joueur = 0;
        });
      
        if (this.state.joueursAvecTringa.length > 0) {
          let joueursGagnants : Player[];
          let meilleureTringa = -1;
      
          for (const [joueur, tringa] of this.state.joueursAvecTringa) {
            if (tringa > meilleureTringa) {
              joueursGagnants = [joueur];
              meilleureTringa = tringa;
            } else if (tringa === meilleureTringa) {
              joueursGagnants.push(joueur);
            }
          }
          if (joueursGagnants.length === 1) {
            const joueurGagnant = joueursGagnants[0];
            joueurGagnant.score_joueur += 5 + this.state.joueursAvecRonda.length;
            console.log(joueurGagnant.username, "a la Tringa la plus élevée et gagne", 5 + this.state.joueursAvecRonda.length, "points.");
            return;
          } else {
            console.log("Il y a égalité de Tringa, personne ne gagne la Tringa.");
          }
        } else {
          if (this.state.joueursAvecRonda.length > 0) {
            let joueursGagnants : Player[];
            let meilleureRonda = -1;
      
            for (const [joueur, ronda] of this.state.joueursAvecRonda) {
              if (ronda > meilleureRonda) {
                joueursGagnants = [joueur];
                meilleureRonda = ronda;
              } else if (ronda === meilleureRonda) {
                joueursGagnants.push(joueur);
              }
            }
            if (joueursGagnants.length === 1) {
              const joueurGagnant = joueursGagnants[0];
              joueurGagnant.score_joueur += this.state.joueursAvecRonda.length;
              console.log(joueurGagnant.username, "a la Ronda la plus élevée et gagne", this.state.joueursAvecRonda.length, "point(s).");
            } else {
              console.log("Il y a égalité de Ronda, personne ne gagne la Ronda.");
            }
          } else {
            console.log("Personne n'a Tringa ni Ronda, aucun point n'est attribué.");
          }
        }
      });

      this.onMessage("jouer" , (client : Client , message : Carte)=>{
        let current_player : Player ;
        let carte = new Carte();
        carte.num_carte = message.num_carte;
        carte.type_carte = message.type_carte;
        current_player = this.state.players.get(client.sessionId);
        if(this.state.turn_currentplayer == this.state.turn.get(client.sessionId)){
          if(this.state.cartesSurTable.length!=0) {    
            if(carte.num_carte == this.state.getLastCard().num_carte)  // darba
            {
              current_player.score_joueur += 1;
              let indice_carte = this.state.cartesSurTable.length - 1;
              script.jouerCarte(this.state, current_player, carte, indice_carte);
            }
            else{
              let indice_carte = script.trouverPaireSurTable(this.state, carte);
              if (indice_carte === -1){
                this.state.cartesSurTable.push(carte);
                for( let carte_a_trouver = 0 ; carte_a_trouver < current_player.main.length ; carte_a_trouver++ ) {
                  if(script.areCartesEqual(current_player.main[carte_a_trouver],carte)){ 
                    current_player.main.splice(carte_a_trouver,1);
                  }
                }
              }                          
              else if(indice_carte != -1){
                for (let i = 0; i < current_player.main.length; i++) {
                  if (script.areCartesEqual(current_player.main[i], carte)) {
                    current_player.main.splice(i, 1);
                    break; 
                  }
                } 
                for (let i = 0; i < this.state.cartesSurTable.length; i++) {
                  if (script.areCartesEqual(this.state.cartesSurTable[i], carte)) {
                    current_player.carte_gagne.push(this.state.cartesSurTable[i]);
                    this.state.cartesSurTable.splice(i, 1);
                    break;
                  }
                } 
              }
            }  
            if(script.annoncerMissa(this.state, current_player, carte)){
              this.broadcast("Missa", { carte: "Missa!!" });
            }  
          }
          else{
            script.jouerunecarte(this.state, current_player, carte)
          }
          this.state.turn_currentplayer = script.valeurSuivante(this.state.turn_currentplayer);
        }
      });
    }
    
    onJoin (client: Client, options: any) {
      console.log(client.sessionId, "joined!");
      this.liste_player = script.attribuer(this.liste_player, client.sessionId, options.username , options.main, options.carte_gagne, options.score_joueur); 
      if (this.liste_player.length === 1){
        this.state.turn.set(client.sessionId,this.liste_player.length.toString())
        }
      if (this.liste_player.length === 2){
        this.state.turn.set(client.sessionId,this.liste_player.length.toString())
      }
      if (this.liste_player.length === 3){
        this.state.turn.set(client.sessionId,this.liste_player.length.toString())
      }
      if (this.liste_player.length === 4){
        this.state.turn.set(client.sessionId,this.liste_player.length.toString())
      }

      this.liste_player.forEach(player => {
        this.state.players.set(player.sessionId, player);
      });
  
    }
  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    script.supprimerPlayer(client.sessionId, this.liste_player);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  NextRound(){
    let turnssid = this.state.getKeyByValue("1");
    let current_player = this.state.players.get(turnssid);

    if(this.state.turn_currentplayer == "1" && current_player.main.length == 0){
      script.Distribuer_carte(this.state,3,this.paquet);
    }
  }
}
