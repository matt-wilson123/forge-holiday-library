# How to Get the Actual Error Message

The error you're seeing is just the client-side stack trace. We need the **server's error response**.

## Step-by-Step Instructions:

1. **Open Developer Tools**
   - Press `F12` or right-click → Inspect

2. **Go to Network Tab**
   - Click "Network" at the top

3. **Clear the log** (optional but helpful)
   - Click the 🚫 icon or press `Ctrl+L` / `Cmd+L`

4. **Try adding a book**
   - Click "+ Add"
   - Fill in book details
   - Click "Add Book"

5. **Find the failed request**
   - Look for `/api/books` in the list
   - It should be **red** (failed)
   - Status should be `500`

6. **Click on `/api/books`**

7. **Click the "Response" tab** (or "Preview" tab)
   - This shows the actual error message from the server
   - Look for JSON like:
     ```json
     {
       "error": "Missing Supabase URL",
       "details": "...",
       "hint": "..."
     }
     ```

8. **Copy the error message** and share it

## Alternative: Check Vercel Logs

1. Go to **Vercel Dashboard**
2. Your Project → **Logs** tab
3. Try adding a book again
4. Look for error messages in the logs
5. You'll see the full error with stack trace

## Quick Test in Console

You can also test directly in the browser console:

```javascript
fetch('/api/books', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    title: 'Test Book',
    author: 'Test Author',
    domains: ['Other']
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

This will show you the exact error message in the console.
