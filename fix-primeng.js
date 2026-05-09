const fs = require('fs');
const path = require('path');

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

// 1. Auth Module
replaceInFile('src/app/auth/auth.module.ts', [
    ["import { MessagesModule } from 'primeng/messages';\n", ""],
    ["MessagesModule,\n", ""]
]);

// 2. Auth HTML
const pMessageHtml = `<p-message *ngIf="error" severity="error" [text]="error" styleClass="mt-3"></p-message>`;
replaceInFile('src/app/auth/login/login.component.html', [
    [`<p-messages *ngIf="error" [value]="[{severity:'error', summary:'Error', detail:error}]"\n                    [closable]="false" styleClass="mt-3"></p-messages>`, pMessageHtml]
]);
replaceInFile('src/app/auth/register/register.component.html', [
    [`<p-messages *ngIf="error" [value]="[{severity:'error', summary:'Error', detail:error}]"\n                    [closable]="false" styleClass="mt-3"></p-messages>`, pMessageHtml]
]);

// 3. TS Files
const tsReplacements = [
    ["import { DropdownModule } from 'primeng/dropdown';", "import { SelectModule } from 'primeng/select';"],
    ["DropdownModule", "SelectModule"],
    ["import { CalendarModule } from 'primeng/calendar';", "import { DatePickerModule } from 'primeng/datepicker';"],
    ["CalendarModule", "DatePickerModule"],
    ["import { InputTextareaModule } from 'primeng/inputtextarea';", "import { TextareaModule } from 'primeng/textarea';"],
    ["InputTextareaModule", "TextareaModule"]
];
replaceInFile('src/app/pages/applications/application-management.component.ts', tsReplacements);
replaceInFile('src/app/pages/applications/my-applications.component.ts', tsReplacements);
replaceInFile('src/app/pages/applications/application-review-modal.component.ts', tsReplacements);
replaceInFile('src/app/pages/reports/reports.component.ts', tsReplacements);
replaceInFile('src/app/pages/roles/role-management.component.ts', tsReplacements);

// 4. HTML Files
const htmlReplacements = [
    ["<p-dropdown", "<p-select"],
    ["</p-dropdown>", "</p-select>"],
    ["<p-calendar", "<p-datepicker"],
    ["</p-calendar>", "</p-datepicker>"]
];
replaceInFile('src/app/pages/applications/my-applications.component.html', htmlReplacements);
replaceInFile('src/app/pages/reports/reports.component.html', htmlReplacements);

// 5. CSS Files
replaceInFile('src/app/pages/reports/reports.component.css', [
    [".p-dropdown", ".p-select"],
    [".p-calendar", ".p-datepicker"]
]);

// 6. Global Styles
replaceInFile('src/styles.css', [
    [`@import "primeng/resources/themes/lara-light-blue/theme.css";\n`, ""],
    [`@import "primeng/resources/primeng.min.css";\n`, ""]
]);

// 7. angular.json
replaceInFile('angular.json', [
    [`"node_modules/primeng/resources/themes/lara-light-blue/theme.css",`, ""],
    [`"node_modules/primeng/resources/primeng.min.css",`, ""]
]);

