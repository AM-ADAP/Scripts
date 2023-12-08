// \n(\s*\n)+
// Regex to get whitespaces

const fs = require('fs');
const json = require('./export.json');
// const json = require('./oneExport.json');

// console.log(json[0].fields);

// Get Form Titles
const formTitles = json.map((form)=> {
    return `${form.settings.form_title}`;
});

// Get Form Ids
const formIds = json.map((form)=> {
    return `${form.id}`;
});

// Get Lead Name
const formLeads = json.map((form)=> {
    for(let value in form.fields) {
        if(form.fields[value]['label'] == 'Lead') {
            return form.fields[value]['default_value'];
        }
    }
});
// Combine Data
const formData = [];

for(let i = 0; i < formTitles.length; i++){ 
    formData.push(`${formTitles[i]},${formIds[i]},${formLeads[i]}\n`)
}

// Format and Write to File
const formatFile = formData.join('\n');
fs.writeFileSync('./parsed.csv', formatFile);
console.log('Task Complete!');