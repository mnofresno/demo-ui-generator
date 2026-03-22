# Fake Gmail Demo

A generic, standalone fake Gmail interface for demo purposes. Completely decoupled from any specific project.

## Features

- **Gmail-like interface** with sidebar, search, and email list
- **Completely generic** - no references to specific projects
- **Sample emails** with different types (security codes, project updates, newsletters)
- **Interactive features**:
  - Click emails to view full content
  - Star/unstar emails
  - Search functionality
  - Load sample data
  - Responsive design
- **No external dependencies** - single HTML file

## Usage

1. **Start the server**:
   ```bash
   cd /Users/mariano.fresno/fake-gmail-demo
   python3 -m http.server 8000
   ```

2. **Open in browser**:
   ```
   http://localhost:8000/
   ```

3. **Use the interface**:
   - Click "Load Sample Data" to populate emails
   - Click any email to view its content
   - Use search to filter emails
   - Star important emails

## Customization

### Adding Your Own Emails

Edit the `sampleEmails` array in the JavaScript section of `index.html`:

```javascript
const sampleEmails = [
    {
        id: 1,
        from: "Sender Name <sender@example.com>",
        to: "recipient@example.com",
        subject: "Email Subject",
        date: "Today, 10:00 AM",
        read: false,
        starred: false,
        labels: ["Category"],
        body: `
            <h2>Email Content</h2>
            <p>Your email content here...</p>
        `
    },
    // Add more emails...
];
```

### Styling

All styles are contained in the `<style>` section of the HTML file. You can modify:
- Colors in the CSS variables
- Layout dimensions
- Responsive breakpoints

## Project Structure

```
fake-gmail-demo/
├── index.html          # Main HTML file with all code
└── README.md          # This file
```

## Use Cases

- **Demo presentations** - Show email flows without real email service
- **Testing** - Test email templates and designs
- **Development** - Mock email interface for development
- **Education** - Teach email client UI/UX concepts

## Notes

- This is a **frontend-only** demo
- No backend or real email functionality
- All data is stored in memory (refreshing the page resets data)
- Completely standalone - can be used with any project

## License

Free to use for any purpose.