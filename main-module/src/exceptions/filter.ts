import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHttpExceptionResponse } from './http.exceptions.response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorMessage: string | object;

    console.log('ПОЛУЧЕНА ОШИБКА ', exception);
    if (
      exception['name'] === 'HttpException' &&
      !(exception instanceof HttpException)
    )
      exception = new HttpException(exception['response'], exception['status']);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorMessage = exception.getResponse();
    } else {
      const { message, statusCode } = exception as {
        message: string;
        statusCode: number;
      };
      if (message) {
        errorMessage = message;
      } else {
        errorMessage = 'Произошла неизвестная ошибка отличная от HttpException';
      }

      if (statusCode) {
        status = statusCode;
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    const errorResponse = this.getErrorResponse(status, errorMessage, request);
    response.status(status).json(errorResponse);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string | object,
    request: Request,
  ): CustomHttpExceptionResponse => ({
    statusCode: status,
    error: errorMessage,
    path: request.url,
    method: request.method,
    timeStamp: new Date(),
  });
}
