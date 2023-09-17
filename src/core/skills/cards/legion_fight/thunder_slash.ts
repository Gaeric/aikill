import { SlashSkillTrigger } from 'src/core/ai/skills/cards/slash';
import { DamageType } from 'src/core/game/game_props';
import { AI, CommonSkill } from 'src/core/skills/skill';
import { SlashSkill } from '../standard/slash';

@AI(SlashSkillTrigger)
@CommonSkill({ name: 'thunder_slash', description: 'thunder_slash_description' })
export class ThunderSlashSkill extends SlashSkill {
  public readonly damageType: DamageType = DamageType.Thunder;
}
