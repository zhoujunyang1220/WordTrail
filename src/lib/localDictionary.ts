// Local dictionary fallback for offline use
// Contains common vocabulary data including IPA, definitions, examples
export interface LocalDictEntry {
  word: string;
  phonetic: string;
  pos: string;
  chineseDefinition: string;
  englishDefinition: string;
  rootAffix?: string;
  memoryHook?: string;
  phrases?: string[];
  sentences?: { en: string; zh: string }[];
}

const localDictionary: Record<string, LocalDictEntry> = {
  "ubiquitous": {
    word: "ubiquitous",
    phonetic: "/juːˈbɪkwɪtəs/",
    pos: "adj.",
    chineseDefinition: "无处不在的，普遍存在的",
    englishDefinition: "Present, appearing, or found everywhere.",
    rootAffix: "词根: ubique (Latin) 表示'到处'。后缀 -ous 表示形容词，'充满...的'。",
    memoryHook: "谐音记忆：'you-be-quite-us'：你们都要安静（be quiet），因为老师【无处不在】地盯着我们。",
    phrases: ["ubiquitous technology (无处不在的技术)", "ubiquitous access (随时随地的访问)"],
    sentences: [
      { en: "Smartphones have become ubiquitous in daily life.", zh: "智能手机在日常生活中已变得无处不在。" },
      { en: "The brand's advertising campaign was ubiquitous.", zh: "该品牌的广告活动铺天盖地。" }
    ]
  },
  "ephemeral": {
    word: "ephemeral",
    phonetic: "/ɪˈfemərəl/",
    pos: "adj.",
    chineseDefinition: "短暂的，朝生暮死的",
    englishDefinition: "Lasting for a very short time.",
    rootAffix: "源自希腊语 ephemeros（仅一日的）。epi- (在...之上) + hemera (日/天)。",
    memoryHook: "联想：e- (外) + phe- (发声/呈现)：露水蒸发后声音和现象在外面也只停留【短暂的一瞬】。",
    phrases: ["ephemeral beauty (短暂的美)", "ephemeral nature of fame (名望的瞬时性)"],
    sentences: [
      { en: "The beauty of cherry blossoms is beautiful but ephemeral.", zh: "樱花虽美但花期短暂。" },
      { en: "Social media trends are highly ephemeral.", zh: "社交媒体上的潮流趋势往往如过眼云烟。" }
    ]
  },
  "serendipity": {
    word: "serendipity",
    phonetic: "/ˌserənˈdɪpəti/",
    pos: "n.",
    chineseDefinition: "意外发现美好事物的机缘，缘分，幸运的巧合",
    englishDefinition: "The occurrence of events by chance in a happy or beneficial way.",
    rootAffix: "源于波斯童话《塞伦迪普的三个王子》，故事中王子总是能意外地发现奇珍异宝。",
    memoryHook: "记忆挂钩：'死人肚皮打'（谐音）- 绝境逢生：在【意外中发现宝藏】。",
    phrases: ["a moment of serendipity (机缘巧合的时刻)", "pure serendipity (纯粹的意外之喜)"],
    sentences: [
      { en: "Finding that book was pure serendipity.", zh: "找到那本书纯属意外之喜。" },
      { en: "Our meeting at the train station was serendipity.", zh: "在火车站遇到老校友纯属幸运的巧合。" }
    ]
  },
  "eloquent": {
    word: "eloquent",
    phonetic: "/ˈeləkwənt/",
    pos: "adj.",
    chineseDefinition: "口才好的，雄辩的，有说服力的",
    englishDefinition: "Fluent or persuasive in speaking or writing.",
    rootAffix: "词根: loqu- '说' (拉丁语 loqui)。e- (出) + loqu + -ent = '说出来的' → 能言善辩。",
    memoryHook: "联想：e-往外 + loqu-说 → 【能说会道】。同根词：loquacious (健谈的)。",
    phrases: ["an eloquent speaker (雄辩的演说家)", "eloquent silence (无声胜有声)"],
    sentences: [
      { en: "She delivered an eloquent speech at the ceremony.", zh: "她在典礼上发表了动人的演说。" },
      { en: "His writing is clear and eloquent.", zh: "他的文章清晰而有说服力。" }
    ]
  },
  "pragmatic": {
    word: "pragmatic",
    phonetic: "/præɡˈmætɪk/",
    pos: "adj.",
    chineseDefinition: "务实的，实用主义的",
    englishDefinition: "Dealing with things sensibly and realistically.",
    rootAffix: "词根: pragm- '行为、事实' (希腊语)。-atic 形容词后缀。",
    memoryHook: "联想：pragma(实践) + tic → 注重【实际效果】的。反义词：idealistic。",
    phrases: ["a pragmatic approach (务实的方法)", "pragmatic solutions (切实可行的方案)"],
    sentences: [
      { en: "We need a pragmatic approach to solve this problem.", zh: "我们需要用务实的方法解决这个问题。" },
      { en: "He is known for his pragmatic leadership style.", zh: "他以务实的领导风格闻名。" }
    ]
  },
  "resilient": {
    word: "resilient",
    phonetic: "/rɪˈzɪliənt/",
    pos: "adj.",
    chineseDefinition: "有韧性的，坚韧不拔的，能迅速恢复的",
    englishDefinition: "Able to recover quickly from difficulties.",
    rootAffix: "词根: salire/-sil- '跳' (拉丁语)。re- (回) + sil- (跳) + -ient = '跳回原状' → 弹性/韧性。",
    memoryHook: "联想：re(再次) + sil(跳) → 【弹回】→ 遇到挫折能重新振作。",
    phrases: ["resilient economy (有韧性的经济)", "a resilient spirit (坚韧不拔的精神)"],
    sentences: [
      { en: "Children are often more resilient than adults think.", zh: "孩子往往比大人想象的更有韧性。" },
      { en: "The economy proved remarkably resilient after the crisis.", zh: "危机后经济表现出惊人的韧性。" }
    ]
  },
  "ambiguous": {
    word: "ambiguous",
    phonetic: "/æmˈbɪɡjuəs/",
    pos: "adj.",
    chineseDefinition: "模棱两可的，含糊不清的，歧义的",
    englishDefinition: "Open to more than one interpretation; not having a clear meaning.",
    rootAffix: "词根: ambig- '四处走动' (ambi- 两边 + agere 驱动)。-uous 形容词后缀。",
    memoryHook: "拆分：ambi(两边) + guous → 【两边都说得通】→ 含糊的。",
    phrases: ["ambiguous statement (模棱两可的陈述)", "ambiguous results (不明确的结果)"],
    sentences: [
      { en: "His answer was deliberately ambiguous.", zh: "他的回答故意含糊其辞。" },
      { en: "The contract contains several ambiguous clauses.", zh: "合同中有几处模棱两可的条款。" }
    ]
  }
};

export function lookupLocal(word: string): LocalDictEntry | null {
  const key = word.trim().toLowerCase();
  return localDictionary[key] || null;
}
