# Creating Users Manually

Since public signup is disabled, administrators must create users manually in Firebase Firestore.

## Method 1: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Go to the `users` collection
5. Click **Add document**
6. Create a document with these fields:

### Required Fields:

```
Document ID: (auto-generated)

Fields:
- name: (string) "John Doe"
- email: (string) "john@example.com"
- password: (string) [bcrypt hashed password - see below]
- role: (string) "customer" or "administrator"
- createdAt: (string) "2025-11-08T10:00:00.000Z"
- updatedAt: (string) "2025-11-08T10:00:00.000Z"
```

## Method 2: Generate Hashed Password

### Using Node.js:

```bash
node -e "const bcrypt = require('bcryptjs'); const hash = bcrypt.hashSync('YOUR_PASSWORD_HERE', 10); console.log(hash);"
```

### Using this script:

```bash
cd /Users/ardiansyahiqbal/dev-app/myx/procestoppers/dutch-law-scraper-ui
node scripts/hash-password.js YOUR_PASSWORD_HERE
```

## Example User Document:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH",
  "role": "customer",
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

## User Roles:

- **customer**: Regular user with access to `/dashboard`
- **administrator**: Admin user with access to `/admin` and token refresh capabilities

## Notes:

- Password must be hashed using bcrypt with 10 salt rounds
- Email must be unique
- Role must be either "customer" or "administrator"
- The document ID will be used as the user's ID in the system
