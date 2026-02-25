# Risk Assessment Form Generator

A professional web application for creating and downloading Risk Assessment & Data Handling Agreement forms for Abbey Healthcare care homes.

## Features

- **Secure Authentication**: Login system to protect access to the application
- **Template Management**: Save and reuse templates for different care homes
- **Professional Form Layout**: Pre-populated with comprehensive risk assessment content for IT digitisation and secure records transfer
- **Professional Disclaimer**: Includes formal disclaimer section with dual signature requirements
- **Edit Mode**: Enable editing to customize any section, heading, or content
- **Add Custom Sections**: Add new sections to the form as needed
- **Delete Sections**: Remove sections that aren't required
- **PDF Download**: Generate and download a professional PDF version of the form
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with professional styling

## Authentication

The application is protected with a login system. Users must authenticate before accessing the form generator.

**Default Credentials:**
- Username: `Jessica`
- Password: `a15Dz6fl!`

## How to Use

### 1. Login
- Navigate to the application URL
- Enter your username and password
- Click "Login" to access the form generator

### 2. Edit the Form
- Click **"Enable Edit Mode"** to make the form editable
- Click on any text to edit it (titles, headings, content, table cells)
- Edit the location, contractor name, dates, and any other details
- The editable areas will be highlighted in yellow when edit mode is active

### 3. Add Custom Sections
- While in edit mode, click **"Add Custom Section"**
- A new section will be added at the bottom of the form
- Edit the section title and content as needed
- You can add multiple custom sections

### 4. Delete Sections
- While in edit mode, each section will have a **"Delete Section"** button
- Click the button to remove sections you don't need
- You'll be asked to confirm before deletion

### 5. Download PDF
- Click **"Download PDF"** to generate a PDF version
- The PDF will automatically download with the current date in the filename
- Format: `Risk_Assessment_Form_YYYY-MM-DD.pdf`

### 6. Disable Edit Mode
- Click **"Disable Edit Mode"** when you're done editing
- This locks the content and removes the delete buttons

## Customization Tips

- **Location Details**: Update the care home name and address in the Location section
- **Contractor Name**: Change "Kevin Quirk" to the appropriate contractor name
- **Risk Table**: Edit the risk assessment table to add/modify hazards and controls
- **Signatures**: Update the signature blocks with appropriate names and titles
- **Section Numbering**: When adding custom sections, update the numbering manually

## Technical Details

- **No Installation Required**: Pure HTML, CSS, and JavaScript
- **Libraries Used**:
  - jsPDF: For PDF generation
  - html2canvas: For converting HTML to images for PDF
- **Browser Compatibility**: Works in all modern browsers (Chrome, Firefox, Edge, Safari)

## File Structure

```
risk_assessment_form/
├── index.html          # Main application file
├── login.html          # Login page
├── styles.css          # Main application styling
├── login.css           # Login page styling
├── script.js           # Main application functionality
├── login.js            # Login authentication
├── vercel.json         # Vercel deployment configuration
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## Deployment

### Deploy to GitHub

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Risk Assessment Form Generator"
   ```

2. **Create GitHub Repository**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it `risk-assessment-form` or your preferred name
   - Do NOT initialize with README (you already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard** (Recommended):
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it as a static site
   - Click "Deploy"
   - Your app will be live at `https://your-project-name.vercel.app`

3. **Deploy via CLI** (Alternative):
   ```bash
   vercel
   ```
   - Follow the prompts
   - Link to your GitHub repository
   - Deploy

### Post-Deployment

- The application will automatically redirect to the login page
- Users must authenticate with the credentials before accessing the form generator
- Templates are stored in browser localStorage (per-device)

## Security Notes

- **Password Hashing**: Passwords are hashed using SHA-256 before comparison
- **Client-Side Authentication**: Suitable for internal use with trusted users
- **Hash Storage**: Only password hashes are stored in the code, not plain text passwords
- **Session Management**: Uses browser sessionStorage for authentication state
- **Templates**: Stored locally in browser localStorage (per-device)

### Security Level
This implementation provides **moderate security** through password hashing:
- ✅ Passwords are not visible in plain text in the source code
- ✅ SHA-256 hashing makes casual inspection more difficult
- ⚠️ Still client-side only - determined users with technical knowledge could bypass
- ⚠️ For highly sensitive data, consider server-side authentication

### Changing Credentials
To change the password:
1. Generate a new SHA-256 hash of your desired password
2. Update `VALID_PASSWORD_HASH` in `login.js`
3. Update `VALID_USERNAME` if needed
4. Commit and push changes

## Support

For issues or questions, contact Kevin Quirk.

---

**Abbey Healthcare** - IT Digitisation & Secure Records Transfer
