import { CharacterGender } from "src/core/characters/character";
import { Sanguosha } from "src/core/game/engine";
import { CharacterSkinInfo } from "src/skins/skins";
import { AudioLoader } from "./audio_loader";
import lobbyBGM from "/sgsFile/audios/bgm/lobby.mp3";
import roomBGM from "/sgsFile/audios/bgm/room.mp3";
import chainAudio from "/sgsFile/audios/chain.mp3";
import damageAudio from "/sgsFile/audios/damage.mp3";
import seriousDamageAudio from "/sgsFile/audios/damage2.mp3";
import equipAudio from "/sgsFile/audios/equip.mp3";
import gameStartAudio from "/sgsFile/audios/gamestart.mp3";
import lostHpAudio from "/sgsFile/audios/loseHp.mp3";
export class ProdAudioLoader implements AudioLoader {
  getLobbyBackgroundMusic() {
    return lobbyBGM;
  }

  getRoomBackgroundMusic() {
    return roomBGM;
  }
  getGameStartAudio() {
    return gameStartAudio;
  }

  getDamageAudio(damage: number) {
    return damage === 1 ? damageAudio : seriousDamageAudio;
  }
  getLoseHpAudio(): string {
    return lostHpAudio;
  }
  getEquipAudio(): string {
    return equipAudio;
  }
  getChainAudio(): string {
    return chainAudio;
  }

  async getQuickChatAudio(
    index: number,
    gender: CharacterGender,
  ): Promise<string> {
    return `/sgsFile/audios/quickChats/${
      gender === CharacterGender.Female ? "female" : "male"
    }/${index}.mp3`;
  }

  async getCardAudio(
    cardName: string,
    gender: CharacterGender,
    characterName?: string,
  ): Promise<string> {
    const genderString = gender === CharacterGender.Female ? "female" : "male";
    return `/sgsFile/audios/cards/${genderString}/${cardName}.ogg`;
  }

  async getSkillAudio(
    skillName: string,
    gender: CharacterGender,
    characterName?: string,
    audioIndex?: number,
  ): Promise<string> {
    const skill = Sanguosha.getSkillBySkillName(skillName);

    if (!audioIndex) {
      audioIndex =
        Math.round(Math.random() * (skill.audioIndex(characterName) - 1)) + 1;
    }

    if (characterName) {
      characterName = skill.RelatedCharacters.includes(characterName)
        ? "." + characterName
        : "";
    }

    return `/sgsFile/audios/characters/${skillName}${
      characterName ? characterName : ""
    }${audioIndex}.mp3`;
  }

  async getDeathAudio(characterName: string): Promise<string> {
    return `/sgsFile/audios/characters/${characterName}.mp3`;
  }

  async getCharacterSkinAudio(
    characterName: string,
    skinName: string,
    skillName: string,
    audioIndex?: number,
    skinData?: CharacterSkinInfo[],
    gender?: CharacterGender,
  ): Promise<string> {
    let voice: string;
    if (skinData !== undefined && skinName !== characterName) {
      const voices = skinData
        .find(
          (characterSkinInfo) => characterSkinInfo.character === characterName,
        )
        ?.infos.find((imageInfo) =>
          imageInfo.images.find((images) => images.name === skinName),
        )?.voices;
      const voiceDetail = voices?.find((skill) => skill.skill === skillName)
        ?.detail;
      if (voices !== undefined && voiceDetail) {
        const voicePath =
          voiceDetail[Math.floor(voiceDetail?.length * Math.random())].location;
        voice = import.meta.env.PUBLIC_URL + "/" + voicePath;
      } else if (skillName === "death") {
        voice = await this.getDeathAudio(characterName);
      } else {
        voice = await this.getSkillAudio(
          skillName,
          gender!,
          characterName,
          audioIndex,
        );
      }
    } else if (skillName === "death") {
      voice = await this.getDeathAudio(characterName);
    } else {
      voice = await this.getSkillAudio(
        skillName,
        gender!,
        characterName,
        audioIndex,
      );
    }

    return voice;
  }
}
