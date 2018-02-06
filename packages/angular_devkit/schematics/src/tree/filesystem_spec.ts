/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable:non-null-operator
import { normalize } from '@angular-devkit/core';
import { FileSystemTree } from './filesystem';
import { InMemoryFileSystemTreeHost } from './memory-host';


describe('FileSystemDirEntry', () => {
  const sets: {
    name: string,
    files: string[],
    visits: {
      root: string,
      expected?: string[],
      focus?: boolean,
    }[],
    focus?: boolean,
  }[] = [
    {
      name: 'empty',
      files: [],
      visits: [
        {root: '/', expected: []},
      ],
    },

    {
      name: 'file at root',
      files: ['/file'],
      visits: [
        {root: '/'},
        {root: '/file', expected: []},
      ],
    },
    {
      name: 'file under first level folder',
      // duplicate use case: folder of single file at root
      files: ['/folder/file'],
      visits: [
        {root: '/'},
        {root: '/folder', expected: ['/folder/file']},
        {root: '/folder/file', expected: []},
        {root: '/wrong', expected: []},
      ],
    },
    {
      name: 'file under nested folder',
      // duplicate use case: nested folder of files
      files: ['/folder/nested_folder/file'],
      visits: [
        {root: '/'},
        {root: '/folder', expected: ['/folder/nested_folder/file']},
        {root: '/folder/nested_folder', expected: ['/folder/nested_folder/file']},
        {root: '/folder/nested_folder/file', expected: []},
      ],
    },

    {
      name: 'nested folders',
      // duplicate use case: folder of folders at root
      // duplicate use case: folders of mixed
      files: [
        '/folder/nested_folder0/file',
        '/folder/nested_folder1/folder/file',
        '/folder/nested_folder2/file',
        '/folder/nested_folder2/folder/file',
      ],
      visits: [
        {root: '/'},
        {root: '/folder'},
        {root: '/folder/nested_folder0', expected: ['/folder/nested_folder0/file']},
        {root: '/folder/nested_folder1', expected: ['/folder/nested_folder1/folder/file']},
        {root: '/folder/nested_folder1/folder', expected: ['/folder/nested_folder1/folder/file']},
        {root: '/folder/nested_folder2', expected: [
          '/folder/nested_folder2/file',
          '/folder/nested_folder2/folder/file',
        ]},
        {root: '/folder/nested_folder2/folder', expected: ['/folder/nested_folder2/folder/file']},
      ],
    },
  ];

  sets.forEach(({name, files: paths, visits, focus: focusSet}) => {
    visits.forEach(({root, expected, focus}) => {
      if (expected == null) { expected = paths; }

      const tester = focusSet || focus ? fit : it;
      tester(`can visit: ${name} from ${root}`, () => {
        const files: {[key: string]: string} = {};
        const addFile = (path: string) => files[path] = path;
        paths.forEach(addFile);

        const host = new InMemoryFileSystemTreeHost(files);
        const tree = new FileSystemTree(host);

        const allPaths: string[] = [];
        tree.getDir(normalize(root))
          .visit((p, entry) => {
            expect(entry).not.toBeNull();
            expect(entry !.content.toString()).toEqual(p);
            allPaths.push(p);
          });

        expect(allPaths).toEqual(expected!);
      });
    });
  });
});


describe('FileSystem', () => {
  it('can create files', () => {
    const host = new InMemoryFileSystemTreeHost({
      '/hello': 'world',
      '/sub/directory/file2': '',
      '/sub/file1': '',
    });
    const tree = new FileSystemTree(host);

    expect(tree.files).toEqual(['/hello', '/sub/directory/file2', '/sub/file1'].map(normalize));
  });
});
