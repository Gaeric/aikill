import { BenevolencePackage } from 'src/core/characters/benevolence';
import { BiographiesPackage } from 'src/core/characters/biographies';
import { Character } from 'src/core/characters/character';
import { DecadePackage } from 'src/core/characters/decade';
import { FireCharacterPackage } from 'src/core/characters/fire';
import { ForestCharacterPackage } from 'src/core/characters/forest';
import { GodCharacterPackage } from 'src/core/characters/god';
import { LimitedPackage } from 'src/core/characters/limited';
import { MobilePackage } from 'src/core/characters/mobile';
import { MountainCharacterPackage } from 'src/core/characters/mountain';
import { PvePackage } from 'src/core/characters/pve';
import { ShadowCharacterPackage } from 'src/core/characters/shadow';
import { SincerityCharacterPackage } from 'src/core/characters/sincerity';
import { SpPackage } from 'src/core/characters/sp';
import { SparkPackage } from 'src/core/characters/spark';
import { StandardCharacterPackage } from 'src/core/characters/standard';
import { StrategemPackage } from 'src/core/characters/strategem';
import { ThunderCharacterPackage } from 'src/core/characters/thunder';
import { WindCharacterPackage } from 'src/core/characters/wind';
import { WisdomPackage } from 'src/core/characters/wisdom';
import { YiJiang2011Package } from 'src/core/characters/yijiang2011';
import { YiJiang2012Package } from 'src/core/characters/yijiang2012';
import { YiJiang2013Package } from 'src/core/characters/yijiang2013';
import { YiJiang2014Package } from 'src/core/characters/yijiang2014';
import { YiJiang2015Package } from 'src/core/characters/yijiang2015';
import { Yuan6Package } from 'src/core/characters/yuan6';
import { Yuan7Package } from 'src/core/characters/yuan7';
import { YuePackage } from 'src/core/characters/yue';
import { GameCharacterExtensions } from 'src/core/game/game_props';

export type CharacterPackages = {
  [K in GameCharacterExtensions]: Character[];
};
export type CharacterPackage<Extension extends GameCharacterExtensions> = {
  [K in Extension]: Character[];
};
export type CharacterPackageLoader = (index: number) => Character[];

export class CharacterLoader {
  private static instance: CharacterLoader;
  private characters: CharacterPackages = {} as any;

  private constructor() {
    this.loadCharacters();
  }

  private static readonly CharacterLoaders: {
    [P in GameCharacterExtensions]: CharacterPackageLoader;
  } = {
    [GameCharacterExtensions.Standard]: StandardCharacterPackage,
    [GameCharacterExtensions.Wind]: WindCharacterPackage,
    [GameCharacterExtensions.Fire]: FireCharacterPackage,
    [GameCharacterExtensions.Forest]: ForestCharacterPackage,
    [GameCharacterExtensions.Mountain]: MountainCharacterPackage,
    [GameCharacterExtensions.Shadow]: ShadowCharacterPackage,
    [GameCharacterExtensions.Thunder]: ThunderCharacterPackage,
    [GameCharacterExtensions.God]: GodCharacterPackage,
    [GameCharacterExtensions.YiJiang2011]: YiJiang2011Package,
    [GameCharacterExtensions.YiJiang2012]: YiJiang2012Package,
    [GameCharacterExtensions.YiJiang2013]: YiJiang2013Package,
    [GameCharacterExtensions.YiJiang2014]: YiJiang2014Package,
    [GameCharacterExtensions.YiJiang2015]: YiJiang2015Package,
    [GameCharacterExtensions.Yuan6]: Yuan6Package,
    [GameCharacterExtensions.Yuan7]: Yuan7Package,
    [GameCharacterExtensions.SP]: SpPackage,
    [GameCharacterExtensions.Spark]: SparkPackage,
    [GameCharacterExtensions.Decade]: DecadePackage,
    [GameCharacterExtensions.Limited]: LimitedPackage,
    [GameCharacterExtensions.Biographies]: BiographiesPackage,
    [GameCharacterExtensions.Mobile]: MobilePackage,
    [GameCharacterExtensions.Wisdom]: WisdomPackage,
    [GameCharacterExtensions.Sincerity]: SincerityCharacterPackage,
    [GameCharacterExtensions.Benevolence]: BenevolencePackage,
    [GameCharacterExtensions.Strategem]: StrategemPackage,
    [GameCharacterExtensions.Pve]: PvePackage,
    [GameCharacterExtensions.Yue]: YuePackage,
  };

  public static getInstance() {
    if (!this.instance) {
      this.instance = new CharacterLoader();
    }

    return this.instance;
  }

  private loadCharacters() {
    let index = 0;
    for (const [packageName, loader] of Object.entries(CharacterLoader.CharacterLoaders)) {
      const characters = loader(index);
      this.characters[packageName] = characters;

      index += characters.length;
    }
  }

  public getAllCharacters() {
    return Object.values(this.characters).reduce<Character[]>(
      (addedCards, characters) => addedCards.concat(characters),
      [],
    );
  }

  public getPackages(...extensions: GameCharacterExtensions[]): Character[] {
    return extensions.reduce<Character[]>((addedCards, extension) => addedCards.concat(this.characters[extension]), []);
  }
}
