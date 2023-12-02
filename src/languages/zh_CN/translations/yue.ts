import { Word } from 'src/languages';

export const characterDictionary: Word[] = [
  { source: 'yue', target: '乐包' },

  { source: 'yue_caiwenji', target: '乐蔡文姬' },
  { source: 'shuangjia', target: '霜茄' },
  { source: 'beifen', target: '悲愤' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'shuangjia_description',
    target:
      '<b>锁定技</b>，游戏开始时，你的初始手牌增加“胡笳”标记且不计入手牌上限，你每拥有一张“胡笳”，其它角色与你计算距离+1（最多+5）。',
  },
  {
    source: 'beifen_description',
    target:
      '<b>锁定技</b>，当你失去胡笳后，你获得与手中“胡笳”花色均不同的牌各一张，你手中“胡笳”少于其他牌时，你使用牌无距离和次数限制。',
  },
];
