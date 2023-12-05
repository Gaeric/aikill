import classNames from 'classnames';
import { Character, CharacterId } from 'src/core/characters/character';
import { Sanguosha } from 'src/core/game/engine';
import { Skill } from 'src/core/skills/skill';
import { ClientTranslationModule } from 'src/core/translations/translation_module.client';
import { ImageLoader } from 'src/image_loader/image_loader';
import * as React from 'react';
import { CharacterCard } from 'src/ui/character/character';
import { Tooltip } from 'src/ui/tooltip/tooltip';
import styles from './character_selector_dialog.module.css';
import { BaseDialog } from '../base_dialog';

type CharacterSelectorDialogProps = {
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  characterIds: CharacterId[];
  selectedCharacters?: CharacterId[];
  onClick?(character: Character): void;
};

export function CharacterSelectorDialog(props: CharacterSelectorDialogProps) {
  const [tooltipCharacter, setTooltipCharacter] = React.useState<Character | undefined>();
  const [selectedCharacters, setSelectedCharacters] = React.useState<CharacterId[]>([]);

  function onOpenTooltip(character: Character) {
    setTooltipCharacter(character);
  }
  function onCloseTooltip() {
    setTooltipCharacter(undefined);
  }

  function createTooltipContent(character: Character, getRelatedSkills?: boolean) {
    const { translator } = props;
    const skills = character.Skills.filter(
      skill => !skill.isShadowSkill() && !(getRelatedSkills && skill.RelatedSkills.length === 0),
    );

    return getRelatedSkills
      ? skills
          .reduce<Skill[]>((relatedSkills, skill) => {
            skill.RelatedSkills.length > 0 &&
              relatedSkills.push(...skill.RelatedSkills.map(skillName => Sanguosha.getSkillBySkillName(skillName)));
            return relatedSkills;
          }, [])
          .map((skill, index) => (
            <div className={styles.skillInfo} key={index}>
              {index === 0 && (
                <span className={styles.relatedSkillTiltle}>{props.translator.trx('related skill')}</span>
              )}
              <div className={styles.skillItem}>
                <span className={classNames(styles.skillName, styles.relatedSkill)}>{translator.tr(skill.Name)}</span>
                <span
                  className={styles.skillDescription}
                  dangerouslySetInnerHTML={{
                    __html: translator.tr(skill.Description),
                  }}
                />
              </div>
            </div>
          ))
      : skills.map((skill, index) => (
          <div className={styles.skillInfo} key={index}>
            <div className={styles.skillItem}>
              <span className={styles.skillName}>{translator.tr(skill.Name)}</span>
              <span
                className={styles.skillDescription}
                dangerouslySetInnerHTML={{
                  __html: translator.tr(skill.Description),
                }}
              />
            </div>
          </div>
        ));
  }
  function onClick(character: Character) {
    let currentSelectedCharacters = selectedCharacters;
    props.onClick && props.onClick(character);
    const index = selectedCharacters.findIndex(characterId => characterId === character.Id);
    if (index >= 0) {
      currentSelectedCharacters.splice(index, 1);
    } else {
      currentSelectedCharacters.push(character.Id);
    }
    setSelectedCharacters(currentSelectedCharacters);
  }

  return (
    <BaseDialog title={props.translator.tr('please choose a character')}>
      <div className={styles.innerDialog}>
        <div className={styles.characterSelector}>
          {props.characterIds.map((characterId, index) => {
            const character = Sanguosha.getCharacterById(characterId);
            return (
              <div
                className={styles.characterSelectorItem}
                onMouseLeave={onCloseTooltip}
                onMouseEnter={() => onOpenTooltip(character)}
                key={index}
              >
                <CharacterCard
                  imageLoader={props.imageLoader}
                  translator={props.translator}
                  character={character}
                  key={characterId}
                  onClick={onClick}
                  size={'small'}
                  selected={selectedCharacters.includes(characterId)}
                />
              </div>
            );
          })}
        </div>
        {tooltipCharacter && (
          <Tooltip position={['center']} className={styles.tooltip}>
            {createTooltipContent(tooltipCharacter)}
            {createTooltipContent(tooltipCharacter, true)}
          </Tooltip>
        )}
      </div>
    </BaseDialog>
  );
}
