import { ApolloError } from 'apollo-server-errors';

export class CustomError extends ApolloError {
  constructor(status: string, message: string) {
    super(status, message);

    Object.defineProperty(this, 'name', { value: status });

    this.extensions = {
      ...this.extensions,
      status,
    };
  }
}
