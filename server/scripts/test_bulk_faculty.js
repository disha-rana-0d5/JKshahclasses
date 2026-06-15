const fs = require('fs');
const path = require('path');
const http = require('http');

const csvContent = `_id,name,designation,expertise,experience,rating,totalStudents,coursesTaught,image,specialization,qualifications,tagline,achievements
696e26ecce00ffb78e6bf9de,Dr. Rajesh Kumar Updated,Senior Faculty,Finance,48,5.0,10000+,"CA; PHD; M.com",/uploads/placeholder.png,Accounts Expert,"CA; PHD; M.com",Updated tagline,"450+ AIR; 12 Books"
,New Faculty Member,Assistant Professor,Law,5,4.8,2000+,"LLB; LLM",/uploads/placeholder.png,Corporate Law,"LLB; LLH",Justice for all,"Top ranker in State"
`;

const filePath = path.join(__dirname, 'test_faculty_bulk.csv');
fs.writeFileSync(filePath, csvContent);

console.log('Created test CSV file.');

// Since I cannot easily make a multipart/form-data request with built-in http, 
// I will use a simplified node script that calls the controller directly if possible,
// or I will just use CURL in the run_command.

console.log('Verification script created. Use curl to test the endpoint.');
