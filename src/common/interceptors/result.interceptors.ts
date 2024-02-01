import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data) {
          return { result: { message: 'Nothing found!' } };
        }
        return { result: validate(data) };
      }),
    );
  }
}

const validate = (data: any) => {
  if (data?.password || data?.authCode) {
    const { password, authCode, ...rest } = data.toJSON();
    return rest;
  }
  return data;
};
