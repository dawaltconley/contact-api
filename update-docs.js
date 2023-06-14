import { yamlParse } from 'https://esm.sh/yaml-cfn@^0.3.1';
import { generateDocs } from 'https://gist.githubusercontent.com/dawaltconley/673a2e6eb7c45dde66e7ff5d84791f0a/raw/1c986aeacfde914f54c5a24ff1501f12ed636daa/index.js';

const [templateFile, outFile] = Deno.args;
if (!templateFile) throw new Error('Missing template file');

const template = await Deno.readTextFile(templateFile).then(yamlParse);
const docs = generateDocs(templateFile, template);
await Deno.writeTextFile(outFile, docs);
console.log(`wrote docs to ${outFile}`);
