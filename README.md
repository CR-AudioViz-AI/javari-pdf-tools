# CR PDF Tools

**"Your Story. Our Design."**

Professional PDF manipulation suite with 60+ tools, powered by StirlingPDF.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up -d
```

Then open http://localhost:8080

### Option 2: Railway One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/stirling-pdf)

### Option 3: Vercel Edge Proxy

Deploy the Next.js wrapper to Vercel, which proxies to your StirlingPDF instance.

## 📦 Features (60+ Tools)

### Page Operations
- Merge PDFs
- Split PDFs
- Rotate pages
- Remove pages
- Extract pages
- Rearrange pages

### Conversion
- PDF to Image (PNG, JPG)
- Image to PDF
- PDF to Word
- Word to PDF
- PDF to PowerPoint
- PDF to Excel
- HTML to PDF
- Markdown to PDF

### Security
- Add password
- Remove password
- Add watermark
- Redact text
- Sanitize metadata

### Editing
- Add page numbers
- Add image
- Compress PDF
- Flatten PDF
- Repair PDF
- OCR (text recognition)

### View & Compare
- Compare PDFs
- PDF info/metadata
- View PDF

## 🔧 Configuration

Environment variables in `docker-compose.yml`:

| Variable | Description | Default |
|----------|-------------|---------|
| `UI_APPNAME` | Application name | CR PDF Tools |
| `SYSTEM_DEFAULTLOCALE` | Default language | en_US |
| `SECURITY_ENABLELOGIN` | Require login | false |

## 📄 API Documentation

StirlingPDF provides REST APIs for all tools:

```bash
# Example: Merge PDFs
curl -X POST "http://localhost:8080/api/v1/general/merge-pdfs" \
  -H "Content-Type: multipart/form-data" \
  -F "fileInput=@file1.pdf" \
  -F "fileInput=@file2.pdf"
```

Full API docs: http://localhost:8080/swagger-ui/index.html

## 🔗 Integration with CR AudioViz

CR PDF Tools is designed to integrate with the CR AudioViz AI ecosystem:

- **Credits System**: Uses universal CR credits
- **Javari AI**: AI assistant available for help
- **Cross-selling**: Links to other CR tools
- **Analytics**: Usage tracked in central dashboard

## 📄 License

- StirlingPDF: AGPL-3.0
- CR AudioViz wrapper: Proprietary

---

**Built with ❤️ by CR AudioViz AI, LLC**
*"Everyone connects. Everyone wins."*
