import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export const SETTING_SCHEMA: SettingSchemaDesc[] = [
    // perference language
    {
        key: 'language',
        type: 'enum',
        title: 'Language to use for definitions',
        description: 'What language do you want to default to when defining?',
        default: 'en',
        enumChoices: ['en', 'zh-CN'],
        enumPicker: 'select',
    },
    // show sentence
    {
        key: 'showSentence',
        type: 'boolean',
        title: 'Show sentence',
        description: 'Show sentence in the definition',
        default: true,
        enumPicker: "checkbox",
    },
];

export const PART_OF_SPEECH_SHORTCUT_MAP = {
    'n.': 'noun',
    'v.': 'verb',
    'vi.': 'verb',
    'vt.': 'verb',
    'adj.': 'adjective',
    'adv.': 'adverb',
    'pron.': 'pronoun',
    'prep.': 'preposition',
    'conj.': 'conjunction',
    'int.': 'interjection',
    'det.': 'determiner',
    'abbr.': 'abbreviation',
    'excl.': 'exclamation',
};
