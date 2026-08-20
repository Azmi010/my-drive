import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

function serialize(value: unknown): unknown {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value)) {
      result[key] = serialize(val);
    }

    return result;
  }

  return value;
}

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(serialize));
  }
}
