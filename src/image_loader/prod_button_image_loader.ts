import { SkillType } from "src/core/skills/skill";
import { LobbyButton } from "src/props/game_props";
import { SkillButtonImageSize } from "./image_loader";

import lobbyAcknowledgeButtonImage from "/sgsFile/images/lobby/acknowledge_button.png";
import lobbyCharactersListButtonImage from "/sgsFile/images/lobby/characters_list_button.png";
import lobbyFeedbackButtonImage from "/sgsFile/images/lobby/feedback_button.png";
import lobbyRecordButtonImage from "/sgsFile/images/lobby/record_button.png";
import lobbySettingsButtonImage from "/sgsFile/images/lobby/settings_button.png";

import awakenDisabledImage from "/sgsFile/images/skills/awaken_disabled.png";
import awakenDownImage from "/sgsFile/images/skills/awaken_down.png";
import awakenHoverImage from "/sgsFile/images/skills/awaken_hover.png";
import awakenImage from "/sgsFile/images/skills/awaken_normal.png";
import commonDisabledImage from "/sgsFile/images/skills/common_disabled.png";
import commonDownImage from "/sgsFile/images/skills/common_down.png";
import commonHoverImage from "/sgsFile/images/skills/common_hover.png";
import commonImage from "/sgsFile/images/skills/common_normal.png";
import compulsoryDisabledImage from "/sgsFile/images/skills/compulsory_disabled.png";
import compulsoryDownImage from "/sgsFile/images/skills/compulsory_down.png";
import compulsoryHoverImage from "/sgsFile/images/skills/compulsory_hover.png";
import compulsoryImage from "/sgsFile/images/skills/compulsory_normal.png";
import limitDisabledImage from "/sgsFile/images/skills/limit_disabled.png";
import limitDownImage from "/sgsFile/images/skills/limit_down.png";
import limitHoverImage from "/sgsFile/images/skills/limit_hover.png";
import limitImage from "/sgsFile/images/skills/limit_normal.png";
import wideAwakenDisabledImage from "/sgsFile/images/skills/wide_awaken_disabled.png";
import wideAwakenDownImage from "/sgsFile/images/skills/wide_awaken_down.png";
import wideAwakenHoverImage from "/sgsFile/images/skills/wide_awaken_hover.png";
import wideAwakenImage from "/sgsFile/images/skills/wide_awaken_normal.png";
import wideCommonDisabledImage from "/sgsFile/images/skills/wide_common_disabled.png";
import wideCommonDownImage from "/sgsFile/images/skills/wide_common_down.png";
import wideCommonHoverImage from "/sgsFile/images/skills/wide_common_hover.png";
import wideCommonImage from "/sgsFile/images/skills/wide_common_normal.png";
import wideCompulsoryDisabledImage from "/sgsFile/images/skills/wide_compulsory_disabled.png";
import wideCompulsoryDownImage from "/sgsFile/images/skills/wide_compulsory_down.png";
import wideCompulsoryHoverImage from "/sgsFile/images/skills/wide_compulsory_hover.png";
import wideCompulsoryImage from "/sgsFile/images/skills/wide_compulsory_normal.png";
import wideLimitDisabledImage from "/sgsFile/images/skills/wide_limit_disabled.png";
import wideLimitDownImage from "/sgsFile/images/skills/wide_limit_down.png";
import wideLimitHoverImage from "/sgsFile/images/skills/wide_limit_hover.png";
import wideLimitImage from "/sgsFile/images/skills/wide_limit_normal.png";

const lobbyButtons: {
  [T in LobbyButton]: string;
} = {
  record: lobbyRecordButtonImage,
  settings: lobbySettingsButtonImage,
  charactersList: lobbyCharactersListButtonImage,
  feedback: lobbyFeedbackButtonImage,
  acknowledge: lobbyAcknowledgeButtonImage,
};

const skillButtons: {
  [T in SkillType]: SkillButtonImageSize;
} = {
  [SkillType.Common]: {
    wide: {
      default: wideCommonImage,
      hover: wideCommonHoverImage,
      down: wideCommonDownImage,
      disabled: wideCommonDisabledImage,
    },
    normal: {
      default: commonImage,
      hover: commonHoverImage,
      down: commonDownImage,
      disabled: commonDisabledImage,
    },
  },
  [SkillType.Compulsory]: {
    wide: {
      default: wideCompulsoryImage,
      hover: wideCompulsoryHoverImage,
      down: wideCompulsoryDownImage,
      disabled: wideCompulsoryDisabledImage,
    },
    normal: {
      default: compulsoryImage,
      hover: compulsoryHoverImage,
      down: compulsoryDownImage,
      disabled: compulsoryDisabledImage,
    },
  },
  [SkillType.Limit]: {
    wide: {
      default: wideLimitImage,
      hover: wideLimitHoverImage,
      down: wideLimitDownImage,
      disabled: wideLimitDisabledImage,
    },
    normal: {
      default: limitImage,
      hover: limitHoverImage,
      down: limitDownImage,
      disabled: limitDisabledImage,
    },
  },
  [SkillType.Awaken]: {
    wide: {
      default: wideAwakenImage,
      hover: wideAwakenHoverImage,
      down: wideAwakenDownImage,
      disabled: wideAwakenDisabledImage,
    },
    normal: {
      default: awakenImage,
      hover: awakenHoverImage,
      down: awakenDownImage,
      disabled: awakenDisabledImage,
    },
  },
  [SkillType.Quest]: {
    wide: {
      default: wideCommonImage,
      hover: wideCommonHoverImage,
      down: wideCommonDownImage,
      disabled: wideCommonDisabledImage,
    },
    normal: {
      default: commonImage,
      hover: commonHoverImage,
      down: commonDownImage,
      disabled: commonDisabledImage,
    },
  },
};

export function getSkillButtonImages(type: SkillType, size: "wide" | "normal") {
  return skillButtons[type][size];
}

export function getLobbyButtonImage(variant: LobbyButton) {
  return lobbyButtons[variant];
}
