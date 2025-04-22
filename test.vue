<template>
    <view class="login-container">
        <!-- 背景图案 -->
        <view class="background-pattern"></view>

        <!-- 左侧插画区域 - 仅在较大屏幕显示 -->
        <view class="illustration-container">
            <image class="main-illustration" src="/static/images/auth/meditation-illustration.svg" mode="aspectFit">
            </image>
            <view class="brand-message">
                <text class="brand-title">心灵的陪伴，从这里开始</text>
                <text class="brand-description">记录情绪，获得支持，找到内心的平静</text>
            </view>
        </view>

        <!-- 右侧表单区域 -->
        <view class="form-container">
            <!-- Logo和标题 -->
            <view class="header">
                <image src="/static/images/logo.png" class="logo" mode="aspectFit"></image>
                <text class="app-name">Uniheart-有你才好</text>
                <text class="app-description">一款一站式全包的心理健康平台</text>
            </view>

            <!-- 切换标签 -->
            <view class="tab-container">
                <view class="tab" :class="{ active: activeTab === 'login' }" @click="changeTab('login')">
                    <text>登录</text>
                </view>
                <view class="tab" :class="{ active: activeTab === 'register' }" @click="changeTab('register')">
                    <text>注册</text>
                </view>
                <view class="tab-indicator" :class="activeTab === 'login' ? 'left' : 'right'"></view>
            </view>

            <!-- 登录表单 -->
            <view v-if="activeTab === 'login'" class="form">
                <view class="input-group">
                    <view class="input-icon">
                        <uni-icons type="person" size="20" color="#8B5CF6"></uni-icons>
                    </view>
                    <input class="input" type="text" v-model="loginForm.username" placeholder="请输入用户名" />
                </view>

                <view class="input-group">
                    <view class="input-icon">
                        <uni-icons type="locked" size="20" color="#8B5CF6"></uni-icons>
                    </view>
                    <input class="input" :password="!showPassword" v-model="loginForm.password" placeholder="请输入密码" />
                    <text class="password-toggle" @click="showPassword = !showPassword">
                        {{ showPassword ? '隐藏' : '显示' }}
                    </text>
                </view>

                <view class="form-actions">
                    <label class="remember-label">
                        <switch :checked="rememberMe" @change="rememberMe = !rememberMe" color="#8B5CF6"
                            style="transform: scale(0.8);" />
                        <text class="remember-text">记住我</text>
                    </label>
                    <text class="forgot-password" @click="forgotPassword">忘记密码?</text>
                </view>

                <button class="submit-button" @click="handleLogin" :disabled="isLoading" @touchstart="addRippleEffect">
                    {{ isLoading ? '登录中...' : '登录' }}
                </button>

                <view class="divider">
                    <text class="divider-text">或者</text>
                </view>

                <button class="test-account-button" @click="loginWithTestUser">
                    使用测试账号登录
                </button>
            </view>

            <!-- 注册表单 -->
            <view v-if="activeTab === 'register'" class="form">
                <view class="input-group">
                    <view class="input-icon">
                        <uni-icons type="person" size="20" color="#8B5CF6"></uni-icons>
                    </view>
                    <input class="input" type="text" v-model="registerForm.username" placeholder="请输入用户名 (4-16个字符)" />
                </view>

                <view class="input-group">
                    <view class="input-icon">
                        <uni-icons type="email" size="20" color="#8B5CF6"></uni-icons>
                    </view>
                    <input class="input" type="text" v-model="registerForm.email" placeholder="请输入邮箱" />
                </view>

                <view class="input-group">
                    <view class="input-icon">
                        <uni-icons type="locked" size="20" color="#8B5CF6"></uni-icons>
                    </view>
                    <input class="input" :password="!showRegisterPassword" v-model="registerForm.password"
                        placeholder="请输入密码 (至少8位)" />
                    <text class="password-toggle" @click="showRegisterPassword = !showRegisterPassword">
                        {{ showRegisterPassword ? '隐藏' : '显示' }}
                    </text>
                </view>

                <view class="input-group">
                    <view class="input-icon">
                        <uni-icons type="locked" size="20" color="#8B5CF6"></uni-icons>
                    </view>
                    <input class="input" :password="!showConfirmPassword" v-model="registerForm.confirmPassword"
                        placeholder="请再次输入密码" />
                    <text class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                        {{ showConfirmPassword ? '隐藏' : '显示' }}
                    </text>
                </view>

                <view class="verification-group">
                    <view class="input-icon">
                        <uni-icons type="checkmarkempty" size="20" color="#8B5CF6"></uni-icons>
                    </view>
                    <input class="verification-input" type="text" v-model="registerForm.code" placeholder="请输入验证码" />
                    <button class="verification-button" @click="sendCode" :disabled="codeSending || codeCountdown > 0">
                        <text v-if="codeCountdown > 0">{{ codeCountdown }}秒</text>
                        <text v-else-if="codeSending">发送中...</text>
                        <text v-else>获取验证码</text>
                    </button>
                </view>

                <view class="terms-agreement">
                    <switch :checked="agreeTerms" @change="agreeTerms = !agreeTerms" color="#8B5CF6"
                        style="transform: scale(0.8);" />
                    <text class="terms-text">
                        我已阅读并同意
                        <text class="terms-link">用户协议</text>
                        和
                        <text class="terms-link">隐私政策</text>
                    </text>
                </view>

                <button class="submit-button" @click="handleRegister" :disabled="isLoading"
                    @touchstart="addRippleEffect">
                    {{ isLoading ? '注册中...' : '注册' }}
                </button>
            </view>

            <!-- 底部装饰元素 -->
            <view class="decoration-dots">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
            </view>
        </view>
    </view>
</template>

<script>
// 保留原有的JavaScript代码，不做修改
import { login, register, sendVerificationCode } from '@/api/auth';
import { isLateNight } from '@/utils/device';
import { trackActivity, EventTypes } from '@/utils/tracker';

export default {
    data() {
        return {
            activeTab: 'login',
            loginForm: {
                username: '',
                password: ''
            },
            registerForm: {
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                code: ''
            },
            showPassword: false,
            showRegisterPassword: false,
            showConfirmPassword: false,
            rememberMe: false,
            agreeTerms: false,
            isLoading: false,
            codeSending: false,
            codeCountdown: 0
        }
    },
    mounted() {
        try {
            const rememberedUsername = uni.getStorageSync('remembered_username');
            if (rememberedUsername) {
                this.loginForm.username = rememberedUsername;
                this.rememberMe = true;
            }
        } catch (e) {
            console.error('获取存储的用户名失败', e);
        }
    },
    methods: {
        changeTab(tab) {
            this.activeTab = tab;
        },
        addRippleEffect(event) {
            const button = event.currentTarget;
            const rect = button.getBoundingClientRect();
            const x = event.touches[0].clientX - rect.left;
            const y = event.touches[0].clientY - rect.top;

            const ripple = document.createElement('view');
            ripple.className = 'ripple-effect';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.transform = 'translate(-50%, -50%)';

            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        },
        async handleLogin() {
            console.log('登录表单数据:', this.loginForm);

            if (!this.loginForm.username || !this.loginForm.password) {
                uni.showToast({
                    title: '请输入用户名和密码',
                    icon: 'none'
                });
                return;
            }

            try {
                this.isLoading = true;
                const result = await login({
                    username: this.loginForm.username,
                    password: this.loginForm.password
                });

                console.log('登录结果:', result);

                try {
                    const tokenParts = result.data.token.split('.');
                    const payload = JSON.parse(atob(tokenParts[1]));
                    const userId = payload.sub || payload.id || payload.userId;
                    uni.setStorageSync('userId', userId);
                } catch (error) {
                    console.error('解析token出错', error);
                }

                if (result && result.data && result.data.token) {
                    uni.setStorageSync('token', result.data.token);
                    uni.setStorageSync('remembered_username', this.loginForm.username);

                    trackActivity({
                        event_type: EventTypes.LOGIN,
                        event_details: {
                            username: this.loginForm.username,
                            rememberMe: this.rememberMe
                        }
                    });

                    if (isLateNight()) {
                        uni.showModal({
                            title: '温馨提示',
                            content: '深夜了，记得及时休息哦！保持良好的作息习惯有助于身心健康。',
                            showCancel: false,
                            confirmText: '我知道了'
                        });
                    }

                    uni.showToast({
                        title: '登录成功',
                        icon: 'success'
                    });

                    setTimeout(() => {
                        uni.switchTab({
                            url: '/pages/index/index'
                        });
                    }, 750);
                } else {
                    throw new Error('登录失败，请稍后再试');
                }
            } catch (error) {
                console.error('登录错误:', error);
                uni.showToast({
                    title: error.message || '登录失败，请稍后再试',
                    icon: 'none'
                });
            } finally {
                this.isLoading = false;
            }
        },
        async handleRegister() {
            console.log('注册表单数据:', this.registerForm);

            if (!this.registerForm.username || !this.registerForm.email ||
                !this.registerForm.password || !this.registerForm.confirmPassword) {
                uni.showToast({
                    title: '请填写完整的注册信息',
                    icon: 'none'
                });
                return;
            }

            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                uni.showToast({
                    title: '两次输入的密码不一致',
                    icon: 'none'
                });
                return;
            }

            if (this.registerForm.username.length < 4 || this.registerForm.username.length > 16) {
                uni.showToast({
                    title: '用户名长度应为4-16个字符',
                    icon: 'none'
                });
                return;
            }

            if (this.registerForm.password.length < 8) {
                uni.showToast({
                    title: '密码长度至少为8位',
                    icon: 'none'
                });
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.registerForm.email)) {
                uni.showToast({
                    title: '请输入有效的邮箱地址',
                    icon: 'none'
                });
                return;
            }

            if (!this.registerForm.code) {
                uni.showToast({
                    title: '请输入验证码',
                    icon: 'none'
                });
                return;
            }

            if (!this.agreeTerms) {
                uni.showToast({
                    title: '请阅读并同意用户协议和隐私政策',
                    icon: 'none'
                });
                return;
            }

            try {
                this.isLoading = true;
                await register({
                    username: this.registerForm.username,
                    email: this.registerForm.email,
                    password: this.registerForm.password,
                    code: this.registerForm.code
                });

                uni.showToast({
                    title: '注册成功，请登录',
                    icon: 'success'
                });

                setTimeout(() => {
                    this.activeTab = 'login';
                    this.loginForm.username = this.registerForm.username;
                }, 1500);
            } catch (error) {
                console.error('注册错误:', error);
                uni.showToast({
                    title: error.message || '注册失败，请稍后再试',
                    icon: 'none'
                });
            } finally {
                this.isLoading = false;
            }
        },
        async sendCode() {
            console.log('发送验证码到:', this.registerForm.email);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.registerForm.email)) {
                uni.showToast({
                    title: '请输入有效的邮箱地址',
                    icon: 'none'
                });
                return;
            }

            try {
                this.codeSending = true;
                await sendVerificationCode(this.registerForm.email);

                uni.showToast({
                    title: '验证码已发送',
                    icon: 'success'
                });

                this.codeCountdown = 60;
                const timer = setInterval(() => {
                    this.codeCountdown--;
                    if (this.codeCountdown <= 0) {
                        clearInterval(timer);
                    }
                }, 1000);
            } catch (error) {
                console.error('发送验证码错误:', error);
                uni.showToast({
                    title: error.message || '验证码发送失败',
                    icon: 'none'
                });
            } finally {
                this.codeSending = false;
            }
        },
        forgotPassword() {
            uni.navigateTo({
                url: '/pages/auth/forgot-password'
            });
        },
        loginWithTestUser() {
            this.loginForm.username = 'testuser';
            this.loginForm.password = 'password123';
            this.handleLogin();
        }
    }
}
</script>

<style>
.login-container {
    display: flex;
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    background-color: #f7f7ff;
}

.background-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCw0LTEuNzkgNC00em0wLTE4YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDRzNC0xLjc5IDQtNHptMCAzNmMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTE4LTE4YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xOGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAgMzZjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0tMzYtMThjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTE4YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMCAzNmMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=');
    opacity: 0.5;
}

.illustration-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
    background: linear-gradient(135deg, #a78bfa, #6d28d9);
    color: white;
}

@media screen and (max-width: 768px) {
    .illustration-container {
        display: none;
    }

    .login-container {
        justify-content: center;
    }
}

.main-illustration {
    width: 75%;
    max-width: 400px;
    height: auto;
    margin-bottom: 30px;
    animation: float 6s ease-in-out infinite;
}

.brand-message {
    text-align: center;
    max-width: 400px;
}

.brand-title {
    display: block;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 12px;
}

.brand-description {
    display: block;
    font-size: 16px;
    opacity: 0.9;
    line-height: 1.6;
}

.form-container {
    width: 100%;
    max-width: 450px;
    padding: 40px;
    background-color: white;
    border-radius: 20px 0 0 20px;
    box-shadow: -10px 0 30px rgba(106, 64, 214, 0.1);
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
}

.header {
    text-align: center;
    margin-bottom: 30px;
}

.logo {
    width: 70px;
    height: 70px;
    border-radius: 16px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.app-name {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: #4c1d95;
    margin-bottom: 6px;
}

.app-description {
    display: block;
    font-size: 14px;
    color: #6b7280;
}

.tab-container {
    display: flex;
    border-radius: 10px;
    background-color: #f3f4f6;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
}

.tab {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    font-weight: 500;
    color: #6b7280;
    position: relative;
    z-index: 2;
    transition: color 0.3s;
    cursor: pointer;
}

.tab.active {
    color: #4c1d95;
    font-weight: 600;
}

.tab-indicator {
    position: absolute;
    height: 100%;
    width: 50%;
    background-color: white;
    top: 0;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
}

.tab-indicator.left {
    transform: translateX(0);
}

.tab-indicator.right {
    transform: translateX(100%);
}

.form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: fade-in 0.4s ease-out;
}

.input-group {
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background-color: #f9fafb;
    transition: all 0.3s;
}

.input-group:focus-within {
    border-color: #8b5cf6;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.input-icon {
    padding: 0 12px;
    color: #8b5cf6;
}

.input {
    flex: 1;
    height: 48px;
    border: none;
    background: transparent;
    padding: 0 12px 0 0;
    font-size: 15px;
    color: #4b5563;
}

.password-toggle {
    padding: 0 16px;
    font-size: 14px;
    color: #8b5cf6;
    font-weight: 500;
}

.form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.remember-label {
    display: flex;
    align-items: center;
}

.remember-text {
    font-size: 14px;
    color: #6b7280;
}

.forgot-password {
    font-size: 14px;
    color: #8b5cf6;
    font-weight: 500;
}

.submit-button {
    height: 48px;
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
}

.submit-button:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

.divider {
    position: relative;
    margin: 20px 0;
    text-align: center;
}

.divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #e5e7eb;
}

.divider-text {
    position: relative;
    background-color: white;
    padding: 0 16px;
    color: #9ca3af;
    font-size: 14px;
}

.test-account-button {
    height: 48px;
    background-color: white;
    color: #8b5cf6;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-weight: 500;
    transition: background-color 0.2s;
}

.test-account-button:active {
    background-color: #f3f4f6;
}

.verification-group {
    display: flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background-color: #f9fafb;
    overflow: hidden;
}

.verification-input {
    flex: 1;
    height: 48px;
    border: none;
    background: transparent;
    font-size: 15px;
    color: #4b5563;
}

.verification-button {
    min-width: 110px;
    height: 48px;
    background-color: #8b5cf6;
    color: white;
    border: none;
    font-size: 14px;
    font-weight: 500;
}

.verification-button:disabled {
    background-color: #c4b5fd;
}

.terms-agreement {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.terms-text {
    font-size: 14px;
    color: #6b7280;
    margin-left: 4px;
}

.terms-link {
    color: #8b5cf6;
    font-weight: 500;
}

.decoration-dots {
    position: absolute;
    display: flex;
    bottom: 24px;
    right: 24px;
    gap: 8px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #8b5cf6;
    opacity: 0.2;
}

.dot:nth-child(2) {
    opacity: 0.4;
}

.dot:nth-child(3) {
    opacity: 0.6;
}

.ripple-effect {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    animation: ripple 0.6s linear;
    pointer-events: none;
}

@keyframes ripple {
    to {
        transform: scale(35);
        opacity: 0;
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-15px);
    }
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式调整 */
@media screen and (max-width: 480px) {
    .form-container {
        padding: 30px 20px;
        border-radius: 0;
        box-shadow: none;
    }

    .logo {
        width: 60px;
        height: 60px;
    }

    .app-name {
        font-size: 20px;
    }

    .app-description {
        font-size: 12px;
    }
}
</style>