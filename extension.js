const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

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

      function findNearestPackageJson(startPath) {
        let dir = startPath;
        while (dir !== path.dirname(dir)) {
          const pkgPath = path.join(dir, "package.json");
          if (fs.existsSync(pkgPath)) {
            return dir;
          }
          dir = path.dirname(dir);
        }
        return null;
      }

      const filePath = fileUri.fsPath;
      const projectRoot = findNearestPackageJson(path.dirname(filePath));

      if (!projectRoot) {
        vscode.window.showErrorMessage(
          "Could not find a package.json in any parent folder."
        );
        return;
      }

      const config = vscode.workspace.getConfiguration("run-in-dir");
      const defaultCommand = config.get("defaultCommand") || "npm run dev";

      let terminal = vscode.window.terminals.find(
        (t) => t.name === "Run In Dir"
      );

      if (!terminal) {
        terminal = vscode.window.createTerminal({
          name: "Run In Dir",
        });
      }

      terminal.show();
      terminal.sendText(`cd "${projectRoot}" && ${defaultCommand}`);
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
