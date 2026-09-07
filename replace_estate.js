const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Case-sensitive replacements
  if (content.includes('Brothers Estate')) {
    content = content.replace(/Brothers Estate/g, 'Brothers RealEstate');
    changed = true;
  }
  if (content.includes('brothersestate')) {
    content = content.replace(/brothersestate/g, 'brothersrealestate');
    changed = true;
  }
  if (content.includes('BrothersEstate')) {
    content = content.replace(/BrothersEstate/g, 'BrothersRealEstate');
    changed = true;
  }

  // Also replace any old phone numbers in privacy and terms with +91-123456 7899
  // We'll just replace specific strings if they exist.
  // The user said: "privacy policy and terms&condition mei bi no.and email shi kr dena"
  // Let's replace any instance of +91 99909 53095 with +91-123456 7899 if it exists.
  if (content.includes('+91 99909 53095')) {
    content = content.replace(/\+91 99909 53095/g, '+91-123456 7899');
    changed = true;
  }
  if (content.includes('+919990953095')) {
    content = content.replace(/\+919990953095/g, '+911234567899');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
        walk(fullPath);
      }
    } else {
      if (['.js', '.jsx', '.ts', '.tsx'].some(ext => fullPath.endsWith(ext))) {
        replaceInFile(fullPath);
      }
    }
  }
}

walk(path.join(__dirname, 'hi-tech-frontend', 'src'));
walk(path.join(__dirname, 'charvik-backend'));
