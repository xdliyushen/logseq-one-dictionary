import "@logseq/libs";
import { PART_OF_SPEECH_SHORTCUT_MAP, SETTING_SCHEMA } from "./constant";

function main() {
  logseq.useSettingsSchema(SETTING_SCHEMA);

  logseq.Editor.registerSlashCommand('Define', async () => {
    const block = await logseq.Editor.getCurrentBlock();
    if (!block) {
      return;
    }
    let content = await logseq.Editor.getEditingBlockContent();
    content = content.replaceAll(/[[\] ]/g, "");

    const isCN = logseq.settings?.language === 'zh-CN';
    const showSentence = logseq.settings?.showSentence;

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${content}`);
      const basicDefinition = await res.json();
      let cnDefinition: any = null;

      if (basicDefinition.message) {
        throw new Error(basicDefinition.message);
      }

      if (isCN) {
        const cnRes = await fetch(`https://dict-mobile.iciba.com/interface/index.php?c=word&m=getsuggest&nums=10&is_need_mean=1&word=${content}`);
        cnDefinition = ((await cnRes.json()).message || []).find((m: any) => m.key === content)

        if(!cnDefinition) {
          throw new Error('no definition');
        }
      }

      const audio = basicDefinition[0].phonetics.find((p: any) => p.audio);
      const phonetics = {
        content: "phonetics",
        children: [
          {
            content: audio
              ? `${audio.text}\n<audio controls><source src="${audio.audio}"></audio>`
              : basicDefinition[0].phonetics[0].text,
          }
        ],
      }
      const hasPhonetics = !!phonetics.children[0].content;

      let definitions = [];
      if(isCN) {
        definitions = cnDefinition.means.map((m: any) => {
          // @ts-ignore
          const partOfSpeech = PART_OF_SPEECH_SHORTCUT_MAP[m.part];
          const cnMeans = m.means.join(',');
          const enDifinition = basicDefinition[0].meanings
            .find((d: any) => d.partOfSpeech === partOfSpeech)
            .definitions;
          const cnSentences = enDifinition
            .find((d: any) => d.example)
            ?.example || '';

          return {
            content: partOfSpeech,
            children: showSentence && cnSentences ? [
              { content: cnMeans },
              { content: cnSentences },
            ] : [
              { content: cnMeans },
            ],
          };
        });
      } else {
        definitions = basicDefinition[0].meanings.map((m: any) => {
          return {
            content: m.partOfSpeech,
            children: m.definitions.map((d: any) => {
              return {
                content: d.definition,
                children: showSentence && d.example ? [{ content: d.example }] : [],
              };
            }),
          };
        });
      }

      await logseq.Editor.insertBatchBlock(
        block.uuid,
        hasPhonetics ? [phonetics, ...definitions] : definitions,
        { sibling: false },
      );
    } catch (error) {
      logseq.UI.showMsg(`error defining word ${content}: ${error}`, "error");
      console.error(error);
    }
  });
}

logseq.ready(main).catch(console.error);
