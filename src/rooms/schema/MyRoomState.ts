import { playground } from "@colyseus/playground";
import { Schema, Context, type,MapSchema ,ArraySchema } from "@colyseus/schema";

export class Carte extends Schema {
  @type("number") num_carte : number;
  @type("string") type_carte : string;
}

export class Player extends Schema{
  @type("string") sessionId : string;
  @type("string") username : string;
  @type([Carte]) main = new ArraySchema<Carte>()

  @type([Carte]) carte_gagne = new ArraySchema<Carte>();
  @type("number") score_joueur : number;
    
  constructor (username : string ,sessionId :string , main : ArraySchema<Carte>, carte_gagne :ArraySchema<Carte> , score_joueur : number ){
    super();
    this.sessionId = sessionId;
    this.username = username;
    this.main = main;
    this.carte_gagne = carte_gagne;
    this.score_joueur = score_joueur;
  }
}

  export class Equipe extends Schema{
    @type("string") nom_equipe : string;
    @type(Player) player : Player[]
    @type("number") score_equipe : number; 
  }

  export class MyRoomState extends Schema {

    @type({map:Player}) players= new MapSchema<Player>();
    @type([Carte]) cartesSurTable = new ArraySchema<Carte>();
    @type(["number"]) joueursAvecRonda: [Player, number][];
    @type(["number"]) joueursAvecTringa: [Player, number][];
    @type([Carte]) paquet = new ArraySchema<Carte>();
    @type({ map: "string" }) turn = new MapSchema<string>();
    @type ("string") turn_currentplayer = "1";
    
    getLastCard(): Carte | null {
      const length = this.cartesSurTable.length;
      if (length > 0) {
        return this.cartesSurTable[length - 1];
      } else {
        return null; 
      }
    }
    getKeyByValue(targetValue: string): string | null {
      for (const key in this.turn) {
        if (this.turn.get(key) === targetValue) {
          return key;
        }
      }
      return null;
    }

  }
