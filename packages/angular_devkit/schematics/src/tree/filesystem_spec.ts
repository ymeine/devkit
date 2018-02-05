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
  it('can visit', () => {
    const files = {
      '/sub1/file1': '/sub1/file1',
      '/sub1/file2': '/sub1/file2',
      '/sub1/file3': '/sub1/file3',
      '/sub1/sub2/file4': '/sub1/sub2/file4',
      '/sub1/sub2/file5': '/sub1/sub2/file5',
      '/sub3/file6': '',
    };
    const host = new InMemoryFileSystemTreeHost(files);
    const tree = new FileSystemTree(host);

    let allPaths: string[] = [];
    tree.getDir(normalize('/sub1'))
      .visit((p, entry) => {
        expect(entry).not.toBeNull();
        expect(entry !.content.toString()).toEqual(p);
        allPaths.push(p);
      });

    expect(allPaths).toEqual([
      '/sub1/file1',
      '/sub1/file2',
      '/sub1/file3',
      '/sub1/sub2/file4',
      '/sub1/sub2/file5',
    ]);

    allPaths = [];
    tree.getDir(normalize('/'))
      .visit((p, _entry) => {
        allPaths.push(p);
      });

    expect(allPaths).toEqual(Object.keys(files));
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
