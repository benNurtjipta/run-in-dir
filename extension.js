// File: extension.js
const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const runDevCommand = vscode.commands.registerCommand(
    "run-in-dir.runDev",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active file to run from.");
        return;
      }

      const fileUri = editor.document.uri;
      const fileDir = vscode.Uri.joinPath(fileUri, "..").fsPath;

      const terminal = vscode.window.createTerminal({ cwd: fileDir });
      terminal.show();
      terminal.sendText("npm run dev");
    }
  );

  context.subscriptions.push(runDevCommand);

  const button = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    1000
  );
  button.text = "$(play) Dev";
  button.tooltip = "Run npm run dev in current file directory";
  button.command = "run-in-dir.runDev";
  button.color = "#03EDF9";
  button.show();
  context.subscriptions.push(button);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
