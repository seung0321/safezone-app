// src/api/errors.ts
/**
 * 백엔드 에러 코드와 매칭되는 프론트엔드 에러 클래스
 */

export class ApiError extends Error {
  statusCode: number;
  error: string;

  constructor(message: string, statusCode: number, error: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

/**
 * 400 Bad Request
 * 백엔드: BadRequestError
 */
export class BadRequestError extends ApiError {
  constructor(message: string = '잘못된 요청입니다.') {
    super(message, 400, 'BadRequest');
    this.name = 'BadRequestError';
  }
}

/**
 * 401 Unauthorized
 * 백엔드: UnauthorizedError
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = '인증이 필요합니다.') {
    super(message, 401, 'Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden
 * 백엔드: ForbiddenError
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = '권한이 없습니다.') {
    super(message, 403, 'Forbidden');
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found
 * 백엔드: NotFoundError
 */
export class NotFoundError extends ApiError {
  constructor(message: string = '요청한 리소스를 찾을 수 없습니다.') {
    super(message, 404, 'NotFound');
    this.name = 'NotFoundError';
  }
}

/**
 * 409 Conflict
 * 백엔드: ConflictError
 */
export class ConflictError extends ApiError {
  constructor(message: string = '이미 존재하는 데이터입니다.') {
    super(message, 409, 'Conflict');
    this.name = 'ConflictError';
  }
}

/**
 * 네트워크 에러
 */
export class NetworkError extends Error {
  constructor(message: string = '네트워크 연결을 확인해주세요.') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * 에러 타입 체크 헬퍼 함수
 */
export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const isBadRequestError = (error: any): error is BadRequestError => {
  return error instanceof BadRequestError;
};

export const isUnauthorizedError = (error: any): error is UnauthorizedError => {
  return error instanceof UnauthorizedError;
};

export const isForbiddenError = (error: any): error is ForbiddenError => {
  return error instanceof ForbiddenError;
};

export const isNotFoundError = (error: any): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isConflictError = (error: any): error is ConflictError => {
  return error instanceof ConflictError;
};

export const isNetworkError = (error: any): error is NetworkError => {
  return error instanceof NetworkError;
};

/**
 * 에러 메시지 추출 (사용자 친화적)
 */
export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (isNetworkError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * 에러 타입별 처리
 */
export const handleApiError = (error: any, customHandlers?: {
  onBadRequest?: (error: BadRequestError) => void;
  onUnauthorized?: (error: UnauthorizedError) => void;
  onForbidden?: (error: ForbiddenError) => void;
  onNotFound?: (error: NotFoundError) => void;
  onConflict?: (error: ConflictError) => void;
  onNetwork?: (error: NetworkError) => void;
  onDefault?: (error: Error) => void;
}) => {
  if (isBadRequestError(error) && customHandlers?.onBadRequest) {
    customHandlers.onBadRequest(error);
  } else if (isUnauthorizedError(error) && customHandlers?.onUnauthorized) {
    customHandlers.onUnauthorized(error);
  } else if (isForbiddenError(error) && customHandlers?.onForbidden) {
    customHandlers.onForbidden(error);
  } else if (isNotFoundError(error) && customHandlers?.onNotFound) {
    customHandlers.onNotFound(error);
  } else if (isConflictError(error) && customHandlers?.onConflict) {
    customHandlers.onConflict(error);
  } else if (isNetworkError(error) && customHandlers?.onNetwork) {
    customHandlers.onNetwork(error);
  } else if (customHandlers?.onDefault) {
    customHandlers.onDefault(error);
  }
};