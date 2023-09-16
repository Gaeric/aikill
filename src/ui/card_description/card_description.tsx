import classNames from 'classnames';
import { Card, CardType } from '/src/core/cards/card';
import { WeaponCard } from '/src/core/cards/equip_card';
import { ClientTranslationModule } from '/src/core/translations/translation_module.client';
import * as React from 'react';
import { CardNumberItem } from '/src/ui/card/card_number';
import { CardSuitItem } from '/src/ui/card/card_suit';
import styles from './card_description.module.css';

export type CardDescriptionProps = {
  className?: string;
  card: Card;
  translator: ClientTranslationModule;
};

export const CardDescription = (props: CardDescriptionProps) => {
  const { translator, className, card } = props;
  return (
    <div className={classNames(styles.cardDescriptions, className)}>
      <div className={styles.cardSpefication}>
        <span className={styles.cardName}>{translator.tr(card.Name)}</span>
        <CardNumberItem cardNumber={card.CardNumber} isRed={card.isRed()} />
        <CardSuitItem suit={card.Suit} />
      </div>
      {card.is(CardType.Weapon) && (
        <span className={styles.attackRange}>
          {translator.tr('attack range:') + (card as unknown as WeaponCard).AttackDistance}
        </span>
      )}
      <span className={styles.cardDescription} dangerouslySetInnerHTML={{ __html: translator.tr(card.Description) }} />
    </div>
  );
};
