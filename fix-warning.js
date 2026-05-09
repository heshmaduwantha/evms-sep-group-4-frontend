const fs = require('fs');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + filePath);
    }
}

replaceInFile('src/app/pages/applications/my-applications.component.ts', [
    ["return 'warning';", "return 'warn';"]
]);
replaceInFile('src/app/pages/applications/application-management.component.ts', [
    ["return 'warning';", "return 'warn';"]
]);
replaceInFile('src/app/pages/home/home.component.ts', [
    ["'warning' |", "'warn' |"],
    ["return 'warning';", "return 'warn';"]
]);
replaceInFile('src/app/pages/settings/settings.component.ts', [
    ["'warning' |", "'warn' |"],
    ["return 'warning';", "return 'warn';"]
]);

replaceInFile('src/app/app.component.ts', [
    ["imports: [RouterOutlet, SidebarComponent],", "imports: [RouterOutlet],"],
    ["import { SidebarComponent } from \"./layout/sidebar/sidebar.component\";\n", ""]
]);

