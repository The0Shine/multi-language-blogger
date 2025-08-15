# Role-Based Routing System

## 📋 **Overview**

Hệ thống routing dựa trên role để phân quyền truy cập giữa user và admin.

## 🏗️ **Cấu trúc thư mục**

```
fontend/src/app/
├── admin/                          # Admin-only components
│   ├── layout/                     # AdminLayoutComponent
│   ├── home/                       # AdminHomeComponent  
│   └── modules/
│       ├── admin/                  # Admin management components
│       └── auth/                   # Admin auth components
├── guards/
│   ├── auth.guard.ts              # Basic authentication
│   ├── role.guard.ts              # Role-based guards
│   └── redirect.guard.ts          # Auto-redirect by role
├── pages/                         # User pages
└── components/
    └── role-test/                 # Testing component
```

## 🔐 **Guards System**

### 1. **Role Guards**
```typescript
// Specific role guards
adminGuard: CanActivateFn           // Admin only
userGuard: CanActivateFn            // User only  
adminOrUserGuard: CanActivateFn     // Admin or User

// Custom role guard
roleGuard(['admin', 'user']): CanActivateFn
```

### 2. **Redirect Logic**
- **Not authenticated** → `/login`
- **Admin role** → `/admin/home`
- **User role** → `/`

## 🛣️ **Routes Configuration**

### **Public Routes** (No authentication required)
```
/                    - Home page
/login              - Login page
/register           - Register page
/forgot-password    - Forgot password
/reset-password     - Reset password
/post/:id           - Post detail
/role-test          - Role testing page
```

### **User Routes** (Require user role)
```
/write              - Create/edit posts
/write/:id          - Edit specific post
/my-story           - User's posts
```

### **Admin or User Routes**
```
/profile            - User profile (both can access)
```

### **Admin Routes** (Require admin role)
```
/admin/home              - Admin dashboard
/admin/user/list         - User management
/admin/role/list         - Role management
/admin/language/list     - Language management
/admin/category/list     - Category management
/admin/post/list         - Post management
```

## 🔧 **AuthService Methods**

```typescript
// Check authentication
isAuthenticated(): boolean

// Get user role
getUserRole(): string  // Returns: 'admin', 'user', or ''

// Get current user
getCurrentUser(): User | null
```

## 🎯 **Role Detection Logic**

```typescript
getUserRole(): string {
  const user = this.currentUserSubject.value;
  if (!user) return '';
  
  // Check role object first
  if (user.role?.name) {
    return user.role.name.toLowerCase();
  }
  
  // Fallback to roleid mapping
  switch (user.roleid) {
    case 1: return 'admin';
    case 2: return 'user';
    default: return 'user';
  }
}
```

## 🚀 **Login Flow**

### **User Login:**
1. Login successful → Check role
2. If `admin` → Redirect to `/admin/home`
3. If `user` → Redirect to `/`

### **Access Control:**
1. User tries to access route
2. Guard checks authentication
3. Guard checks role permission
4. Allow access or redirect appropriately

## 🧪 **Testing**

### **Role Test Component** (`/role-test`)
- Shows current user info
- Tests navigation to different routes
- Displays access control rules
- Allows testing role-based redirects

### **Test Scenarios:**
1. **Not logged in** → All protected routes redirect to login
2. **User role** → Can access user routes, blocked from admin
3. **Admin role** → Can access admin routes, redirected from user routes

## 📝 **Component Naming**

### **Admin Components** (Renamed for clarity)
- `AdminLayoutComponent` - Admin layout wrapper
- `AdminHomeComponent` - Admin dashboard
- `AdminUserListComponent` - User management
- `AdminPostListComponent` - Post management
- etc.

## ⚠️ **Important Notes**

1. **Role Priority:** Admin users are redirected to admin area by default
2. **Fallback:** Unknown roles default to 'user'
3. **Security:** All admin routes protected by `adminGuard`
4. **UX:** Clear separation between user and admin interfaces

## 🔄 **Auto-Redirect Routes**

```typescript
// Special redirect route
{ path: 'dashboard', canActivate: [redirectGuard], children: [] }
```

Use `/dashboard` to automatically redirect users to their appropriate home page based on role.

## 🎨 **UI Behavior**

- **Public/User routes:** Show main header
- **Auth routes:** No header
- **Admin routes:** No main header, use admin layout

This system ensures clear separation of concerns and proper access control based on user roles!
