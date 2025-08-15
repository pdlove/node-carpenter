// babel-plugin-inline-images.js
import fs from 'fs';
import path from 'path';

export default function inlineImagesPlugin() {
  return {
    name: 'inline-images',
    visitor: {
      ImportDeclaration(pathNode, state) {
        const { node } = pathNode;
        const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];

        if (extensions.some(ext => node.source.value.endsWith(ext))) {
          const filename = path.resolve(
            path.dirname(state.file.opts.filename),
            node.source.value
          );

          const mimeType = getMimeType(filename);
          const base64 = fs.readFileSync(filename).toString('base64');
          const dataUri = `data:${mimeType};base64,${base64}`;

          // Replace the import with a const declaration
          const varName = node.specifiers[0].local.name;
          pathNode.replaceWithSourceString(`const ${varName} = "${dataUri}"`);
        }
      }
    }
  };
}

function getMimeType(file) {
  const ext = path.extname(file).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}
