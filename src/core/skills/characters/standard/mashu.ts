import { OffenseHorseSkill } from 'src/core/skills/cards/standard/offense_horse';
import { CompulsorySkill } from 'src/core/skills/skill';

@CompulsorySkill({ name: 'mashu', description: 'mashu_description' })
export class MaShu extends OffenseHorseSkill {
  public audioIndex(): number {
    return 0;
  }
}
