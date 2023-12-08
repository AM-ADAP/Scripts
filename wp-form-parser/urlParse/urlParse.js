// \n(\s*\n)+
// Regex to get whitespaces

const fs = require('fs');
const json = require('./export.json');
// const json = require('./oneExport.json');

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

for(let i = 0; i < formLeads.length; i++){ 
    if(formLeads[i] === undefined) {
        formData.push(`https://americandreamautoprotect.com/\n`);
    }
    else{
        newString = formLeads[i].replace(/\s/g, '-');
        formData.push(`https://americandreamautoprotect.com/${newString}\n`);
    }
}

// Format and Write to File
const formatFile = formData.join('\n');
fs.writeFileSync('./parsed.csv', formatFile);
console.log('Task Complete!');