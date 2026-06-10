const fs = require('fs');
const path = require('path');

// Helper to recursively copy directories
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper to find all files recursively with a specific extension
function getFilesRecursively(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      getFilesRecursively(filePath, ext, fileList);
    } else if (path.extname(file.name) === ext) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function build() {
  console.log('Starting build process...');

  const configPath = path.join(__dirname, 'config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Error: config.json not found!');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const srcDir = path.join(__dirname, 'src');
  const pagesDir = path.join(srcDir, 'pages');
  const componentsDir = path.join(srcDir, 'components');
  const distDir = path.join(__dirname, 'dist');

  // 1. Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir);

  // 2. Find all HTML templates in src/pages
  const templates = getFilesRecursively(pagesDir, '.html');
  console.log(`Found ${templates.length} page templates to compile.`);

  for (const templatePath of templates) {
    const relativePath = path.relative(pagesDir, templatePath);
    const destPath = path.join(distDir, relativePath);
    const destDir = path.dirname(destPath);

    // Compute root path offset
    const depth = relativePath.split(path.sep).length - 1;
    const rootPath = depth === 0 ? '.' : Array(depth).fill('..').join('/');

    console.log(`Compiling: ${relativePath} (depth: ${depth}, rootPath: ${rootPath})`);

    // Ensure output subdirectory exists
    fs.mkdirSync(destDir, { recursive: true });

    // Read page content
    let content = fs.readFileSync(templatePath, 'utf8');

    // Process includes: @@include('filename.html')
    const includeRegex = /@@include\(['"]([^'"]+)['"]\)/g;
    let match;
    let loopCount = 0;
    const maxLoops = 20; // Prevent infinite inclusion loops

    while ((match = includeRegex.exec(content)) !== null && loopCount < maxLoops) {
      const includeFileName = match[1];
      const includePath = path.join(componentsDir, includeFileName);

      if (fs.existsSync(includePath)) {
        const includeContent = fs.readFileSync(includePath, 'utf8');
        content = content.replace(match[0], includeContent);
      } else {
        console.warn(`Warning: Include file not found: ${includeFileName}`);
        content = content.replace(match[0], `<!-- Include ${includeFileName} not found -->`);
      }
      includeRegex.lastIndex = 0; // Reset regex state to check for nested includes
      loopCount++;
    }

    // Dynamic service areas grid replacement
    if (content.includes('<!-- SERVICE_AREAS_GRID -->') && config.service_areas) {
      let gridHtml = '<div class="services-grid reveal" style="grid-template-columns: repeat(4, 1fr); gap: 12px;">\n';
      config.service_areas.forEach(area => {
        gridHtml += `      <div class="service-card" style="padding:20px;text-align:center;">\n`;
        gridHtml += `        <h4 style="margin:0;font-size:1rem;">${area.city}</h4><p style="margin:4px 0 0;font-size:13px;">${area.zip}</p>\n`;
        gridHtml += `      </div>\n`;
      });
      gridHtml += '    </div>';
      content = content.replace('<!-- SERVICE_AREAS_GRID -->', gridHtml);
    }

    // Replace standard placeholders
    const placeholders = {
      '@@business_name': config.business_name,
      '@@phone_number': config.phone_number,
      '@@phone_raw': config.phone_raw,
      '@@email': config.email,
      '@@address': config.address,
      '@@city': config.city,
      '@@state': config.state,
      '@@zip': config.zip,
      '@@year_founded': config.year_founded,
      '@@years_experience': config.years_experience,
      '@@tuneup_price': config.tuneup_price,
      '@@root_path': rootPath
    };

    for (const [placeholder, value] of Object.entries(placeholders)) {
      content = content.split(placeholder).join(value);
    }

    fs.writeFileSync(destPath, content, 'utf8');
  }

  // 3. Copy assets and compile CSS
  const srcAssets = path.join(srcDir, 'assets');
  const distAssets = path.join(distDir, 'assets');

  if (fs.existsSync(srcAssets)) {
    copyDirSync(srcAssets, distAssets);
    console.log('Assets copied successfully.');

    // Inject theme colors into main stylesheet
    const distCssFile = path.join(distAssets, 'css', 'styles.css');
    if (fs.existsSync(distCssFile)) {
      let cssContent = fs.readFileSync(distCssFile, 'utf8');
      
      const cssReplacements = {
        '@@primary_color': config.primary_color,
        '@@primary_deep': config.primary_deep,
        '@@primary_soft': config.primary_soft,
        '@@cool_color': config.cool_color,
        '@@cool_deep': config.cool_deep
      };

      for (const [placeholder, value] of Object.entries(cssReplacements)) {
        cssContent = cssContent.split(placeholder).join(value);
      }

      fs.writeFileSync(distCssFile, cssContent, 'utf8');
      console.log('Theme colors injected into CSS.');
    }
  }

  console.log('Build completed successfully!');
}

build();
