# 🧪 Testing Guide

## Quick Test with Sample Credentials

### Option 1: Test with Real MySQL Database

If you have MySQL running locally:

```
Host: localhost
Port: 3306
Database: your_database_name
User: your_username
Password: your_password
```

### Option 2: Test Error Handling

Try invalid credentials to see the error flow:

```
Host: localhost
Port: 3306
Database: nonexistent_db
User: wrong_user
Password: wrong_password
```

You'll see beautiful error animations and can retry!

### Option 3: Test Without MySQL

If you don't have MySQL installed, you can still see the UI:

1. Click "Test Connection" with any values
2. You'll see an error message about connection failing
3. This shows the error flow animations

## 🎬 What to Watch For

### Genie Animation
- Click "Test Connection"
- Modal scales up from bottom center
- Light stream effect appears briefly

### Timeline Animation
Watch steps appear one by one:
1. Step slides in from left
2. Blue pulse on active step
3. Loader spinner rotates
4. Green checkmark pops in on success
5. Connector line grows to next step
6. Process repeats for each step

### Success Flow
- Large green circle with checkmark
- "Connection Successful!" message
- Click "Go to Workspace"
- See workspace with connection details

### Error Flow
- Failed step shows red X with shake
- Error message displays in red box
- Large red circle with error icon
- Click "Try Again" to retry
- Or "Cancel" to close

## 🎨 Animations to Observe

1. **Modal Entrance**: Genie-from-bottle effect
2. **Step Reveal**: Sequential slide-in (400ms each)
3. **Active Step**: Pulsing blue glow
4. **Success**: Bouncy checkmark pop
5. **Error**: Horizontal shake
6. **Result**: Fade up from bottom
7. **Buttons**: Hover lift effect

## 📸 Key Moments to Capture

1. Database selector with MySQL highlighted
2. Connection form with green checkmarks
3. Modal appearing with genie effect
4. Timeline with 3-4 steps completed
5. Success screen with workspace button
6. Error screen with retry button
7. Workspace after successful connection

## 🐞 Common Issues & Solutions

### Backend Not Running
**Symptom**: "Failed to connect to backend service"
**Solution**: 
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### MySQL Not Accessible
**Symptom**: "Can't connect" or "Access denied"
**Solution**: 
- Check MySQL is running: `mysql.server status`
- Verify credentials are correct
- Check firewall settings

### Port Already in Use
**Symptom**: "Address already in use"
**Solution**: 
- Kill process on port 8000: `lsof -ti:8000 | xargs kill -9`
- Or use different port in backend

## 🎯 Test Scenarios

### ✅ Happy Path
1. Select MySQL
2. Enter valid credentials
3. Click "Test Connection"
4. Observe timeline animation
5. See success message
6. Click "Go to Workspace"
7. View workspace page

### ❌ Error Path
1. Select MySQL
2. Enter invalid credentials
3. Click "Test Connection"
4. Observe timeline animation
5. See error on specific step
6. Read error message
7. Click "Try Again"
8. Correct credentials
9. Test again

### 🔄 Validation Path
1. Select MySQL
2. Start typing in host field
3. See validation in real-time
4. Enter invalid port (e.g., "99999")
5. See red border and error message
6. Correct to valid port
7. See green checkmark appear
8. Repeat for all fields

## 📝 Notes

- Connection test is REAL - it actually tries to connect to your database
- All 6 steps execute actual validation and connection logic
- Error messages are specific and helpful
- No data is stored - only used for connection test
- You can test as many times as you want

## 🎉 Success Criteria

You'll know it's working when you see:
- ✅ Smooth modal appearance
- ✅ Steps appearing one at a time
- ✅ Active step pulsing
- ✅ Green checkmarks popping in
- ✅ Timeline connectors growing
- ✅ Result screen fading up
- ✅ Navigation to workspace working

Enjoy the beautiful animations! 🎨✨
