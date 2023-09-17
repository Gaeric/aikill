import { CharacterEquipSections } from "src/core/characters/character";
import { PlayerId, PlayerRole } from "src/core/player/player_props";
import { Functional } from "src/core/shares/libs/functional";
import { Precondition } from "src/core/shares/libs/precondition/precondition";
import { GameMode } from "src/core/shares/types/room_props";
import { SkillType } from "src/core/skills/skill";
import { LobbyButton } from "src/props/game_props";
import { CharacterSkinInfo } from "src/skins/skins";
import { ImageLoader } from "./image_loader";

import cardBackImage from "/sgsFile/images/cards/cardback.webp";
import BingLiangCunDuanIcon from "/sgsFile/images/delayed_tricks/bingliangcunduan.png";
import LeBuSiShuIcon from "/sgsFile/images/delayed_tricks/lebusishu.png";
import LightningIcon from "/sgsFile/images/delayed_tricks/lightning.png";
import oneVersusTwoModeIcon from "/sgsFile/images/lobby/1v2_mode.png";
import twoVersusTwoModeIcon from "/sgsFile/images/lobby/2v2_mode.png";
import lobbyBackgroundImage from "/sgsFile/images/lobby/background.png";
import createRoomImage from "/sgsFile/images/lobby/create.png";
import generalModeIcon from "/sgsFile/images/lobby/general_mode.png";
import hegemonyModeIcon from "/sgsFile/images/lobby/hegemony_mode.png";
import illustraion1 from "/sgsFile/images/lobby/illustration1.png";
import illustraion2 from "/sgsFile/images/lobby/illustration2.png";
import illustraion3 from "/sgsFile/images/lobby/illustration3.png";
import illustraion4 from "/sgsFile/images/lobby/illustration4.png";
import illustraion5 from "/sgsFile/images/lobby/illustration5.png";
import illustraion6 from "/sgsFile/images/lobby/illustration6.png";
import illustraion7 from "/sgsFile/images/lobby/illustration7.png";
import illustraion8 from "/sgsFile/images/lobby/illustration8.png";
import pveModeIcon from "/sgsFile/images/lobby/pve_mode.png";
import roomListImage from "/sgsFile/images/lobby/room_list.png";
import acknowledgementImage from "/sgsFile/images/system/acknowledge.png";
import backgroundImage from "/sgsFile/images/system/background.jpg";
import cardNumberBg from "/sgsFile/images/system/cardNumBg.png";
import chainImage from "/sgsFile/images/system/chain.png";
import dialogBackgroundImage from "/sgsFile/images/system/dialog_background.png";
import emptySeatImage from "/sgsFile/images/system/empty_seat.png";
import feedbackImage from "/sgsFile/images/system/feedback.png";
import gameLogBoardImage from "/sgsFile/images/system/game_log_board.png";
import unknownCharacterImage from "/sgsFile/images/system/player_seat.png";
import turnedOverCoverImage from "/sgsFile/images/system/turn_over.png";
import waitingRoomBackgroundImage from "/sgsFile/images/system/waiting_room_background.jpg";

import {
  getLobbyButtonImage,
  getSkillButtonImages,
} from "./prod_button_image_loader";

const gameModeIcons = {
  [GameMode.Standard]: generalModeIcon,
  [GameMode.OneVersusTwo]: oneVersusTwoModeIcon,
  [GameMode.TwoVersusTwo]: twoVersusTwoModeIcon,
  [GameMode.Pve]: pveModeIcon,
  [GameMode.Hegemony]: hegemonyModeIcon,
};
const lobbyIllustrations = [
  illustraion1,
  illustraion2,
  illustraion3,
  illustraion4,
  illustraion5,
  illustraion6,
  illustraion7,
  illustraion8,
];

export class ProdImageLoader implements ImageLoader {
  public async getCardImage(name: string) {
    const image: string = `/sgsFile/images/cards/${name}.webp`;

    return {
      alt: name,
      src: image,
    };
  }

  public getCardBack() {
    return { alt: "New QSanguosha", src: cardBackImage };
  }

  public getBackgroundImage() {
    return { src: backgroundImage, alt: "" };
  }

  getUnknownCharacterImage() {
    return { src: unknownCharacterImage, alt: "" };
  }
  public getEmptySeatImage() {
    return { src: emptySeatImage, alt: "" };
  }

  public getCardNumberBgImage() {
    return { src: cardNumberBg, alt: "" };
  }

  getTurnedOverCover() {
    return { src: turnedOverCoverImage, alt: "" };
  }

  public getChainImage() {
    return { alt: "", src: chainImage };
  }

  public getDelayedTricksImage(cardName: string) {
    if (cardName === "lebusishu") {
      return { alt: cardName, src: LeBuSiShuIcon };
    }
    if (cardName === "bingliangcunduan") {
      return { alt: cardName, src: BingLiangCunDuanIcon };
    }
    if (cardName === "lightning") {
      return { alt: cardName, src: LightningIcon };
    }

    return { alt: cardName };
  }

  public getSkillButtonImage(skillType: SkillType, size: "wide" | "normal") {
    return getSkillButtonImages(skillType, size);
  }

  public async getOthersEquipCard(cardName: string) {
    const image: string = `/sgsFile/images/others_equips/${cardName}.png`;
    return { alt: cardName, src: image };
  }

  public async getOthersAbortedEquipCard() {
    const image: string = "/sgsFile/images/others_equips/abort.png";
    return { alt: "aborted", src: image };
  }

  public async getSlimAbortedEquipSection(section: CharacterEquipSections) {
    let sectionName: string | undefined;
    switch (section) {
      case CharacterEquipSections.Weapon:
        sectionName = "aborted_weapon";
        break;
      case CharacterEquipSections.Shield:
        sectionName = "aborted_shield";
        break;
      case CharacterEquipSections.DefenseRide:
        sectionName = "aborted_defense_ride";
        break;
      case CharacterEquipSections.OffenseRide:
        sectionName = "aborted_offense_ride";
        break;
      case CharacterEquipSections.Precious:
        sectionName = "aborted_precious";
        break;
      default:
        throw Precondition.UnreachableError(section);
    }

    const image: string = `/sgsFile/images/slim_equips/${sectionName}.png`;
    return { alt: "aborted", src: image };
  }

  public async getPlayerRoleCard(
    role: PlayerRole,
    gameMode: GameMode,
    selfRole?: PlayerRole,
  ) {
    const roleName =
      gameMode === GameMode.TwoVersusTwo && selfRole !== undefined
        ? role === selfRole
          ? "ally"
          : "enemy"
        : Functional.getPlayerRoleRawText(role, gameMode);
    const image: string = `/sgsFile/images/system/death/${roleName}.png`;
    return { src: image, alt: roleName };
  }

  public async getSlimEquipCard(cardName: string) {
    const image: string = `/sgsFile/images/slim_equips/${cardName}.png`;
    return { alt: "Slim Equip Card", src: image };
  }

  public async getSlimCard(cardName: string) {
    const image: string = `/sgsFile/images/slim_cards/${cardName}.png`;
    return { alt: "Slim Card", src: image };
  }

  public async getCharacterImage(characterName: string) {
    const image: string = `/sgsFile/images/characters/${characterName}.png`;
    return { alt: characterName, src: image };
  }
  public async getCharacterSkinPlay(
    characterName: string,
    skinData?: CharacterSkinInfo[],
    playerId?: PlayerId,
    skinName?: string,
  ) {
    let image: string;
    if (skinName !== characterName && skinData !== undefined) {
      const skin = skinData
        .find((skinInfo) => skinInfo.character === characterName)
        ?.infos.find(
          (skinInfo) =>
            skinInfo.images?.find((imagesInfo) => imagesInfo.name === skinName),
        );
      if (skin) {
        image =
          import.meta.env.PUBLIC_URL +
          "/" +
          skin?.images.find((imagesInfo) => imagesInfo.name === skinName)?.seat;
      } else {
        image = `/sgsFile/images/characters/${characterName}.png`;
      }
    } else {
      image = `/sgsFile/images/characters/${characterName}.png`;
    }
    if (skinName === "random") {
      image = "/sgsFile/images/system/player_seat.png";
    }
    return { alt: characterName, src: image };
  }

  public getGameModeIcon(mode: GameMode) {
    return { src: gameModeIcons[mode], alt: "" };
  }
  public getRandomLobbyIllustration() {
    const index = Math.floor(Math.random() * lobbyIllustrations.length);
    return { src: lobbyIllustrations[index], alt: "" };
  }
  public getLobbyBackgroundImage() {
    return { src: lobbyBackgroundImage, alt: "" };
  }
  public getLobbyButtonImage(buttonVariant: LobbyButton) {
    return { src: getLobbyButtonImage(buttonVariant), alt: "" };
  }
  public getWaitingRoomBackgroundImage() {
    return { src: waitingRoomBackgroundImage, alt: "" };
  }
  public getCreateRoomButtonImage() {
    return { src: createRoomImage, alt: "" };
  }
  public getRoomListBackgroundImage() {
    return { src: roomListImage, alt: "" };
  }
  public getDialogBackgroundImage() {
    return { src: dialogBackgroundImage, alt: "" };
  }
  public getAcknowledgementImage() {
    return { src: acknowledgementImage, alt: "" };
  }
  public getGameLogBoradImage() {
    return { src: gameLogBoardImage, alt: "" };
  }
  public getFeedbackImage() {
    return { src: feedbackImage, alt: "" };
  }
}
