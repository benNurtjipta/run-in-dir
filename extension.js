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
      const useCustomCommand = config.get("useCustomCommand");
      const customCommand = config.get("customCommand");
      const defaultCommand = config.get("defaultCommand") || "npm run dev";

      const commandToRun =
        useCustomCommand && customCommand ? customCommand : defaultCommand;

      let terminal = vscode.window.terminals.find(
        (t) => t.name === "Run In Dir"
      );

      if (!terminal) {
        terminal = vscode.window.createTerminal({
          name: "Run In Dir",
        });
      }

      terminal.show();
      terminal.sendText(`cd "${projectRoot}" && ${commandToRun}`);
    }
  );

  context.subscriptions.push(runDevCommand);

  const config = vscode.workspace.getConfiguration("run-in-dir");
  const useCustomCommand = config.get("useCustomCommand");
  const customLabel = config.get("customLabel") || "Run";
  const defaultCommand = config.get("defaultCommand") || "npm run dev";
  const buttonColor = config.get("statusBarColor") || "#03EDF9";

  const button = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    -1000
  );

  // Set label based on configuration
  if (useCustomCommand) {
    button.text = `$(play) ${customLabel}`;
  } else {
    button.text =
      defaultCommand === "npm start" ? "$(play) Start" : "$(play) Dev";
  }

  button.tooltip = "Run configured shell command in project root";
  button.command = "run-in-dir.runDev";
  button.color = buttonColor;
  button.show();

  context.subscriptions.push(button);

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (
      e.affectsConfiguration("run-in-dir.defaultCommand") ||
      e.affectsConfiguration("run-in-dir.useCustomCommand") ||
      e.affectsConfiguration("run-in-dir.customLabel")
    ) {
      const updatedConfig = vscode.workspace.getConfiguration("run-in-dir");
      const useCustom = updatedConfig.get("useCustomCommand");
      const newCommand = updatedConfig.get("defaultCommand");
      const newLabel = updatedConfig.get("customLabel") || "Run";

      if (useCustom) {
        button.text = `$(play) ${newLabel}`;
      } else {
        button.text =
          newCommand === "npm start" ? "$(play) Start" : "$(play) Dev";
      }
    }

    if (e.affectsConfiguration("run-in-dir.statusBarColor")) {
      const updatedConfig = vscode.workspace.getConfiguration("run-in-dir");
      const newColor = updatedConfig.get("statusBarColor") || "#03EDF9";
      button.color = newColor;
    }
  });
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
