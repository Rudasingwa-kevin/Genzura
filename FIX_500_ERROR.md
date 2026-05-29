# Fix 500 Error - Document Upload

## The Problem

Getting "500 Internal Server Error" when loading documents in Settings.

## The Solution

The backend server needs to be restarted to load the new controller.

### Steps:

1. **Stop the backend server:**
   - Go to your terminal running `npm run dev` in `genzura-api`
   - Press `Ctrl+C` to stop it

2. **Restart the backend:**
   ```bash
   cd genzura-api
   npm run dev
   ```

3. **Refresh the frontend:**
   - Go to your browser
   - Refresh the page (F5)
   - Navigate to Settings → Documents & Credentials

## Why This Happened

We added a new controller (`AttorneyDocumentController`) and routes after the server was already running. Node.js doesn't hot-reload new files, so we need to restart the server.

## Expected Behavior After Restart

✅ Documents tab loads without errors  
✅ "No documents uploaded yet" message appears  
✅ "Upload Document" button works  
✅ Can upload files successfully  

## Still Getting Errors?

If you still see errors after restarting:

1. **Check the backend console** for specific error messages
2. **Verify the user is an attorney** - Documents are attorney-only
3. **Check database connection** - Make sure PostgreSQL is running

## Quick Test

After restarting, try this:
1. Login as an attorney
2. Go to Settings → Documents & Credentials  
3. Should see empty state (not an error)
4. Click "Upload Document"
5. Select a PDF file
6. Fill in title and type
7. Upload

If this works, the issue is resolved! 🎉
