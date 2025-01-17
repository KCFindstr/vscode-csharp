/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';

import { should, expect } from 'chai';
import { activateCSharpExtension, isRazorWorkspace, isSlnWithGenerator } from './integrationHelpers';
import testAssetWorkspace from './testAssets/activeTestAssetWorkspace';

export type Test = 'a' | 'b' | ['c', any];

suite(`Hover Provider: ${testAssetWorkspace.description}`, function () {
    suiteSetup(async function () {
        should();

        if (isRazorWorkspace(vscode.workspace) || isSlnWithGenerator(vscode.workspace)) {
            this.skip();
        }

        const activation = await activateCSharpExtension();
        await testAssetWorkspace.restoreAndWait(activation);
    });

    suiteTeardown(async () => {
        await testAssetWorkspace.cleanupWorkspace();
    });

    test('Hover returns structured documentation with proper newlines', async function () {
        const fileName = 'hover.cs';
        const dir = testAssetWorkspace.projects[0].projectDirectoryPath;
        const loc = path.join(dir, fileName);
        const fileUri = vscode.Uri.file(loc);

        await vscode.commands.executeCommand('vscode.open', fileUri);
        const c = <vscode.Hover[]>(
            await vscode.commands.executeCommand('vscode.executeHoverProvider', fileUri, new vscode.Position(10, 29))
        );
        const answer =
            '```csharp\nbool testissue.Compare(int gameObject, string tagName)\n```\n\nChecks if object is tagged with the tag\\.\n\nReturns:\n\n  Returns true if object is tagged with tag\\.';

        expect((<{ language: string; value: string }>c[0].contents[0]).value).to.equal(answer);
    });
});
