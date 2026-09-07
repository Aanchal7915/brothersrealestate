const fs=require('fs');
const {parse}=require('@babel/parser');
const content = fs.readFileSync('src/pages/Home.jsx', 'utf8');
const lines = content.split('\n');
function check(start, end) {
  const text = 'const React = require("react"); const X = () => ( <>\n' + lines.slice(start, end).join('\n') + '\n</> );';
  try {
    parse(text, {sourceType:'module', plugins:['jsx']});
    return 'OK';
  } catch(e) {
    return e.message;
  }
}
console.log('Hero:', check(1515, 1675));
console.log('Featured:', check(1676, 1729));
console.log('Benefits:', check(1730, 1758));
console.log('Curated:', check(1759, 1799));
console.log('Rental:', check(1800, 1841));
console.log('Locations:', check(1842, 1883));
console.log('Projects:', check(1884, 1978));
console.log('Partners:', check(1979, 1982));
console.log('Testimonials:', check(1983, 2028));
console.log('CTA:', check(2029, 2075));
console.log('Contact:', check(2076, 2082));
