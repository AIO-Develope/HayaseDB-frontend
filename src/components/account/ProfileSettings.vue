<template>
  <div class="profile-settings background-card">
    <div v-if="loading" class="loading-overlay">
      <img class="loading-icon rotate-scale" src="../../assets/nagatoro_loading.png" alt="Loading" />
    </div>

    <h1>Profile Settings</h1>
    <form  @submit.prevent="submitForm">

      <div class="form-header">
        <div class="form-header-left">
          <!-- Profile Picture -->
          <div class="form-group profile-picture-container">
            <label class="profile-picture-upload">
              <img :src="profilePicture" alt="Profile Picture" class="profile-picture-preview" />
              <input type="file" id="profile-picture" @change="handlePictureChange" accept="image/*" class="file-input" />
              <span class="change-pfp-message">Change Profile Picture</span>
            </label>
          </div>
        </div>
        <div class="form-header-right">

          <!-- Username -->
          <div class="form-group">
            <label for="username" class="text">Username</label>
            <input
                autocomplete="false" 
                readonly
                onfocus="this.removeAttribute('readonly');"
                type="text"
                id="username"
                v-model="username"
                class="input-field"
                :placeholder="currentUser.username || 'Username'"
                :aria-invalid="errors.username ? 'true' : 'false'"
                aria-describedby="username-error"
            />
            <p v-if="errors.username" id="username-error" class="error-message">{{ errors.username }}</p>
          </div>

          <!-- Roles -->
          <div class="form-group">
            <label class="text">Roles</label>
            <div class="roles-tags">
              <span v-for="role in roles" :key="role" class="role-tag">{{ role }}</span>
              <p v-if="roles.length === 0" class="no-roles-message">No roles assigned.</p>
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email" class="text">Email</label>
            <input
                autocomplete="false" 
                readonly
                onfocus="this.removeAttribute('readonly');"
                type="email"
                id="email"
                v-model="email"
                class="input-field"
                :placeholder="currentUser.email || 'Email Address'"
                :aria-invalid="errors.email ? 'true' : 'false'"
                aria-describedby="email-error"
            />
            <p v-if="errors.email" id="email-error" class="error-message">{{ errors.email }}</p>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <!-- Old Password -->
        <div class="form-group">
          <label for="password" class="text">Old Password</label>
          <input
              autocomplete="false" 
              readonly
              onfocus="this.removeAttribute('readonly');"
              type="password"
              id="password"
              v-model="password"
              class="input-field"
              placeholder="Enter old password"
              :aria-invalid="errors.password ? 'true' : 'false'"
              aria-describedby="password-error"
          />
          <p v-if="errors.password" id="password-error" class="error-message">{{ errors.password }}</p>
        </div>

        <!-- New Password and Confirm Password -->
        <div class="password-group">
          <div class="form-group">
            <label for="new-password" class="text">New Password</label>
            <input
                autocomplete="false" 
                readonly
                onfocus="this.removeAttribute('readonly');"
                type="password"
                id="new-password"
                v-model="newPassword"
                class="input-field"
                placeholder="Enter new password"
                :aria-invalid="errors.newPassword ? 'true' : 'false'"
                aria-describedby="new-password-error"
            />
            <p v-if="errors.newPassword" id="new-password-error" class="error-message">{{ errors.newPassword }}</p>
          </div>
          <div class="form-group">
            <label for="confirm-password" class="text">Confirm Password</label>
            <input
                autocomplete="false" 
                readonly
                onfocus="this.removeAttribute('readonly');"
                type="password"
                id="confirm-password"
                v-model="confirmPassword"
                class="input-field"
                placeholder="Re-enter new password"
                :aria-invalid="errors.confirmPassword ? 'true' : 'false'"
                aria-describedby="confirm-password-error"
            />
            <p v-if="errors.confirmPassword" id="confirm-password-error" class="error-message">{{ errors.confirmPassword }}</p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="form-group submit-group">
        <button type="submit" class="btn-primary btn-save rounded-lg">Save Changes</button>
        <p v-if="submissionError" class="error-message">{{ submissionError }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>
    </form>
  </div>
</template>


<script>
import { checkToken } from '@/services/authService';
import { updateUserCredentials, uploadProfilePicture } from '@/services/userService';

export default {
  data() {
    return {
      profilePicture: '',
      username: '',
      email: '',
      roles: [],
      password: '',
      newPassword: '',
      confirmPassword: '',
      errors: {},
      submissionError: '',
      successMessage: '',
      loading: true,
      currentUser: {},
      selectedFile: null,
    };
  },
  async created() {
    await this.fetchUserCredentials()
  },
  methods: {
    async fetchUserCredentials() {
  try {
    const userInfo = await checkToken();
    this.currentUser = userInfo.user || {};
    this.username = '';
    this.email = '';
    this.roles = this.currentUser.roles || [];
    this.profilePicture = this.currentUser.profilePicture + '?t=' + new Date().getTime();
    this.loading = false;
  } catch (error) {
    this.submissionError = 'Failed to load user information. Please try again later.';
    this.loading = false;
  }
},

handlePictureChange(event) {
    const file = event.target.files[0];
    if (file) {
      if (this.profilePictureUrl) {
        URL.revokeObjectURL(this.profilePictureUrl);
      }
      this.selectedFile = file;
      this.profilePictureUrl = URL.createObjectURL(file);
      this.profilePicture = this.profilePictureUrl;
    }
  },
    validateForm() {
      this.errors = {};

      if (this.newPassword || this.confirmPassword) {
        if (!this.password) this.errors.password = 'Old password is required.';
        if (!this.newPassword) this.errors.newPassword = 'New password is required.';
        if (this.newPassword !== this.confirmPassword) this.errors.confirmPassword = 'Passwords do not match.';
      }

      return Object.keys(this.errors).length === 0;
    },
    async submitForm() {
  if (this.validateForm()) {
    try {
      this.loading = true;

      const formData = new FormData();
      if (this.selectedFile) {
        formData.append('profilePicture', this.selectedFile);
        await uploadProfilePicture(this.selectedFile);
      }

      await updateUserCredentials(
        this.password,
        this.newPassword,
        this.username,
        this.email
      );

      this.submissionError = '';
      
      window.location.reload();

    } catch (error) {
      this.submissionError = error.message;
    } finally {
      this.loading = false;
    }
  } else {
    this.submissionError = 'Please fix the errors above and try again.';
  }
}}

};
</script>


<style scoped>
.profile-settings {

  max-width: 800px;
  margin: 0 auto 50px;
  width: 100%;
  padding: 30px;
  box-sizing: border-box;
  position: relative;
}

h1 {
  font-size: var(--text-2xl);
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 0.7em;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.profile-picture-container {
  text-align: center;
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
}


.profile-picture-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 20px;
}

.profile-picture-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  transition: transform 0.3s ease;
}

.file-input {
  display: none;
}

.change-pfp-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  opacity: 0;
  transition: opacity 0.3s ease;
  text-align: center;
  padding: 40px;
  overflow: hidden;
}

.profile-picture-upload:hover .change-pfp-message {
  opacity: 1;
}

.input-field {
  padding: 12px;
  font-size: var(--text-base);
  border-radius: var(--border-radius-md);
  transition: box-shadow 0.3s ease;
  width: 100%;
  box-sizing: border-box;

}

.input-field:focus {
  box-shadow: 0 0 0 3px var(--primary-400);
}

.error-message {
  color: var(--danger);
  position: relative;
  font-size: var(--text-sm);
  margin-top: 0.5em;
}

.submit-group {
  text-align: center;
}

.btn-save {
  padding: 12px;
  font-size: var(--text-base);
  font-weight: bold;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.btn-save:hover {
  background-color: var(--primary-500);
  box-shadow: var(--shadow-lg);
}

.password-group {
  display: flex;
  gap: 20px;
  flex-direction: row;
  width: 100%;
  box-sizing: border-box;
}

.form-footer {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-header {
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
}

.form-header-right {
  flex: 1;
}

.form-header-left {
  flex: 0 0 auto;
  width: 30%;
}

.roles-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.role-tag {
  background-color: var(--primary-200);
  padding: 6px 12px;
  border-radius: var(--border-radius-md);
  font-size: var(--text-sm);
  display: inline-block;
}

.no-roles-message {
  color: var(--accent);
  font-size: var(--text-sm);
}

@media (max-width: 500px) {
  .form-header {
    flex-direction: column;
  }

  .form-header-left, .form-header-right {
    flex: 1;
    width: 100%;
    margin-bottom: 20px;
  }

  .password-group {
    flex-direction: column;
    gap: 0;
  }
}


.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: var(--border-radius-lg);
}

.loading-icon {
  width: 80px;
  height: 80px;
}



.success-message {
  color: var(--success);
  position: relative;
  font-size: var(--text-sm);
  margin-top: 0.5em;
}

</style>
