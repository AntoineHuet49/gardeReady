export class OperationResult<T> {
    public readonly success: boolean;
    public readonly message?: string;
    public readonly data?: T;
    public readonly errors?: any;
  
    private constructor(
      success: boolean,
      message?: string,
      data?: T,
      errors?: any
    ) {
      this.success = success;
      this.message = message;
      this.data = data;
      this.errors = errors;
    }
  
    static ok<T>(data?: T, message?: string): OperationResult<T> {
      return new OperationResult<T>(true, message, data);
    }
  
    static fail<T>(message: string, errors?: any): OperationResult<T> {
      return new OperationResult<T>(false, message, undefined, errors);
    }
  }
  