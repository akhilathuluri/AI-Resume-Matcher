# Chat History Migration Instructions

## Steps to Enable Persistent Chat History

### 1. Run the Database Migration

You need to execute the SQL migration manually in your Supabase dashboard:

1. **Go to your Supabase Dashboard** → SQL Editor
2. **Copy and paste** the entire content from: `supabase/migrations/20250627000000_add_chat_history.sql`
3. **Click "Run"** to execute the migration

### 2. What this migration creates:

- **`chat_messages` table** - Stores all chat history
- **Row Level Security (RLS)** - Users can only access their own chat messages
- **Indexes** - For better performance
- **Policies** - Secure access control

### 3. Features Added:

✅ **Persistent Chat Memory** - Chat history survives:
   - Page refreshes
   - Logging out and back in
   - Browser restarts
   - Device switches

✅ **Auto-load on Login** - Previous conversations appear immediately

✅ **Clear History Button** - Users can delete all chat history

✅ **Loading States** - Shows when loading chat history

### 4. How it works:

1. **Every message** (user + assistant) is automatically saved to database
2. **On page load** - All previous messages are loaded from database
3. **Real-time sync** - Messages are saved as they're created
4. **User-specific** - Each user only sees their own chat history

### 5. Test the functionality:

1. Send a few messages in the chatbot
2. Refresh the page → Messages should still be there
3. Sign out and sign back in → Messages should still be there
4. Click "Clear History" → All messages should be deleted

The chat history will now persist across sessions and provide a seamless experience for your users!
