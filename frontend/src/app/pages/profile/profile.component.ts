import { Component, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, type User } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { LanguageService } from '../../services/language.service';
import { DeleteAccountModalComponent } from '../../components/delete-account-modal/delete-account-modal.component';

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface ProfileUpdateData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DeleteAccountModalComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;
  isSaving = false;

  // Profile form data
  profileData: ProfileUpdateData = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
  };

  // Password form data
  passwordData: PasswordChangeData = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  };

  // UI state
  isDeleting = false;
  showDeleteModal = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  passwordStrength = '';
  passwordMatch = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private toastService: ToastService,
    public languageService: LanguageService
  ) {}

  ngOnInit() {
    this.debugTokens();
    this.debugLocalStorageUser();
    this.loadUserProfile();
  }

  debugTokens() {
    console.log('=== Token Debug ===');
    console.log(
      'Access Token:',
      localStorage.getItem('token') ? 'exists' : 'not found'
    );
    console.log(
      'Refresh Token:',
      localStorage.getItem('refreshToken') ? 'exists' : 'not found'
    );
    console.log('User:', localStorage.getItem('user') ? 'exists' : 'not found');
  }

  debugLocalStorageUser() {
    console.log('=== LocalStorage User Debug ===');
    const userStr = localStorage.getItem('user');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('👤 Raw localStorage user:', userStr);
        console.log('👤 Parsed user object:', user);
        console.log('👤 User structure check:');
        console.log('  - userid:', user.userid);
        console.log('  - username:', user.username);
        console.log('  - email:', user.email);
        console.log('  - first_name:', user.first_name);
        console.log('  - last_name:', user.last_name);
        console.log('  - roleName:', user.roleName);

        // Check if required fields are missing
        const missingFields = [];
        if (!user.first_name) missingFields.push('first_name');
        if (!user.last_name) missingFields.push('last_name');
        if (!user.username) missingFields.push('username');

        if (missingFields.length > 0) {
          console.warn('⚠️ Missing required fields:', missingFields);
        } else {
          console.log('✅ All required fields present');
        }

        // Check field types
        console.log('👤 Field types:');
        console.log('  - first_name type:', typeof user.first_name);
        console.log('  - last_name type:', typeof user.last_name);
        console.log('  - email type:', typeof user.email);
      } catch (error) {
        console.error('❌ Error parsing localStorage user:', error);
      }
    } else {
      console.warn('⚠️ No user data in localStorage');
    }
  }

  loadUserProfile() {
    console.log('👤 ProfileComponent: Loading user profile...');
    this.isLoading = true;

    // Simply load fresh profile data from API every time
    this.authService.getProfile().subscribe({
      next: (user) => {
        console.log('👤 ProfileComponent: Profile data loaded from API:', user);

        this.currentUser = user;
        this.setProfileDataFromUser(user);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('👤 ProfileComponent: Error loading profile:', error);

        // If API fails, try to use localStorage data as fallback
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          console.warn(
            '👤 ProfileComponent: Using localStorage data as fallback'
          );
          this.currentUser = currentUser;
          this.setProfileDataFromUser(currentUser);
        } else {
          console.warn(
            '👤 ProfileComponent: No data available, redirecting to login'
          );
          this.router.navigate(['/login']);
        }
        this.isLoading = false;
      },
    });
  }

  private setProfileDataFromUser(user: any) {
    this.profileData = {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      email: user.email || '',
    };
    console.log('👤 ProfileComponent: Profile data set:', this.profileData);
  }

  // Profile update methods
  updateProfile() {
    if (!this.validateProfileData()) {
      return;
    }

    this.isSaving = true;
    this.userService.updateProfile(this.profileData).subscribe({
      next: (updatedUser) => {
        console.log(updatedUser);

        this.isSaving = false;
        this.toastService.success('✅ Profile updated successfully!');
        // Update current user in auth service
        this.authService.updateCurrentUser(updatedUser);
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error updating profile:', error);
        this.toastService.error(
          '❌ Failed to update profile. Please try again'
        );
      },
    });
  }

  validateProfileData(): boolean {
    if (!this.profileData.first_name.trim()) {
      this.toastService.error('👤 First name is required');
      return false;
    }
    if (!this.profileData.last_name.trim()) {
      this.toastService.error('👤 Last name is required');
      return false;
    }
    if (!this.profileData.username.trim()) {
      this.toastService.error('🏷️ Username is required');
      return false;
    }
    if (this.profileData.first_name.length > 25) {
      this.toastService.error('📏 First name must be 25 characters or less');
      return false;
    }
    if (this.profileData.last_name.length > 25) {
      this.toastService.error('📏 Last name must be 25 characters or less');
      return false;
    }
    return true;
  }

  // Password change methods
  changePassword() {
    if (!this.validatePasswordData()) {
      return;
    }

    const passwordPayload = {
      current_password: this.passwordData.current_password,
      new_password: this.passwordData.new_password,
      new_password_confirmation: this.passwordData.confirm_password,
    };

    this.isSaving = true;
    this.authService.changePassword(passwordPayload).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastService.success('🔐 Password changed successfully!');
        this.resetPasswordForm();
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error changing password:', error);
        this.toastService.error(
          '🔐 Failed to change password. Please check your current password'
        );
      },
    });
  }

  validatePasswordData(): boolean {
    console.log('🔍 Validating password data:', {
      current_password: this.passwordData.current_password
        ? 'present'
        : 'missing',
      new_password: this.passwordData.new_password ? 'present' : 'missing',
      confirm_password: this.passwordData.confirm_password
        ? 'present'
        : 'missing',
    });

    if (!this.passwordData.current_password) {
      this.toastService.error('🔐 Current password is required');
      return false;
    }
    if (!this.passwordData.new_password) {
      this.toastService.error('🔑 New password is required');
      return false;
    }
    if (!this.passwordData.confirm_password) {
      this.toastService.error('🔒 Please confirm your new password');
      return false;
    }
    if (this.passwordData.new_password !== this.passwordData.confirm_password) {
      this.toastService.error('❌ New passwords do not match');
      return false;
    }

    return true;
  }

  isPasswordStrong(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  resetPasswordForm() {
    this.passwordData = {
      current_password: '',
      new_password: '',
      confirm_password: '',
    };
    this.passwordStrength = '';
    this.passwordMatch = '';
  }

  // UI helper methods
  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  onPasswordInput() {
    this.updatePasswordStrength();
    this.checkPasswordMatch();
  }

  updatePasswordStrength() {
    const password = this.passwordData.new_password;
    if (!password) {
      this.passwordStrength = '';
      return;
    }

    const strength = this.calculatePasswordStrength(password);
    this.passwordStrength = strength;
  }

  calculatePasswordStrength(password: string): string {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        return 'Very Weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Fair';
      case 4:
        return 'Good';
      case 5:
        return 'Strong';
      default:
        return '';
    }
  }

  checkPasswordMatch() {
    if (!this.passwordData.confirm_password) {
      this.passwordMatch = '';
      return;
    }

    if (this.passwordData.new_password === this.passwordData.confirm_password) {
      this.passwordMatch = 'Passwords match';
    } else {
      this.passwordMatch = 'Passwords do not match';
    }
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const firstInitial = this.currentUser.first_name?.charAt(0) || '';
    const lastInitial = this.currentUser.last_name?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  }

  deleteAccount() {
    this.showDeleteModal = true;
  }

  onDeleteConfirm() {
    this.isDeleting = true;

    this.userService.deleteAccount().subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.toastService.success('🗑️ Account deleted successfully');
        // Small delay to show success message before logout
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (error) => {
        this.isDeleting = false;
        console.error('Error deleting account:', error);

        // Show specific error message if available
        const errorMessage =
          error.error?.message || error.message || 'Unknown error occurred';
        this.toastService.error(`❌ Failed to delete account: ${errorMessage}`);
      },
    });
  }

  onDeleteCancel() {
    this.showDeleteModal = false;
    this.isDeleting = false;
  }
}
