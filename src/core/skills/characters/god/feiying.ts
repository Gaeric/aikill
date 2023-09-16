import { DefenseHorseSkill } from '/src/core/skills/cards/standard/defense_horse';
import { CompulsorySkill } from '/src/core/skills/skill';

@CompulsorySkill({ name: 'feiying', description: 'feiying_description' })
export class FeiYing extends DefenseHorseSkill {
  public audioIndex(): number {
    return 0;
  }
}
