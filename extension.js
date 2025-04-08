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
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);

      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
      }

      const rootPath = workspaceFolder.uri.fsPath;

      const config = vscode.workspace.getConfiguration("run-in-dir");
      const defaultCommand = config.get("defaultCommand") || "npm run dev";

      const terminal = vscode.window.createTerminal({ cwd: rootPath });
      terminal.show();
      terminal.sendText(defaultCommand);
    }
  );

  context.subscriptions.push(runDevCommand);

  const button = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    -1000
  );

  const config = vscode.workspace.getConfiguration("run-in-dir");
  const defaultCommand = config.get("defaultCommand") || "npm run dev";

  if (defaultCommand === "npm start") {
    button.text = "$(play) Start";
  } else {
    button.text = "$(play) Dev";
  }

  button.tooltip = "Run configured npm script in project root";
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
