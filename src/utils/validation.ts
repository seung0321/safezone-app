// src/utils/validation.ts
/**
 * 백엔드 유효성 검사 규칙과 동일하게 구현
 * authStruct.js, emailStruct.js 기반
 */

// 정규식 (백엔드와 동일)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;

/**
 * 이메일 유효성 검사
 */
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email) {
    return { valid: false, message: '이메일을 입력해주세요.' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: '이메일 형식이 올바르지 않습니다.' };
  }
  
  return { valid: true };
};

/**
 * 비밀번호 유효성 검사
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: '비밀번호를 입력해주세요.' };
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return { valid: false, message: '비밀번호는 영문과 특수문자를 포함한 8~16자여야 합니다.' };
  }
  
  return { valid: true };
};

/**
 * 비밀번호 확인 검사
 */
export const validatePasswordConfirm = (
  password: string,
  confirmPassword: string
): { valid: boolean; message?: string } => {
  if (!confirmPassword) {
    return { valid: false, message: '비밀번호 확인을 입력해주세요.' };
  }
  
  if (password !== confirmPassword) {
    return { valid: false, message: '비밀번호가 일치하지 않습니다.' };
  }
  
  return { valid: true };
};

/**
 * 이름 유효성 검사
 */
export const validateName = (name: string): { valid: boolean; message?: string } => {
  if (!name) {
    return { valid: false, message: '이름을 입력해주세요.' };
  }
  
  if (name.length < 1 || name.length > 10) {
    return { valid: false, message: '이름은 1~10자 이내로 입력해야 합니다.' };
  }
  
  return { valid: true };
};

/**
 * 닉네임 유효성 검사
 */
export const validateNickname = (nickname: string): { valid: boolean; message?: string } => {
  if (!nickname) {
    return { valid: false, message: '닉네임을 입력해주세요.' };
  }
  
  if (nickname.length < 1 || nickname.length > 15) {
    return { valid: false, message: '닉네임은 1~15자 이내로 입력해야 합니다.' };
  }
  
  return { valid: true };
};

/**
 * 주소 유효성 검사
 */
export const validateAddress = (address: string): { valid: boolean; message?: string } => {
  if (!address) {
    return { valid: false, message: '주소를 입력해주세요.' };
  }
  
  if (address.length < 1 || address.length > 50) {
    return { valid: false, message: '주소는 1~50자 이내로 입력해야 합니다.' };
  }
  
  return { valid: true };
};

/**
 * 전화번호 유효성 검사 (기본)
 */
export const validatePhone = (phone: string): { valid: boolean; message?: string } => {
  if (!phone) {
    return { valid: false, message: '전화번호를 입력해주세요.' };
  }
  
  // 숫자만 추출
  const numbersOnly = phone.replace(/[^0-9]/g, '');
  
  if (numbersOnly.length < 10 || numbersOnly.length > 11) {
    return { valid: false, message: '올바른 전화번호를 입력해주세요.' };
  }
  
  return { valid: true };
};

/**
 * 인증 코드 유효성 검사
 */
export const validateCode = (code: string): { valid: boolean; message?: string } => {
  if (!code) {
    return { valid: false, message: '인증 코드를 입력해주세요.' };
  }
  
  if (code.length !== 6) {
    return { valid: false, message: '인증 코드는 6자리입니다.' };
  }
  
  return { valid: true };
};

/**
 * 회원가입 데이터 전체 검사
 */
export interface RegisterData {
  name: string;
  nickname: string;
  email: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export const validateRegisterData = (data: RegisterData): { valid: boolean; message?: string } => {
  // 이름 검사
  const nameCheck = validateName(data.name);
  if (!nameCheck.valid) return nameCheck;
  
  // 닉네임 검사
  const nicknameCheck = validateNickname(data.nickname);
  if (!nicknameCheck.valid) return nicknameCheck;
  
  // 이메일 검사
  const emailCheck = validateEmail(data.email);
  if (!emailCheck.valid) return emailCheck;
  
  // 주소 검사
  const addressCheck = validateAddress(data.address);
  if (!addressCheck.valid) return addressCheck;
  
  // 비밀번호 검사
  const passwordCheck = validatePassword(data.password);
  if (!passwordCheck.valid) return passwordCheck;
  
  // 비밀번호 확인 검사
  const confirmCheck = validatePasswordConfirm(data.password, data.confirmPassword);
  if (!confirmCheck.valid) return confirmCheck;
  
  return { valid: true };
};

/**
 * 로그인 데이터 검사
 */
export interface LoginData {
  email: string;
  password: string;
}

export const validateLoginData = (data: LoginData): { valid: boolean; message?: string } => {
  // 이메일 검사
  const emailCheck = validateEmail(data.email);
  if (!emailCheck.valid) return emailCheck;
  
  // 비밀번호 입력 확인 (형식 검사 X)
  if (!data.password) {
    return { valid: false, message: '비밀번호를 입력해주세요.' };
  }
  
  return { valid: true };
};

/**
 * 비밀번호 재설정 데이터 검사
 */
export interface ResetPasswordData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export const validateResetPasswordData = (data: ResetPasswordData): { valid: boolean; message?: string } => {
  // 이메일 검사
  const emailCheck = validateEmail(data.email);
  if (!emailCheck.valid) return emailCheck;
  
  // 새 비밀번호 검사
  const passwordCheck = validatePassword(data.newPassword);
  if (!passwordCheck.valid) return passwordCheck;
  
  // 비밀번호 확인 검사
  const confirmCheck = validatePasswordConfirm(data.newPassword, data.confirmPassword);
  if (!confirmCheck.valid) return confirmCheck;
  
  return { valid: true };
};

/**
 * 이메일 인증 코드 전송 데이터 검사
 */
export interface SendCodeData {
  email: string;
  purpose: 'register' | 'reset_password';
}

export const validateSendCodeData = (data: SendCodeData): { valid: boolean; message?: string } => {
  // 이메일 검사
  const emailCheck = validateEmail(data.email);
  if (!emailCheck.valid) return emailCheck;
  
  // 목적 검사
  if (!data.purpose || !['register', 'reset_password'].includes(data.purpose)) {
    return { valid: false, message: '올바른 목적이 아닙니다.' };
  }
  
  return { valid: true };
};

/**
 * 이메일 인증 코드 확인 데이터 검사
 */
export interface VerifyCodeData {
  email: string;
  code: string;
  purpose: 'register' | 'reset_password';
}

export const validateVerifyCodeData = (data: VerifyCodeData): { valid: boolean; message?: string } => {
  // 이메일 검사
  const emailCheck = validateEmail(data.email);
  if (!emailCheck.valid) return emailCheck;
  
  // 코드 검사
  const codeCheck = validateCode(data.code);
  if (!codeCheck.valid) return codeCheck;
  
  // 목적 검사
  if (!data.purpose || !['register', 'reset_password'].includes(data.purpose)) {
    return { valid: false, message: '올바른 목적이 아닙니다.' };
  }
  
  return { valid: true };
};

/**
 * 게시글 제목 검사
 */
export const validatePostTitle = (title: string): { valid: boolean; message?: string } => {
  if (!title || !title.trim()) {
    return { valid: false, message: '제목을 입력해주세요.' };
  }
  
  if (title.length > 100) {
    return { valid: false, message: '제목은 100자 이내로 입력해주세요.' };
  }
  
  return { valid: true };
};

/**
 * 게시글 내용 검사
 */
export const validatePostContent = (content: string): { valid: boolean; message?: string } => {
  if (!content || !content.trim()) {
    return { valid: false, message: '내용을 입력해주세요.' };
  }
  
  if (content.length > 5000) {
    return { valid: false, message: '내용은 5000자 이내로 입력해주세요.' };
  }
  
  return { valid: true };
};

/**
 * 댓글 내용 검사
 */
export const validateCommentContent = (content: string): { valid: boolean; message?: string } => {
  if (!content || !content.trim()) {
    return { valid: false, message: '댓글을 입력해주세요.' };
  }
  
  if (content.length > 500) {
    return { valid: false, message: '댓글은 500자 이내로 입력해주세요.' };
  }
  
  return { valid: true };
};